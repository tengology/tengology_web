import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { existsSync } from "node:fs";
config({ path: ".env.local", quiet: true });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const numbers = [9598,9597,9604,9601,9602,9603];
  for (const n of numbers) if (!existsSync(`public/products/strawberry-blossom/img_${n}-full.webp`)) throw new Error(`Missing photo ${n}`);
  await prisma.$transaction(async tx => {
    const product = await tx.product.update({ where: { slug: "strawberry-blossom-faux-fur-claw-clip" }, data: {
      shortDescription: "Soft faux fur, handmade felt strawberries and a little white blossom, in two colour combinations.",
      fullDescription: "A plush claw clip finished with hand-shaped felt strawberries, green leaves and a white blossom with a yellow centre.\n\nChoose Red Strawberries / Cream Faux Fur for the red strawberry design on a cream faux-fur claw clip, or Pink Strawberries / White Faux Fur for the pink strawberry design on a white faux-fur claw clip. Please refer to the photograph for each colour option.\n\nPrice is for one clip in your chosen colour. The group photograph shows both options; the wooden display stand is not included. Worn photographs at the end of the gallery show styling and scale.\n\nHandmade in Oxford."
    }, include: { images: { orderBy: { sortOrder: "asc" } } } });
    await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false, sortOrder: 100 } });
    for (const [i,n] of numbers.entries()) {
      const existing = product.images.find(img => img.url.includes(`img_${n}`));
      const colour = n === 9597 ? "both colour options" : [9603,9604].includes(n) ? "white faux fur with pink and red strawberries" : "cream faux fur with red strawberries";
      const data = { url: `/products/strawberry-blossom/img_${n}-full.webp`, altText: `Strawberry Blossom Faux-Fur Claw Clip — ${colour}`, sortOrder: i, isPrimary: i === 0 };
      if (existing) await tx.productImage.update({ where: { id: existing.id }, data });
      else await tx.productImage.create({ data: { productId: product.id, ...data } });
    }
    const remaining = product.images.filter(img => !numbers.some(n => img.url.includes(`img_${n}`)));
    for (const [i,img] of remaining.entries()) await tx.productImage.update({ where: { id: img.id }, data: { sortOrder: numbers.length+i, isPrimary: false } });
  });
  console.log("Updated strawberry gallery, primary photo and colour description.");
}
main().finally(() => prisma.$disconnect());
