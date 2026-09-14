import {config} from "dotenv";
import {PrismaClient} from "../src/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import sharp from "sharp";
import {mkdirSync} from "node:fs";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){
 const nums=[9606,9610,9608,9611,9613,9605];
 mkdirSync("public/products/strawberry-headband",{recursive:true});
 for(const n of nums)await sharp(`/Users/sooktengvun/tengology_web/photo-batch-2026-09-08/IMG_${n}.jpeg`).rotate().webp({quality:94,effort:6}).toFile(`public/products/strawberry-headband/img_${n}-full.webp`);
 await p.$transaction(async tx=>{
 const x=await tx.product.findUniqueOrThrow({where:{slug:"strawberry-felt-headband-sage"},include:{images:true}});
 const keep=["/products/model/strawberry-felt-headband-sage-1.jpg","/products/september-2026/img_3813.webp"];
 const urls=nums.map(n=>`/products/strawberry-headband/img_${n}-full.webp`);
 await tx.productImage.deleteMany({where:{productId:x.id,url:{notIn:[...keep,...urls]}}});
 for(const [sortOrder,url]of [...urls,...keep].entries()){
 const existing=x.images.find(i=>i.url===url);
 const data={url,sortOrder,isPrimary:sortOrder===0,altText:sortOrder===0?"Sage and red strawberry felt headbands shown together":existing?.altText??`${[9608,9613].some(n=>url.includes(String(n)))?"Red ribbon with red and pink strawberries":"Sage ribbon with red strawberries"} — handmade felt headband`};
 if(existing)await tx.productImage.update({where:{id:existing.id},data});else await tx.productImage.create({data:{productId:x.id,...data}});
 }
 await tx.product.update({where:{id:x.id},data:{title:"Strawberry & Blossom Felt Headband",shortDescription:"Handmade strawberry and blossom headband — choose sage ribbon with red strawberries or red ribbon with red and pink strawberries.",fullDescription:"Hand-shaped felt strawberries with stitched seed details, a white blossom and green leaves on a satin-wrapped headband.\n\nChoose your colourway: Sage Ribbon — Red Strawberries, or Red Ribbon — Red & Pink Strawberries.\n\nPrice is for one headband in your chosen colourway. Handmade in Oxford; berry shapes and small details may vary slightly. Group photographs show both options, not a set."}});
 console.log("8 photos retained: 6 full-size new WebPs and 2 verified sage worn photos. Two colourways, price unchanged.");
 });
}
main().finally(()=>p.$disconnect());
