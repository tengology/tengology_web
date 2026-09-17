import {config} from 'dotenv';
config({path:'.env.local',quiet:true});
import {PrismaClient} from '../src/generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {writeFileSync} from 'node:fs';
const prisma=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const numbers=[5994,5995,5996,5997,5998,5999,6001,6002,6003,6004];
async function main(){
  const images=await prisma.productImage.findMany({where:{product:{collection:'Crysprout'},url:{in:numbers.map(n=>`/products/crysprout/img_${n}.webp`)}},select:{id:true,url:true,product:{select:{slug:true}}}});
  console.log(JSON.stringify(images,null,2));
  if(process.argv.includes('--apply')){
    if(images.length!==11)throw new Error(`Expected 11 scoped images, found ${images.length}; inspect before applying.`);
    writeFileSync('output/crysprout-backgrounds/listing-images-before.json',JSON.stringify(images,null,2));
    await prisma.$transaction(images.map(i=>prisma.productImage.update({where:{id:i.id},data:{url:i.url.replace('.webp','-garden.webp')}})));
    console.log(`Updated ${images.length} Crysprout image URLs only.`);
  }
}
main().finally(()=>prisma.$disconnect());
