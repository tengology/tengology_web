import {config} from "dotenv";
import {PrismaClient} from "../src/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){await p.$transaction(async tx=>{
 const product=await tx.product.findUniqueOrThrow({where:{slug:"spring-bouquet-brooch"},include:{images:{orderBy:{sortOrder:"asc"}}}});
 const wrong="/products/spring-bouquet/daffodil-brooch-golden-2.jpg";
 const hero=product.images.find(i=>i.url==="/products/spring-bouquet/daffodil-brooch-golden-hero.jpg");
 if(!hero)throw Error("Missing second photo");
 await tx.productImage.deleteMany({where:{productId:product.id,url:wrong}});
 const images=[hero,...product.images.filter(i=>i.id!==hero.id&&i.url!==wrong)];
 for(const [sortOrder,img]of images.entries())await tx.productImage.update({where:{id:img.id},data:{sortOrder,isPrimary:sortOrder===0}});
 console.log(`Verified ${images.length} photos retained; original second photo now primary. Claw-clip gallery entry removed, file retained.`);
});}
main().finally(()=>p.$disconnect());
