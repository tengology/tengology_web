import {config} from 'dotenv';
config({path:'.env.local',quiet:true});
import {PrismaClient} from '../src/generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {writeFileSync} from 'node:fs';
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){
  const where={product:{slug:'strawberry-cluster-hair-pin'},url:{in:['/products/strawberries/claw-clip-worn.jpg','/products/strawberries/collection-flatlay-white.jpg']},isPrimary:false};
  const rows=await p.productImage.findMany({where});
  if(rows.length!==2)throw Error('Expected exactly two known missing image references.');
  writeFileSync('output/image-audit/removed-image-references.json',JSON.stringify(rows,null,2));
  console.log(await p.productImage.deleteMany({where}));
}
main().finally(()=>p.$disconnect());
