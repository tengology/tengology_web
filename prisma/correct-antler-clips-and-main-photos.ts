import { config } from 'dotenv';
config({path:'.env.local',quiet:true});
import { writeFileSync } from 'node:fs';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const mains:Record<string,{url:string;alt:string}>={
 'blush-antler-rose-headband':{url:'/products/original-product-photos/antler-headbands-approved.webp',alt:'Blush and red rose antler headbands held together, showing the complete bands'},
 'reindeer-antler-felt-headband':{url:'/products/original-product-photos/antler-headbands-approved.webp',alt:'Red and blush rose antler headbands held together, showing the complete bands'},
 'lilac-rose-garden-felt-headband':{url:'/lookbook/felt-flower-headbands-group.jpg',alt:'Lilac flower headband with a purple centre, shown at the upper right among other handmade flower headbands'},
};
const clips=[
 {slug:'blush-antler-rose-hair-clips',title:'Blush Antler & Rose Hair Clips — Pair',collection:'Deer Ears',from:'blush-antler-rose-headband',url:'/products/september-2026/img_4679.webp',copy:'A pair of felt deer-ear hair clips with brown antlers, blush roses, soft green leaves and tiny decorative details. Each ear is attached to its own metal clip, so you can position the pair separately. The product photograph shows the blush pair at the front, with other colours behind.\n\nPrice is for one pair of hair clips. Handmade in Oxford.'},
 {slug:'reindeer-antler-rose-hair-clips',title:'Reindeer Antler & Red Rose Hair Clips — Pair',collection:'Reindeer Ears',from:'reindeer-antler-felt-headband',url:'/products/september-2026/img_4402.webp',copy:'A pair of festive felt deer-ear hair clips with brown antlers, red roses, green leaves and little white felt accents. Each ear sits on a separate metal hair clip.\n\nPrice is for one pair of hair clips. Handmade in Oxford.'},
];
async function main(){
 const slugs=[...Object.keys(mains),...clips.flatMap(c=>[c.slug,c.from])];
 const before=await db.product.findMany({where:{slug:{in:slugs}},include:{images:true}});
 console.log('Product-only main photos:',Object.keys(mains).length,'; clip listings:',clips.length);
 if(!process.argv.includes('--apply'))return;
 for(const url of [...Object.values(mains).map(m=>m.url),...clips.map(c=>c.url)]){
  const r=await fetch('https://tengology.com'+url,{method:'HEAD',signal:AbortSignal.timeout(30000)});
  if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw Error('Asset not deployed: '+url);
 }
 writeFileSync('/tmp/tengology-clip-correction-before-'+Date.now()+'.json',JSON.stringify(before,null,2));
 await db.$transaction(async tx=>{
  for(const c of clips){
   const target=await tx.product.upsert({where:{slug:c.slug},create:{slug:c.slug,title:c.title,category:'FELT',subcategory:'HAIR_ACCESSORIES',collection:c.collection,price:15,stockCount:1,isPublished:true,materials:'wool felt, decorative details, metal hair clips',shortDescription:'A matching pair of handmade felt antler hair clips.',fullDescription:c.copy},update:{title:c.title,subcategory:'HAIR_ACCESSORIES',fullDescription:c.copy}});
   const from=await tx.product.findUniqueOrThrow({where:{slug:c.from}});
   const wrong=await tx.productImage.findFirst({where:{productId:from.id,url:c.url}});
   const exists=await tx.productImage.findFirst({where:{productId:target.id,url:c.url}});
   if(wrong&&!exists)await tx.productImage.update({where:{id:wrong.id},data:{productId:target.id,isPrimary:true,sortOrder:0,altText:c.title+' on a display card'}});
   else if(!exists)await tx.productImage.create({data:{productId:target.id,url:c.url,isPrimary:true,sortOrder:0,altText:c.title+' on a display card'}});
   const remaining=await tx.productImage.findMany({where:{productId:from.id},orderBy:{sortOrder:'asc'}});
   for(const [sortOrder,i]of remaining.entries())await tx.productImage.update({where:{id:i.id},data:{sortOrder,isPrimary:sortOrder===0}});
  }
  for(const [slug,photo]of Object.entries(mains)){
   const p=await tx.product.findUniqueOrThrow({where:{slug},include:{images:{orderBy:{sortOrder:'asc'}}}});
   let first=p.images.find(i=>i.url===photo.url);
   if(!first)first=await tx.productImage.create({data:{productId:p.id,url:photo.url,altText:photo.alt,sortOrder:0,isPrimary:false}});
   const images=[first,...p.images.filter(i=>i.id!==first.id)];
   for(const [sortOrder,i]of images.entries())await tx.productImage.update({where:{id:i.id},data:{sortOrder,isPrimary:sortOrder===0}});
  }
  await tx.product.update({where:{slug:'lilac-rose-garden-felt-headband'},data:{title:'Lilac Flower Garden Felt Headband',shortDescription:'A layered lilac felt flower with a textured purple centre, small buds and green leaves.',fullDescription:'A hand-cut lilac bloom with a textured purple centre, little felt buds and green leaves on a purple ribbon-covered headband.\n\nOne headband is included. The product photograph shows the lilac design at the upper right among other shades; the worn photograph shows its scale.\n\nHandmade in Oxford.'}});
 },{timeout:60000});
 for(const [slug,photo]of Object.entries(mains)){
  const p=await db.product.findUniqueOrThrow({where:{slug},include:{images:{orderBy:{sortOrder:'asc'}}}});
  if(p.images[0].url!==photo.url||p.images.filter(i=>i.isPrimary).length!==1)throw Error('Main photo check failed: '+slug);
 }
 for(const c of clips){
  const p=await db.product.findUniqueOrThrow({where:{slug:c.from},include:{images:true}});
  if(p.images.some(i=>i.url===c.url))throw Error('Clip photo still on headband');
 }
 console.log('Verified filtered-folder product-photo mains and two correctly separated clip listings.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.$disconnect());
