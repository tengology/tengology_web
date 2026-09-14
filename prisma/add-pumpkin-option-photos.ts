import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import options from "../src/lib/september-2026-product-options.json";
import {existsSync} from "node:fs";
config({path:".env.local",quiet:true});
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
async function main(){
 for(const slug of ["pumpkin-felt-hair-clip","pumpkin-patch-faux-fur-claw-clip","pumpkin-cluster-felt-brooch"] as const){
  const item=await p.product.findUniqueOrThrow({where:{slug},include:{images:true}});
  for(const [i,opt]of options[slug].options.entries()){
   if(!existsSync(`public${opt.image}`))throw Error(`Missing ${opt.image}`);
   if(!item.images.some(img=>img.url===opt.image))await p.productImage.create({data:{productId:item.id,url:opt.image,altText:`${item.title} — ${opt.value}, individual detail`,isPrimary:false,sortOrder:item.images.length+i}});
  }
  if(slug==="pumpkin-cluster-felt-brooch"){
   await p.product.update({where:{id:item.id},data:{shortDescription:"Three tiny felt pumpkins and autumn leaves, in five colour combinations.",fullDescription:"A trio of hand-shaped felt pumpkins sits among overlapping autumn leaves, finished with tiny decorative beads. Pin this little harvest to a jumper, coat or bag.\n\nChoose your colourway: Orange, Peach & Cream; Blue; Purple & Lilac; Pink & Blush; or Peach, Coral & Cream. Each option has an individual photograph showing the selected combination.\n\nPrice is for one brooch. The group photograph shows the range, and the worn photograph shows styling and scale.\n\nHandmade in Oxford."}});
   await p.productImage.updateMany({where:{productId:item.id,url:"/products/september-2026/img_9051.webp"},data:{altText:"Five Pumpkin Cluster felt brooch colour combinations; price is for one brooch"}});
  }
 }
 console.log("All three Pumpkin listings now have individual option photos.");
}
main().finally(()=>p.$disconnect());
