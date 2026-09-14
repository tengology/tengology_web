import {config} from "dotenv";
import {PrismaClient} from "../src/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import sharp from "sharp";
import {mkdirSync} from "node:fs";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){
 const slug="pumpkin-mini-faux-fur-claw-clips-pair";
 const numbers=[9735,9734,9736,9737,9738,9739];
 mkdirSync("public/products/pumpkin-mini-pair",{recursive:true});
 for(const n of numbers){const info=await sharp(`/tmp/pumpkin-black-sTqPt5/IMG_${n}.jpeg`).rotate().webp({quality:94,effort:6}).toFile(`public/products/pumpkin-mini-pair/img_${n}.webp`);console.log(n,info.width,info.height);}
 const data={title:"Pumpkin Mini Faux-Fur Claw Clips — Pair",shortDescription:"A pair of black faux-fur mini claw clips decorated with orange felt pumpkins and autumn leaves.",fullDescription:"Bring a little pumpkin-patch charm to your hairstyle with this pair of black faux-fur mini claw clips. Each clip is decorated with an orange felt pumpkin, green leaves and a warm autumn-coloured leaf.\n\n£18 for one pair (two claw clips).\n\nHandmade in Oxford. Each piece is made individually, so the pumpkins, leaves and small details may vary slightly from the photographs and from each other.",category:"FELT",subcategory:"HAIR_ACCESSORIES",collection:"Pumpkin",materials:"wool felt, faux fur, claw clip",price:18,isPublished:true};
 const product=await p.product.upsert({where:{slug},create:{slug,...data,stockCount:1},update:data,include:{images:true}});
 for(const [sortOrder,n]of numbers.entries()){
 const url=`/products/pumpkin-mini-pair/img_${n}.webp`;
 const image={url,altText:n===9739?"Black pumpkin mini claw clip — clasp detail":n===9738?"Pair of black pumpkin mini claw clips — reverse view":"Pair of black faux-fur mini claw clips with orange felt pumpkins and autumn leaves",sortOrder,isPrimary:sortOrder===0};
 const existing=product.images.find(i=>i.url===url);
 if(existing)await p.productImage.update({where:{id:existing.id},data:image});
 else await p.productImage.create({data:{productId:product.id,...image}});
 }
 console.log(JSON.stringify(await p.product.findUnique({where:{slug},select:{title:true,price:true,isPublished:true,_count:{select:{images:true}}}})));
}
main().finally(()=>p.$disconnect());
