import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import sharp from "sharp";
config({ path: ".env.local", quiet: true });
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const selections = { red: [4701], pink: [4114, 4117, 4170, 4178, 4688] };
async function main() {
  const product = await p.product.findUniqueOrThrow({ where: { slug: "reindeer-antler-floral-headband" }, include: { images: true } });
  let order = Math.max(...product.images.map(i => i.sortOrder)) + 1;
  for (const [colour, numbers] of Object.entries(selections)) {
    for (const n of numbers) {
      const url = `/products/reindeer-headband/customer-${n}.webp`;
      const result = await sharp(`/tmp/reindeer-customers-emU8cA/IMG_${n}.jpeg`).rotate().webp({ quality: 94, effort: 6 }).toFile(`public${url}`);
      if (!product.images.some(i => i.url === url)) await p.productImage.create({ data: { productId: product.id, url, altText: `${colour === "red" ? "Red" : "Blush / pink"} reindeer antler and rose headband worn by a customer`, sortOrder: order++, isPrimary: false } });
      console.log(n, result.width, result.height);
    }
  }
  const adultUrl = "/products/reindeer-headband/customer-pink-adult.webp";
  await sharp("/tmp/reindeer-customers-emU8cA/2e775eac-7856-4282-ab76-47188a1ffa7e.jpeg").rotate().webp({ quality: 94 }).toFile(`public${adultUrl}`);
  if (!product.images.some(i => i.url === adultUrl)) await p.productImage.create({ data: { productId: product.id, url: adultUrl, altText: "Blush / pink reindeer antler rose headband worn by an adult customer", sortOrder: order++, isPrimary: false } });
  const url = "/products/reindeer-headband/blush-model.webp";
  await sharp("public/products/model/blush-antler-rose-headband-1.jpg").rotate().webp({ quality: 94 }).toFile(`public${url}`);
  if (!product.images.some(i => i.url === url)) await p.productImage.create({ data: { productId: product.id, url, altText: "Blush / pink reindeer antler rose headband model photograph", sortOrder: order++, isPrimary: false } });
}
main().finally(() => p.$disconnect());
