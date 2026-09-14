import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync, existsSync } from "node:fs";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){
 const headSlugs=["halloween-pumpkin-felt-headband","pink-pumpkin-felt-headband","lavender-pumpkin-felt-headband","blue-pumpkin-felt-headband","purple-cream-pumpkin-felt-headband"];
 const items=await p.product.findMany({where:{slug:{in:[...headSlugs,"bumblebee-blossom-felt-brooch","pumpkin-felt-hair-clip","pumpkin-patch-faux-fur-claw-clip","pumpkin-cluster-felt-brooch"]}},include:{images:{orderBy:{sortOrder:"asc"}}}});
 writeFileSync(`/tmp/pumpkin-brooch-before-${Date.now()}.json`,JSON.stringify(items,null,2));
 await p.$transaction(async tx=>{
  const main=items.find(x=>x.slug===headSlugs[0])!;
  let order=main.images.length;
  for(const slug of headSlugs.slice(1)){
   const other=items.find(x=>x.slug===slug)!;
   for(const img of other.images){if(!await tx.productImage.findFirst({where:{productId:main.id,url:img.url}}))await tx.productImage.create({data:{productId:main.id,url:img.url,altText:img.altText,sortOrder:order++,isPrimary:false}});}
   await tx.product.update({where:{id:other.id},data:{isPublished:false}});
  }
  await tx.product.update({where:{id:main.id},data:{title:"Pumpkin Garden Felt Headband",shortDescription:"A handmade felt pumpkin patch for your hair, in five colourways.",fullDescription:"Rounded felt pumpkins sit among layered autumn leaves, tiny bead details and touches of sparkle on a ribbon-covered headband. Each pumpkin is shaped and stitched by hand.\n\nChoose your colourway: Halloween (Orange & Purple), Pink, Lavender, Blue, or Purple & Cream. The photographs for each option show its own design.\n\nPrice is for one headband in your chosen colourway.\n\nHandmade in Oxford."}});
  const bee=items.find(x=>x.slug==="bumblebee-blossom-felt-brooch")!;
  const photos=[9588,9591,9589,9594];
  for(const n of photos)if(!existsSync(`public/products/bumblebee-brooch/img_${n}-bright.webp`))throw Error(`Missing ${n}`);
  await tx.productImage.deleteMany({where:{productId:bee.id}});
  for(const [i,n]of photos.entries())await tx.productImage.create({data:{productId:bee.id,url:`/products/bumblebee-brooch/img_${n}-bright.webp`,altText:`Bumblebee and Blossom felt brooch — ${n===9594?"pin fastening":n===9589?"two colour variations":"front detail"}`,sortOrder:i,isPrimary:i===0}});
 });
 console.log("Headbands merged and bee brooch gallery replaced. Originals retained.");
}
main().finally(()=>p.$disconnect());
