import {config} from "dotenv";
import {PrismaClient} from "../src/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){await p.$transaction(async tx=>{
 const target=await tx.product.findUniqueOrThrow({where:{slug:"strawberry-felt-headband-sage"},include:{images:true}});
 const source=await tx.product.findUniqueOrThrow({where:{slug:"strawberry-felt-headband-crimson"},include:{images:true}});
 let sortOrder=Math.max(...target.images.map(i=>i.sortOrder))+1;
 for(const url of ["/products/strawberries/headband-red-hero.jpg","/products/september-2026/img_3001.webp"]){
 const img=source.images.find(i=>i.url===url);if(!img)throw Error(`Missing ${url}`);
 if(!target.images.some(i=>i.url===url))await tx.productImage.create({data:{productId:target.id,url,altText:img.altText,sortOrder:sortOrder++,isPrimary:false}});
 }
 await tx.product.update({where:{id:source.id},data:{isPublished:false}});
 console.log("Crimson merged into Sage listing; two verified red photos added, duplicate listing hidden.");
});}
main().finally(()=>p.$disconnect());
