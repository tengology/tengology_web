import {config} from 'dotenv';
config({path:'.env.local',quiet:true});
import {PrismaClient} from '../src/generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {writeFileSync} from 'node:fs';
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const groups:Record<string,string[]>={
  'Signature Flower Collection':['lilac-rose-garden-felt-headband','single-flower-headband'],
  Sakura:['pink-sakura-felt-headband','pink-sakura-felt-hair-clip','pink-sakura-pearl-claw-clip','pink-sakura-felt-brooch'],
  Hibiscus:['peach-hibiscus-felt-hair-clip','peach-hibiscus-felt-brooch'],
  'Spring Bouquet':['spring-bouquet-statement-headband','spring-bouquet-faux-fur-scrunchie','spring-bouquet-brooch'],
  Woodland:['toadstool-daisy-felt-hair-clip'],
};
async function main(){
  const rows=await p.product.findMany({where:{category:'FELT',slug:{in:Object.values(groups).flat()}},select:{id:true,slug:true,collection:true}});
  if(rows.length!==Object.values(groups).flat().length)throw Error('A target product is missing.');
  console.log(groups);
  if(!process.argv.includes('--apply'))return;
  writeFileSync('output/image-audit/collections-before.json',JSON.stringify(rows,null,2));
  await p.$transaction(Object.entries(groups).flatMap(([collection,slugs])=>slugs.map(slug=>p.product.update({where:{slug},data:{collection}}))));
  console.log('Updated collections only; no titles, images, stock or publication changes.');
}
main().finally(()=>p.$disconnect());
