import {config} from "dotenv";
import {PrismaClient} from "../src/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){await p.$transaction(async tx=>{
 const target=await tx.product.findUniqueOrThrow({where:{slug:"lilac-rose-garden-felt-headband"},include:{images:{orderBy:{sortOrder:"asc"}}}});
 const source=await tx.product.findUniqueOrThrow({where:{slug:"flower-headband"},include:{images:{orderBy:{sortOrder:"asc"}}}});
 const hero=source.images.find(i=>i.isPrimary)??source.images[0];
 if(!hero)throw Error("Missing source hero");
 const all=[hero,...target.images,...source.images.filter(i=>i.id!==hero.id)].filter((i,n,a)=>a.findIndex(x=>x.url===i.url)===n);
 await tx.productImage.updateMany({where:{productId:target.id},data:{isPrimary:false}});
 for(const [sortOrder,img]of all.entries()){
 const existing=target.images.find(i=>i.url===img.url);
 const data={url:img.url,altText:img.altText,sortOrder,isPrimary:sortOrder===0};
 if(existing)await tx.productImage.update({where:{id:existing.id},data});
 else await tx.productImage.create({data:{productId:target.id,...data}});
 }
 await tx.product.update({where:{id:source.id},data:{isPublished:false}});
 console.log(`Merged ${all.length} images. Hero: ${hero.url}. Original listing unpublished, recoverable.`);
});}
main().finally(()=>p.$disconnect());
