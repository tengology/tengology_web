import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { existsSync } from "node:fs";
config({ path: ".env.local", quiet: true });
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const numbers = [9565,9568,9564,9569,9566,9567,9570,9572];
  for (const n of numbers) if (!existsSync(`public/products/bumblebee-headband/img_${n}-full.webp`)) throw new Error(`Missing ${n}`);
  await p.$transaction(async tx => {
    const item = await tx.product.update({ where: { slug: "bumblebee-garden-felt-headband" }, data: {
      shortDescription: "A cheerful felt bumblebee among pastel flowers and green leaves, on your choice of Berry or Lilac headband.",
      fullDescription: "A little flower garden to wear, with a striped yellow felt bumblebee, white wings, pastel blossoms and layered green leaves on a ribbon-covered headband.\n\nChoose your headband colour: Berry, a deep berry-purple ribbon with richer plum-toned flowers and darker leaves; or Lilac, a light purple ribbon with purple and lilac flowers and lighter green leaves. Each option has its own photographs showing the design from several angles.\n\nPrice is for one headband in your chosen colour. Other accessories shown in the collection photograph and the wooden display stand are not included.\n\nHandmade in Oxford."
    }, include: { images: { orderBy: { sortOrder: "asc" } } } });
    await tx.productImage.updateMany({ where: { productId: item.id }, data: { isPrimary: false } });
    for (const [i,n] of numbers.entries()) {
      const existing = item.images.find(img => img.url.includes(`img_${n}`));
      const data = { url: `/products/bumblebee-headband/img_${n}-full.webp`, altText: `Bumblebee Garden felt headband — ${n < 9568 ? "Berry" : "Lilac"}, ${[9564,9568].includes(n) ? "full headband" : [9567,9572].includes(n) ? "back details" : "flower and bee details"}`, sortOrder: i, isPrimary: i === 0 };
      if (existing) await tx.productImage.update({ where: { id: existing.id }, data });
      else await tx.productImage.create({ data: { productId: item.id, ...data } });
    }
    const remaining = item.images.filter(img => !numbers.some(n => img.url.includes(`img_${n}`)));
    for (const [i,img] of remaining.entries()) await tx.productImage.update({ where: { id: img.id }, data: { sortOrder: numbers.length+i } });
  });
  console.log("Updated bee headband gallery and two-colour description.");
}
main().finally(() => p.$disconnect());
