/**
 * Rebuild Layered Flower brooch + hair-clip ProductImages and collection
 * to Teng's LOCKED photo ranges (safe product webps only).
 *
 * Usage (from repo root on iMac):
 *   npx tsx prisma/rebuild-layered-flower-locked-ranges.ts          # dry-run
 *   npx tsx prisma/rebuild-layered-flower-locked-ranges.ts --apply
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const APPLY = process.argv.includes("--apply");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const COLLECTION = "Signature Flower Collection";

type Img = { url: string; altText: string; sortOrder: number; isPrimary?: boolean };

const BROOCH_ALLOWED = new Set([
  "/products/sept8-2026/img_9636.webp",
  "/products/sept8-2026/img_9637.webp",
  "/products/sept8-2026/img_9638.webp",
  "/products/sept8-2026/img_9639.webp",
  "/products/sept8-2026/img_9640.webp",
  "/products/sept8-2026/img_9641.webp",
  "/products/sept8-2026/img_9642.webp",
  "/products/sept8-2026/img_9643.webp",
  "/products/sept8-2026/img_9650.webp",
]);

const CLIP_ALLOWED = new Set([
  "/products/sept8-2026/img_9657.webp",
  "/products/sept8-2026/img_9658.webp",
  "/products/sept8-2026/img_9664.webp",
  "/products/sept8-2026/img_9671.webp",
  "/products/sept8-2026/img_9672.webp",
  "/products/sept8-2026/img_9678.webp",
  "/products/sept8-2026/img_9679.webp",
  "/products/sept8-2026/img_9680.webp",
  "/products/sept8-2026/img_9685.webp",
  "/products/sept8-2026/img_9686.webp",
  "/products/sept8-2026/img_9688.webp",
]);

const BROOCH_IMAGES: Img[] = [
  { url: "/products/sept8-2026/img_9638.webp", altText: "Pink / magenta layered felt flower brooch, front", sortOrder: 0, isPrimary: true },
  { url: "/products/sept8-2026/img_9639.webp", altText: "Pink / magenta layered felt flower brooch, pin back", sortOrder: 1 },
  { url: "/products/sept8-2026/img_9640.webp", altText: "Pink / magenta layered felt flower brooch, alternate front", sortOrder: 2 },
  { url: "/products/sept8-2026/img_9641.webp", altText: "Burgundy layered felt flower brooch, front", sortOrder: 3 },
  { url: "/products/sept8-2026/img_9642.webp", altText: "Burgundy layered felt flower brooch, pin back", sortOrder: 4 },
  { url: "/products/sept8-2026/img_9643.webp", altText: "Lavender layered felt flower brooch, front", sortOrder: 5 },
  { url: "/products/sept8-2026/img_9650.webp", altText: "Layered felt flower brooch, pin back detail", sortOrder: 6 },
  { url: "/products/sept8-2026/img_9636.webp", altText: "Layered felt flower brooch colourways group", sortOrder: 7 },
  { url: "/products/sept8-2026/img_9637.webp", altText: "Layered felt flower brooch colourways group alternate", sortOrder: 8 },
];

const CLIP_IMAGES: Img[] = [
  { url: "/products/sept8-2026/img_9657.webp", altText: "Pink / magenta layered felt flower hair clip, front", sortOrder: 0, isPrimary: true },
  { url: "/products/sept8-2026/img_9658.webp", altText: "Pink / magenta layered felt flower hair clip, alligator open", sortOrder: 1 },
  { url: "/products/sept8-2026/img_9664.webp", altText: "Deep red / burgundy layered felt flower hair clip, front", sortOrder: 2 },
  { url: "/products/sept8-2026/img_9685.webp", altText: "Deep red / burgundy layered felt flower hair clip, alligator back", sortOrder: 3 },
  { url: "/products/sept8-2026/img_9672.webp", altText: "Soft pink layered felt flower hair clip, front", sortOrder: 4 },
  { url: "/products/sept8-2026/img_9671.webp", altText: "Soft pink layered felt flower hair clip, alligator side", sortOrder: 5 },
  { url: "/products/sept8-2026/img_9678.webp", altText: "Yellow bud layered felt flower hair clip, front", sortOrder: 6 },
  { url: "/products/sept8-2026/img_9679.webp", altText: "Yellow bud layered felt flower hair clip, alligator back", sortOrder: 7 },
  { url: "/products/sept8-2026/img_9680.webp", altText: "Lilac with yellow centre layered felt flower hair clip, front", sortOrder: 8 },
  { url: "/products/sept8-2026/img_9686.webp", altText: "Blue / cream layered felt flower hair clip, front", sortOrder: 9 },
  { url: "/products/sept8-2026/img_9688.webp", altText: "Lilac with berries layered felt flower hair clip, front", sortOrder: 10 },
];

const OPTIONS_PATCH = {
  "layered-felt-flower-brooch": {
    label: "Colour",
    hint: "Price is for one piece in your chosen colour.",
    options: [
      {
        value: "Pink / magenta",
        image: "/products/sept8-2026/img_9638.webp",
        gallery: [
          "/products/sept8-2026/img_9638.webp",
          "/products/sept8-2026/img_9639.webp",
          "/products/sept8-2026/img_9640.webp",
        ],
      },
      {
        value: "Burgundy",
        image: "/products/sept8-2026/img_9641.webp",
        gallery: [
          "/products/sept8-2026/img_9641.webp",
          "/products/sept8-2026/img_9642.webp",
        ],
      },
      {
        value: "Lavender",
        image: "/products/sept8-2026/img_9643.webp",
        gallery: ["/products/sept8-2026/img_9643.webp"],
      },
    ],
  },
  "layered-felt-flower-hair-clip": {
    label: "Colour",
    hint: "Price is for one piece in your chosen colour.",
    options: [
      {
        value: "Pink / magenta",
        image: "/products/sept8-2026/img_9657.webp",
        gallery: [
          "/products/sept8-2026/img_9657.webp",
          "/products/sept8-2026/img_9658.webp",
        ],
      },
      {
        value: "Deep red / burgundy",
        image: "/products/sept8-2026/img_9664.webp",
        gallery: [
          "/products/sept8-2026/img_9664.webp",
          "/products/sept8-2026/img_9685.webp",
        ],
      },
      {
        value: "Soft pink",
        image: "/products/sept8-2026/img_9672.webp",
        gallery: [
          "/products/sept8-2026/img_9672.webp",
          "/products/sept8-2026/img_9671.webp",
        ],
      },
      {
        value: "Yellow bud",
        image: "/products/sept8-2026/img_9678.webp",
        gallery: [
          "/products/sept8-2026/img_9678.webp",
          "/products/sept8-2026/img_9679.webp",
        ],
      },
      {
        value: "Lilac yellow centre",
        image: "/products/sept8-2026/img_9680.webp",
        gallery: ["/products/sept8-2026/img_9680.webp"],
      },
      {
        value: "Blue / cream",
        image: "/products/sept8-2026/img_9686.webp",
        gallery: ["/products/sept8-2026/img_9686.webp"],
      },
      {
        value: "Lilac with berries",
        image: "/products/sept8-2026/img_9688.webp",
        gallery: ["/products/sept8-2026/img_9688.webp"],
      },
    ],
  },
};

async function rebuildProduct(slug: string, allowed: Set<string>, images: Img[]) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true },
  });
  if (!product) {
    console.error(`MISSING product ${slug}`);
    return;
  }
  console.log(`\n=== ${slug} id=${product.id} ===`);
  console.log(`collection(before)=${JSON.stringify(product.collection)} isPublished=${product.isPublished}`);
  console.log(`images(before)=${product.images.length}`);
  for (const im of product.images) {
    console.log(`  ${im.isPrimary ? "*" : " "} ${im.url}`);
  }

  const toDelete = product.images.filter((im) => !allowed.has(im.url));
  const existingUrls = new Set(product.images.map((im) => im.url));
  const toCreate = images.filter((im) => !existingUrls.has(im.url));
  const toKeep = product.images.filter((im) => allowed.has(im.url));

  console.log(`delete ${toDelete.length}:`, toDelete.map((i) => i.url));
  console.log(`create ${toCreate.length}:`, toCreate.map((i) => i.url));
  console.log(`keep ${toKeep.length}`);

  if (!APPLY) {
    console.log("(dry-run) would set collection + isPublished + rebuild images + options json");
    return product;
  }

  await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.productImage.deleteMany({
        where: { id: { in: toDelete.map((i) => i.id) } },
      });
    }
    // Clear primary flags then upsert rows
    await tx.productImage.updateMany({
      where: { productId: product.id },
      data: { isPrimary: false },
    });
    for (const im of images) {
      const existing = await tx.productImage.findFirst({
        where: { productId: product.id, url: im.url },
      });
      if (existing) {
        await tx.productImage.update({
          where: { id: existing.id },
          data: {
            altText: im.altText,
            sortOrder: im.sortOrder,
            isPrimary: !!im.isPrimary,
          },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId: product.id,
            url: im.url,
            altText: im.altText,
            sortOrder: im.sortOrder,
            isPrimary: !!im.isPrimary,
          },
        });
      }
    }
    await tx.product.update({
      where: { id: product.id },
      data: {
        collection: COLLECTION,
        isPublished: true,
      },
    });
  });

  const after = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  console.log(`collection(after)=${JSON.stringify(after?.collection)} images=${after?.images.length}`);
  for (const im of after?.images ?? []) {
    console.log(`  ${im.isPrimary ? "*" : " "} ${im.url}`);
  }
  return after;
}

function patchOptionsJson() {
  const path = resolve("src/lib/september-2026-product-options.json");
  const raw = JSON.parse(readFileSync(path, "utf8"));
  for (const [slug, cfg] of Object.entries(OPTIONS_PATCH)) {
    raw[slug] = cfg;
  }
  if (APPLY) {
    writeFileSync(path, JSON.stringify(raw, null, 2) + "\n");
    console.log(`\nWrote options for layered flowers → ${path}`);
  } else {
    console.log(`\n(dry-run) would write options for:`, Object.keys(OPTIONS_PATCH));
    console.log(JSON.stringify(OPTIONS_PATCH, null, 2));
  }
}

async function main() {
  console.log(APPLY ? "APPLY mode" : "DRY-RUN mode");
  await rebuildProduct("layered-felt-flower-brooch", BROOCH_ALLOWED, BROOCH_IMAGES);
  await rebuildProduct("layered-felt-flower-hair-clip", CLIP_ALLOWED, CLIP_IMAGES);
  patchOptionsJson();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
