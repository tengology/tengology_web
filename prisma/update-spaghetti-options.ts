import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { existsSync } from "node:fs";

config({ path: ".env.local", quiet: true });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const colours = ["Red", "Green", "Light Blue", "Blue", "Peach", "Pink", "Lavender"];
async function main() {
  for (let n = 9284; n <= 9291; n++) if (!existsSync(`public/products/spaghetti/img_${n}-full.webp`)) throw new Error(`Missing full-size photo ${n}`);
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({ where: { slug: "spaghetti-meatball-felt-ornament" }, data: {
      shortDescription: "A handmade smiling meatball on a tiny plate of yarn spaghetti. Choose from seven plate-stitching colours — each little supper is slightly different.",
      fullDescription: "A tiny supper with a character of its own: pale yellow yarn spaghetti, tomato-red felt sauce, green felt garnish and a rosy-cheeked meatball on a little felt plate, finished with a miniature fork and hanging cord.\n\nChoose the stitching colour around the edge of the plate: Red, Green, Light Blue, Blue, Peach, Pink or Lavender. The colour options refer to the plate stitching, not the spaghetti or hanging cord.\n\nEvery ornament is handmade in Oxford. Each one may vary slightly in shape, expression, stitching and the arrangement of the spaghetti and toppings. These small differences are part of its handmade character, so your ornament may not be identical to the photograph.\n\nPrice is for one ornament in your chosen colour. Group photographs show the range; the wooden display tray is not included.\n\nFor decorative use only.",
    }, include: { images: true } });
    await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false, sortOrder: 100 } });
    for (let n = 9284; n <= 9291; n++) {
      const url = `/products/spaghetti/img_${n}-full.webp`;
      const existing = product.images.find((img) => img.url.includes(`img_${n}`));
      const data = { url, altText: n === 9284 ? "Group of handmade spaghetti and meatball felt ornaments with different plate-stitching colours" : `Spaghetti and meatball felt ornament with ${colours[n - 9285].toLowerCase()} stitching around the plate`, sortOrder: n - 9284, isPrimary: n === 9284 };
      if (existing) await tx.productImage.update({ where: { id: existing.id }, data });
      else await tx.productImage.create({ data: { productId: product.id, ...data } });
    }
    const remaining = await tx.productImage.findMany({ where: { productId: product.id, sortOrder: 100 }, orderBy: { id: "asc" } });
    for (const [i, img] of remaining.entries()) await tx.productImage.update({ where: { id: img.id }, data: { sortOrder: 8 + i } });
  });
  console.log("Updated spaghetti description and gallery.");
}
main().finally(() => prisma.$disconnect());
