import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { existsSync } from "node:fs";
config({ path: ".env.local", quiet: true });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const numbers = [6352, ...Array.from({ length: 27 }, (_, i) => 6343 + i).filter(n => n !== 6352)];
  for (const n of numbers) if (!existsSync(`public/products/flower-garden/img_${n}-full.webp`)) throw new Error(`Missing full-size photo ${n}`);
  await prisma.$transaction(async tx => {
    const product = await tx.product.update({ where: { slug: "lilac-rose-garden-felt-headband" }, data: {
      title: "Felt Flower Garden Headband",
      shortDescription: "A handmade garden of felt flowers and leaves. Choose your favourite main flower and colour from eight designs, including Pastel Blossom.",
      fullDescription: "A little flower garden to wear: a statement felt bloom with a textured centre, surrounded by smaller flowers, buds and green leaves on a ribbon-covered headband. Handmade in Oxford.\n\nChoose your main flower and colour: layered flowers in Pale Blue with a Purple Centre, Lilac with a Purple Centre, Blush with a Rose Centre, Peach Pink with a Bright Pink Centre, or Cream with a Peach Centre; or daisy-style flowers in Blue or Mint, both with a Yellow Centre.\n\nEach headband is handmade, and I will do my best to match the colours shown as closely as possible. The main large flower will remain the same design and colour as your selected option. Only the smaller accent flowers may vary in colour or style depending on material availability. Slight differences in handmade shaping and arrangement make each piece unique.\n\nGroup photographs show several options together. In the paired photos, Lilac is on the right beside Pale Blue; Blush is on the left beside Peach Pink; Cream is in the foreground beside Blush; and the daisy-style flowers are Blue on the left and Mint on the right.\n\nPrice is for one headband in your chosen design, not a set."
    }, include: { images: true } });
    await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false, sortOrder: 100 } });
    for (const [i,n] of numbers.entries()) {
      const url = `/products/flower-garden/img_${n}-full.webp`;
      const existing = product.images.find(img => img.url === url);
      const data = { url, altText: `Handmade Flower Garden felt headbands — flower and colour details, photo ${n}`, sortOrder: i, isPrimary: i === 0 };
      if (existing) await tx.productImage.update({ where: { id: existing.id }, data });
      else await tx.productImage.create({ data: { productId: product.id, ...data } });
    }
    const remaining = await tx.productImage.findMany({ where: { productId: product.id, sortOrder: 100 }, orderBy: { id: "asc" } });
    for (const [i,img] of remaining.entries()) await tx.productImage.update({ where: { id: img.id }, data: { sortOrder: numbers.length + i } });
    const pastel = await tx.product.findUniqueOrThrow({ where: { slug: "pastel-blossom-statement-headband" }, include: { images: true } });
    for (const [i,img] of pastel.images.entries()) {
      const existing = await tx.productImage.findFirst({ where: { productId: product.id, url: img.url } });
      if (!existing) await tx.productImage.create({ data: { productId: product.id, url: img.url, altText: "Pastel Blossom option — blush felt flower with a yellow centre, shown worn", isPrimary: false, sortOrder: 40 + i } });
    }
    await tx.product.update({ where: { id: product.id }, data: { fullDescription: product.fullDescription + "\n\nPastel Blossom is also available in this listing: a large blush flower with a yellow centre, pastel accents and a pink ribbon-covered band. Choose Pastel Blossom — Blush / Yellow Centre for the design shown in its worn photograph." } });
    await tx.product.update({ where: { id: pastel.id }, data: { isPublished: false } });
  });
  console.log("Updated Flower Garden title, handmade details and gallery.");
}
main().finally(() => prisma.$disconnect());
