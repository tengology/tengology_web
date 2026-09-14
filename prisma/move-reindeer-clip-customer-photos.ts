import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
config({path: ".env.local", quiet: true});
const p = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});
async function main() {
  await p.$transaction(async tx => {
    const headband = await tx.product.findUniqueOrThrow({where: {slug: "reindeer-antler-floral-headband"}});
    const clips = await tx.product.findUniqueOrThrow({where: {slug: "reindeer-antler-rose-hair-clips"}, include: {images: true}});
    let order = Math.max(...clips.images.map(i => i.sortOrder)) + 1;
    for (const n of [4692, 4711]) {
      const url = `/products/reindeer-headband/customer-${n}.webp`;
      await tx.productImage.updateMany({where: {productId: headband.id, url}, data: {productId: clips.id, altText: "Red reindeer antler and rose hair clips — pair worn by a customer", sortOrder: order++, isPrimary: false}});
      const rows = await tx.productImage.findMany({where: {url}});
      if (!rows.some(i => i.productId === clips.id) || rows.some(i => i.productId === headband.id)) throw new Error(`Move failed: ${n}`);
    }
    console.log("Verified both customer images belong to Hair Clips, not Headband.");
  });
}
main().finally(() => p.$disconnect());
