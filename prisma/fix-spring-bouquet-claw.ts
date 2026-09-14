import {config} from "dotenv";
import {PrismaClient} from "../src/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){await p.$transaction(async tx=>{
 const product=await tx.product.findUniqueOrThrow({where:{slug:"spring-bouquet-faux-fur-scrunchie"},include:{images:{orderBy:{sortOrder:"asc"}}}});
 const hero=product.images.find(i=>i.url==="/products/september-2026/img_2347.webp");
 if(!hero)throw Error("Missing requested hero");
 await tx.product.update({where:{id:product.id},data:{title:"Spring Bouquet Faux-Fur Claw Clip",shortDescription:"A cream faux-fur claw clip decorated with a colourful bouquet of felt spring flowers.",fullDescription:"A cream faux-fur claw clip topped with a little spring bouquet: felt daffodils, lavender, peach buds and a blue forget-me-not.\n\nPrice is for one claw clip. Each piece is handmade, so small details and flower arrangements may vary slightly.\n\nHandmade in Oxford.",materials:"wool felt, faux fur, claw clip"}});
 for(const [sortOrder,img]of [hero,...product.images.filter(i=>i.id!==hero.id)].entries())await tx.productImage.update({where:{id:img.id},data:{sortOrder,isPrimary:sortOrder===0,altText:(img.altText??product.title).replace(/scrunchies/gi,"claw clips").replace(/scrunchie/gi,"claw clip")}});
 console.log("Renamed to Claw Clip; IMG_2347 is primary and first. Price unchanged.");
});}
main().finally(()=>p.$disconnect());
