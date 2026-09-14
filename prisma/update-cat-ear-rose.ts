import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local", quiet: true });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const slug = "heart-rose-plush-hair-clip";
const title = "Cat Ear Rose Plush Hair Clips — Pair";
const shortDescription = "A pair of fluffy cat-ear hair clips with felt roses, leafy accents and little berry details. Choose pink, red or purple roses.";
const fullDescription = "A little feline charm, finished with flowers. These plush cat-ear hair clips are decorated with felt rosebuds, green leaves and round berry accents, with a claw-style fastening tucked beneath each fluffy ear.\n\nChoose your colourway: Cream / Pink Rose, White / Red Rose, or Taupe / Purple Rose. Wear the matching pair together for a playful cat-ear look.\n\nSold as one pair (two matching clips) in your chosen colour. The group photograph shows all three colourways.\n\nHandmade in Oxford.";
const shots: [number, string][] = [
  [9742, "All three colourways of cat-ear rose plush hair clip pairs on a wooden board"],
  [9746, "Cream plush cat-ear hair clip pair with pink felt roses"],
  [9747, "Cream and pink rose cat-ear clips viewed from above"],
  [9748, "White plush cat-ear hair clip pair with red felt roses"],
  [9750, "White and red rose cat-ear clips viewed from above"],
  [9751, "Taupe plush cat-ear hair clip pair with purple felt roses"],
  [9754, "Taupe and purple rose cat-ear clips on linen"],
  [9756, "Claw fastening beneath the cream and pink rose cat-ear clip"],
  [9757, "Claw fastening beneath the white and red rose cat-ear clip"],
  [9758, "Claw fastening beneath the taupe and purple rose cat-ear clip"],
];

async function main() {
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({ where: { slug }, data: { title, shortDescription, fullDescription, materials: "plush fabric, wool felt, claw hair clips" } });
    await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false, sortOrder: 100 } });
    for (const [sortOrder, [number, altText]] of shots.entries()) {
      const url = `/products/cat-ear-rose/img_${number}.webp`;
      const existing = await tx.productImage.findFirst({ where: { productId: product.id, url } });
      const data = { altText, sortOrder, isPrimary: sortOrder === 0 };
      if (existing) await tx.productImage.update({ where: { id: existing.id }, data });
      else await tx.productImage.create({ data: { productId: product.id, url, ...data } });
    }
    const old = await tx.productImage.findMany({ where: { productId: product.id, sortOrder: 100 }, orderBy: { id: "asc" } });
    for (const [i, img] of old.entries()) await tx.productImage.update({ where: { id: img.id }, data: { sortOrder: shots.length + i, altText: "Red rose plush cat-ear hair clips — additional view" } });
    const seo = { metaTitle: title, metaDescription: shortDescription, focusKeyword: "cat ear rose hair clips" };
    await tx.productSeo.upsert({ where: { productId: product.id }, create: { productId: product.id, ...seo }, update: seo });
  });
  console.log(JSON.stringify(await prisma.product.findUnique({ where: { slug }, include: { images: { orderBy: { sortOrder: "asc" } } } }), null, 2));
}
main().finally(() => prisma.$disconnect());
