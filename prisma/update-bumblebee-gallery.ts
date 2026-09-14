import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { existsSync, writeFileSync } from "node:fs";
config({ path: ".env.local", quiet: true });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const numbers = [9560,9562,9561,9563];
  for (const n of numbers) if (!existsSync(`public/products/bumblebee-garden/img_${n}-full.webp`)) throw new Error(`Missing ${n}`);
  const original = await prisma.product.findUniqueOrThrow({ where: { slug: "bumblebee-garden-faux-fur-claw-clip" }, include: { images: true } });
  writeFileSync(`/tmp/bumblebee-gallery-backup-${Date.now()}.json`, JSON.stringify(original,null,2));
  await prisma.$transaction(async tx => {
    await tx.product.update({ where: { id: original.id }, data: { fullDescription: "A soft faux-fur claw clip decorated with a cheerful yellow felt bumblebee, green leaves and a little garden of pastel flowers.\n\nChoose a Cream or White faux-fur base. Each colour option has its own photographs showing the front and the claw mechanism.\n\nPrice is for one claw clip in your chosen colour. The wooden display stand is not included.\n\nHandmade in Oxford." } });
    await tx.productImage.deleteMany({ where: { productId: original.id, url: "/products/september-2026/img_3513.webp" } });
    await tx.productImage.updateMany({ where: { productId: original.id }, data: { isPrimary: false } });
    for (const [i,n] of numbers.entries()) {
      const existing = original.images.find(img => img.url.includes(`img_${n}`));
      const data = { url: `/products/bumblebee-garden/img_${n}-full.webp`, altText: `Bumblebee Garden faux-fur claw clip — ${n < 9562 ? "cream" : "white"}, ${n % 2 === 0 ? "front" : "claw mechanism"}`, sortOrder: i, isPrimary: i === 0 };
      if (existing) await tx.productImage.update({ where: { id: existing.id }, data });
      else await tx.productImage.create({ data: { productId: original.id, ...data } });
    }
  });
  console.log("Bumblebee gallery and description updated; group photo detached, original file retained.");
}
main().finally(() => prisma.$disconnect());
