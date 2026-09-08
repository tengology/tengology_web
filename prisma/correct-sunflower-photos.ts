import {config} from 'dotenv';
config({path:'.env.local',quiet:true});
import {writeFileSync} from 'node:fs';
import {PrismaClient} from '../src/generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const base='/products/sunflower/';
const group=['sunflower-accessories-flatlay-v2.jpeg','sunflower-headband-and-clips-flatlay-v2.jpeg','sunflower-headband-clips-closeup-v2.jpeg'];
const position='Headband at the top, small hair clip at the lower left, and brooch at the lower right.';
const plans=[
 {slug:'sunflower-felt-headband',files:group,short:'A layered yellow felt sunflower with green leaves on a brown ribbon-covered headband.',description:'A handmade sunflower headband with layered yellow felt petals, a textured brown centre and green leaves.\n\nIn the group photographs, the headband is the piece at the top. Price is for one headband; the brooch and small hair clip are sold separately.\n\nHandmade in Oxford.'},
 {slug:'sunflower-felt-brooch',files:['sunflower-brooch-front-v2.jpeg','sunflower-brooch-back-v2.jpeg',...group],short:'A handmade sunflower brooch with layered yellow felt petals and green leaves.',description:'A handmade sunflower brooch with layered yellow felt petals, a textured brown centre and green felt leaves, finished with a brooch pin.\n\nIn the group photographs, the brooch is the larger flower at the lower right. Price is for one brooch; the headband and small hair clip are sold separately.\n\nHandmade in Oxford.'},
 {slug:'sunflower-felt-hair-clip',files:group,short:'A small handmade sunflower hair clip with yellow felt petals and green leaves.',description:'A small sunflower hair clip with layered yellow felt petals, a textured brown centre and green leaves.\n\nIn the group photographs, the hair clip is the smaller flower at the lower left. Price is for one hair clip; the headband and brooch are sold separately.\n\nHandmade in Oxford.'},
];
async function main(){
 const slugs=[...plans.map(p=>p.slug),'sunflower-felt-barrette-clip'];
 const before=await db.product.findMany({where:{slug:{in:slugs}},include:{images:{orderBy:{sortOrder:'asc'}}}});
 if(before.length!==4)throw Error('Missing sunflower listing');
 for(const file of new Set(plans.flatMap(p=>p.files))){const r=await fetch('https://tengology.com'+base+file,{method:'HEAD',signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Missing photo '+file);}
 if(!process.argv.includes('--apply'))return;
 writeFileSync('/tmp/tengology-sunflower-before-'+Date.now()+'.json',JSON.stringify(before,null,2));
 await db.$transaction(async tx=>{
  for(const p of plans){
   const product=before.find(x=>x.slug===p.slug)!;
   const urls=p.files.map(f=>base+f);
   await tx.productImage.deleteMany({where:{productId:product.id,url:{notIn:urls}}});
   for(const [sortOrder,url]of urls.entries()){
    const old=product.images.find(i=>i.url===url);
    const altText=group.some(f=>url===base+f)?position:url.includes('back')?'Back of sunflower brooch showing its pin':'Sunflower brooch on ivory fabric';
    const data={sortOrder,isPrimary:sortOrder===0,altText};
    if(old)await tx.productImage.update({where:{id:old.id},data});
    else await tx.productImage.create({data:{...data,productId:product.id,url}});
   }
   await tx.product.update({where:{id:product.id},data:{shortDescription:p.short,fullDescription:p.description}});
  }
  const barrette=before.find(p=>p.slug==='sunflower-felt-barrette-clip')!;
  const wrong=barrette.images.filter(i=>group.some(f=>i.url===base+f)||i.url===base+'sunflower-headband-clips-linen-v2.jpeg');
  await tx.productImage.deleteMany({where:{id:{in:wrong.map(i=>i.id)}}});
  const rest=barrette.images.filter(i=>!wrong.some(w=>w.id===i.id));
  for(const [sortOrder,i]of rest.entries())await tx.productImage.update({where:{id:i.id},data:{sortOrder,isPrimary:sortOrder===0}});
 },{timeout:60000});
 const after=await db.product.findMany({where:{slug:{in:slugs}},include:{images:{orderBy:{sortOrder:'asc'}}}});
 for(const p of after){const old=before.find(x=>x.id===p.id)!;if(Number(p.price)!==Number(old.price)||p.stockCount!==old.stockCount)throw Error('Price or stock changed');if(p.images.filter(i=>i.isPrimary).length!==1)throw Error('Invalid primary');const plan=plans.find(x=>x.slug===p.slug);if(plan&&p.images[0].url!==base+plan.files[0])throw Error('Wrong main');}
 writeFileSync('output/catalog/sunflower-photo-correction.json',JSON.stringify(after.map(p=>({slug:p.slug,images:p.images.map(i=>({url:i.url,alt:i.altText,primary:i.isPrimary}))})),null,2));
 console.log('Verified three corrected sunflower galleries and removed the mislabelled group photo from the barrette. Prices and stock preserved.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.$disconnect());
