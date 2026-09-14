import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync } from "node:fs";
config({ path: ".env.local", quiet: true });
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const item = await p.product.findUniqueOrThrow({ where: { slug: "bumblebee-blossom-felt-barrette" }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  writeFileSync(`/tmp/bee-hair-clip-before-${Date.now()}.json`, JSON.stringify(item,null,2));
  const duplicates = ["/products/sept8-2026/img_9583.webp", "/products/sept8-2026/img_9580.webp"];
  await p.$transaction(async tx => {
    await tx.product.update({ where: { id: item.id }, data: { title: "Bumblebee & Blossom Felt Hair Clip", shortDescription: "A tiny bee and pastel blossoms gathered along a felt hair clip.", fullDescription: item.fullDescription?.replace("one horizontal barrette", "one hair clip") ?? null } });
    await tx.productImage.deleteMany({ where: { productId: item.id, url: { in: duplicates } } });
    const keep = item.images.filter(img => !duplicates.includes(img.url));
    for (const [i,img] of keep.entries()) await tx.productImage.update({ where: { id: img.id }, data: { sortOrder: i, altText: img.altText?.replace(/Barrettes/g,"Hair Clips").replace(/barrettes/g,"hair clips").replace(/Barrette/g,"Hair Clip").replace(/barrette/g,"hair clip") } });
    console.log({ title: "Bumblebee & Blossom Felt Hair Clip", images: keep.length, removed: duplicates });
  });
}
main().finally(() => p.$disconnect());
