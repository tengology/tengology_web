import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { existsSync } from "node:fs";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){
 const numbers=[9544,9545,9547,9549,9546,9548,9550,9553,9552,9551];
 for(const n of numbers)if(!existsSync(`public/products/reindeer-headband/img_${n}-full.webp`))throw Error(`Missing ${n}`);
 await p.$transaction(async tx=>{
  const product=await tx.product.findUniqueOrThrow({where:{slug:"reindeer-antler-floral-headband"},include:{images:{orderBy:{sortOrder:"asc"}}}});
  await tx.productImage.updateMany({where:{productId:product.id},data:{isPrimary:false}});
  for(const [i,n]of numbers.entries()){
   const existing=product.images.find(img=>img.url.includes(`img_${n}`));
   const colour=[9545,9546,9553].includes(n)?"Red":[9547,9548,9552].includes(n)?"Blush / pink":"Purple / lavender";
   const data={url:`/products/reindeer-headband/img_${n}-full.webp`,altText:n===9544?"Three reindeer antler and rose headbands, front view showing all rose colourways":`${colour} reindeer antler headband — ${n>=9551?"back view":"front rose detail"}`,sortOrder:i,isPrimary:i===0};
   if(existing)await tx.productImage.update({where:{id:existing.id},data});
   else await tx.productImage.create({data:{productId:product.id,...data}});
  }
  const rest=product.images.filter(img=>!numbers.some(n=>img.url.includes(`img_${n}`)));
  for(const [i,img]of rest.entries())await tx.productImage.update({where:{id:img.id},data:{sortOrder:numbers.length+i}});
 });
 console.log("All three options use front-facing rose photos; back views follow front details.");
}
main().finally(()=>p.$disconnect());
