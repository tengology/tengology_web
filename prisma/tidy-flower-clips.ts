import {config} from "dotenv";
import {PrismaClient} from "../src/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){
 await p.$transaction(async tx=>{
 const sun=await tx.product.findUniqueOrThrow({where:{slug:"sunflower-felt-hair-clip"}});
 const keep=["/products/sept8-2026/img_9480.webp","/products/sept8-2026/img_9479.webp","/products/sept8-2026/img_9482.webp","/products/september-2026/img_6913.webp"];
 await tx.productImage.deleteMany({where:{productId:sun.id,url:{notIn:keep}}});
 for(const [sortOrder,url]of keep.entries())await tx.productImage.updateMany({where:{productId:sun.id,url},data:{sortOrder,isPrimary:sortOrder===0}});
 const main=await tx.product.findUniqueOrThrow({where:{slug:"toadstool-daisy-felt-hair-clip"},include:{images:true}});
 const other=await tx.product.findUniqueOrThrow({where:{slug:"toadstool-buttercup-felt-hair-clip"},include:{images:true}});
 let sortOrder=main.images.length;
 for(const img of other.images)if(!main.images.some(i=>i.url===img.url))await tx.productImage.create({data:{productId:main.id,url:img.url,altText:img.altText,sortOrder:sortOrder++,isPrimary:false}});
 await tx.product.update({where:{id:main.id},data:{title:"Toadstool & Flower Felt Hair Clip",shortDescription:"A spotted red toadstool with a white daisy or yellow buttercup on a green velvet-wrapped hair clip.",fullDescription:"A little woodland detail for your hair: a red-and-white spotted felt toadstool, felt leaves and your choice of a white daisy or yellow buttercup, on a green velvet-wrapped hair clip.\n\nPrice is for one hair clip in your chosen style. Handmade in Oxford; small details may vary.",price:7}});
 await tx.product.update({where:{id:other.id},data:{isPublished:false}});
 console.log("Sunflower: 4 images retained. Toadstool listings merged; duplicate unpublished.");
 });
}
main().finally(()=>p.$disconnect());
