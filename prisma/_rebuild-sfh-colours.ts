/**
 * Rebuild Single Flower Headband gallery to Tengology album IMG_0375–0383
 * plus original blue-with-gold shots. Apply: npx tsx prisma/_rebuild-sfh-colours.ts --apply
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const APPLY = process.argv.includes("--apply");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const IMAGES: { url: string; altText: string; isPrimary?: boolean }[] = [
  { url: "/products/single-flower-headband-2026/img_0376.jpg", altText: "Single Flower Headband colour range (five)", isPrimary: true },
  { url: "/products/single-flower-headband-2026/img_0375.jpg", altText: "Single Flower Headband colour range (seven)" },
  { url: "/products/single-flower-headband-2026/img_0377.jpg", altText: "Single Flower Headband — Red" },
  { url: "/products/single-flower-headband-2026/img_0378.jpg", altText: "Single Flower Headband — Soft pink" },
  { url: "/products/single-flower-headband-2026/img_0379.jpg", altText: "Single Flower Headband — Teal" },
  { url: "/products/single-flower-headband-2026/img_0380.jpg", altText: "Single Flower Headband — Mint" },
  { url: "/products/single-flower-headband-2026/img_0381.jpg", altText: "Single Flower Headband — Lavender" },
  { url: "/products/single-flower-headband-2026/img_0382.jpg", altText: "Single Flower Headband — Soft blue" },
  { url: "/products/single-flower-headband-2026/img_0383.jpg", altText: "Single Flower Headband — Pale yellow" },
  { url: "/products/statement-blooms/anemone-blue-hero.jpg", altText: "Single Flower Headband — Blue with gold" },
  { url: "/products/model/blue-anemone-headband-1.jpg", altText: "Single Flower Headband — Blue with gold, worn" },
];

async function main() {
  const p = await prisma.product.findUnique({
    where: { slug: "single-flower-headband" },
    include: { images: true },
  });
  if (!p) throw new Error("missing product");
  const keep = new Set(IMAGES.map((i) => i.url));
  const drop = p.images.filter((im) => !keep.has(im.url));
  console.log(APPLY ? "APPLY" : "DRY-RUN");
  console.log("drop", drop.map((d) => d.url));
  console.log("target", IMAGES.map((i) => i.url));
  if (!APPLY) return;

  await prisma.$transaction(async (tx) => {
    if (drop.length) {
      await tx.productImage.deleteMany({ where: { id: { in: drop.map((d) => d.id) } } });
    }
    await tx.productImage.updateMany({
      where: { productId: p.id },
      data: { isPrimary: false },
    });
    for (let i = 0; i < IMAGES.length; i++) {
      const im = IMAGES[i];
      const existing = await tx.productImage.findFirst({
        where: { productId: p.id, url: im.url },
      });
      if (existing) {
        await tx.productImage.update({
          where: { id: existing.id },
          data: {
            altText: im.altText,
            sortOrder: i,
            isPrimary: !!im.isPrimary,
          },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId: p.id,
            url: im.url,
            altText: im.altText,
            sortOrder: i,
            isPrimary: !!im.isPrimary,
          },
        });
      }
    }
  });

  const after = await prisma.product.findUnique({
    where: { slug: "single-flower-headband" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  console.log("after", after?.images.length);
  after?.images.forEach((im, idx) =>
    console.log(idx + 1, im.isPrimary ? "*" : " ", im.url),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
