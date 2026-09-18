/**
 * Keep Single Flower Headband gallery positions 1, 10, 11, 12 only.
 * Apply: npx tsx prisma/_trim-sfh.ts --apply
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

const KEEP_URLS = [
  "/products/single-flower-headband-2026/img_0375.jpg",
  "/products/statement-blooms/anemone-blue-hero.jpg",
  "/products/model/blue-anemone-headband-1.jpg",
  "/products/statement-blooms/blooms-pair-2.jpg",
];

async function main() {
  const p = await prisma.product.findUnique({
    where: { slug: "single-flower-headband" },
    include: { images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  if (!p) throw new Error("missing product");

  const keep = p.images.filter((im) => KEEP_URLS.includes(im.url));
  const drop = p.images.filter((im) => !KEEP_URLS.includes(im.url));
  console.log(APPLY ? "APPLY" : "DRY-RUN");
  console.log("keep", keep.map((i) => i.url));
  console.log("drop", drop.map((i) => i.url));
  if (keep.length !== 4) {
    throw new Error(`expected 4 keep, got ${keep.length}`);
  }

  if (!APPLY) return;

  await prisma.$transaction(async (tx) => {
    if (drop.length) {
      await tx.productImage.deleteMany({
        where: { id: { in: drop.map((d) => d.id) } },
      });
    }
    await tx.productImage.updateMany({
      where: { productId: p.id },
      data: { isPrimary: false },
    });
    for (let i = 0; i < KEEP_URLS.length; i++) {
      const url = KEEP_URLS[i];
      await tx.productImage.updateMany({
        where: { productId: p.id, url },
        data: { sortOrder: i, isPrimary: i === 0 },
      });
    }
  });

  const after = await prisma.product.findUnique({
    where: { slug: "single-flower-headband" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  console.log("after count", after?.images.length);
  after?.images.forEach((im, i) =>
    console.log(i + 1, im.isPrimary ? "*" : " ", im.url),
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
