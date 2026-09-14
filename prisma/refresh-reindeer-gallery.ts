import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local", quiet: true });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const shots: [number, string][] = [
  [9487, "Three pairs of reindeer antler and rose hair clips in purple, red and blush pink"],
  [9491, "All three reindeer antler and rose hair clip colourways standing on linen"],
  [9495, "Three pairs of floral reindeer antler clips viewed at an angle"],
  [9505, "Red Christmas rose and reindeer antler hair clips — matching pair"],
  [9512, "Red rose antler hair clip held to show size and fastening"],
  [9507, "Red rose antler hair clips — felt backing and metal clips"],
  [9503, "Blush pink rose and reindeer antler hair clips — matching pair"],
  [9514, "Blush pink rose antler hair clip held to show size"],
  [9504, "Blush pink antler hair clips — felt backing and metal clips"],
  [9486, "Purple and lavender rose antler hair clips — upright matching pair"],
  [9508, "Purple rose antler hair clips — alternate front view"],
  [9509, "Purple rose antler hair clips — felt backing and metal clips"],
];

async function main() {
  const product = await prisma.product.findUniqueOrThrow({ where: { slug: "reindeer-antler-rose-hair-clips" }, include: { images: true } });
  // Keep an exact snapshot so replacing the gallery remains recoverable.
  writeFileSync(`/tmp/reindeer-gallery-before-${Date.now()}.json`, JSON.stringify(product.images, null, 2));
  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: product.id } });
    await tx.productImage.createMany({ data: shots.map(([n, altText], sortOrder) => ({ productId: product.id, url: `/products/reindeer-antler-rose/img_${n}-full.webp`, altText, sortOrder, isPrimary: sortOrder === 0 })) });
  });
  console.log(await prisma.productImage.findMany({ where: { productId: product.id }, orderBy: { sortOrder: "asc" }, select: { url: true, isPrimary: true } }));
}
main().finally(() => prisma.$disconnect());
