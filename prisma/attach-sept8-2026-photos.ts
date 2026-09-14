/**
 * Attach Sept-8-2026 polished product photos (paths under /products/sept8-2026/).
 *
 * Dry-run (default):  npx tsx prisma/attach-sept8-2026-photos.ts
 * Apply:              npx tsx prisma/attach-sept8-2026-photos.ts --apply
 *
 * Rules:
 * - Idempotent: skip ProductImage rows whose URL already exists on that product
 * - Append only; never wipe galleries
 * - Set isPrimary on a new image only when the current gallery has exactly 1 image
 * - Creates unpublished purple antler draft SKUs if missing (stock 0)
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const APPLY = process.argv.includes("--apply");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Row = { img: string; slug: string; url: string; note: string };

const ALT: Record<string, (note: string) => string> = {
  "sunflower-felt-hair-clip": (n) => `Sunflower felt hair clip — ${n}`,
  "blush-antler-rose-hair-clips": (n) => `Blush antler & rose hair clips — ${n}`,
  "reindeer-antler-rose-hair-clips": (n) => `Reindeer antler & red rose hair clips — ${n}`,
  "purple-antler-rose-hair-clips": (n) => `Purple antler & rose hair clips — ${n}`,
  "remembrance-poppy-felt-brooch": (n) => `Remembrance poppy felt brooch — ${n}`,
  "remembrance-poppy-felt-hair-clip": (n) => `Remembrance poppy felt hair clip — ${n}`,
  "remembrance-poppy-felt-headband": (n) => `Remembrance poppy felt headband — ${n}`,
  "blush-antler-rose-headband": (n) => `Blush antler & rose headband — ${n}`,
  "reindeer-antler-felt-headband": (n) => `Reindeer antler felt headband — ${n}`,
  "purple-antler-rose-headband": (n) => `Purple antler & rose headband — ${n}`,
  "bumblebee-garden-faux-fur-claw-clip": (n) => `Bumblebee garden faux-fur claw clip — ${n}`,
  "bumblebee-garden-felt-headband": (n) => `Bumblebee garden felt headband — ${n}`,
  "bumblebee-blossom-felt-barrette": (n) => `Bumblebee blossom felt barrette — ${n}`,
  "bumblebee-blossom-felt-brooch": (n) => `Bumblebee blossom felt brooch — ${n}`,
  "strawberry-blossom-faux-fur-claw-clip": (n) => `Strawberry blossom faux-fur claw clip (cream) — ${n}`,
  "strawberry-felt-headband-crimson": (n) => `Strawberry felt headband crimson — ${n}`,
  "strawberry-felt-headband-sage": (n) => `Strawberry felt headband sage — ${n}`,
  "strawberry-felt-hair-clip-pair": (n) => `Strawberry felt hair clip pair — ${n}`,
  "strawberry-cluster-hair-pin": (n) => `Strawberry cluster hair pin — ${n}`,
};

function loadMapping(): Row[] {
  const csvPath = resolve(
    "/Users/sooktengvun/tengology_web/photo-batch-2026-09-08-web/_logs/attach-mapping.csv",
  );
  const lines = readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
  const header = lines.shift()!.split(",");
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  return lines.map((line) => {
    // simple CSV (no embedded commas in our fields except maybe source path)
    const parts: string[] = [];
    let cur = "";
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { parts.push(cur); cur = ""; continue; }
      cur += ch;
    }
    parts.push(cur);
    return {
      img: parts[idx.img],
      slug: parts[idx.slug],
      url: parts[idx.url],
      note: parts[idx.note],
    };
  });
}

async function ensurePurpleDrafts() {
  const redClips = await prisma.product.findUniqueOrThrow({
    where: { slug: "reindeer-antler-rose-hair-clips" },
  });
  const redBand = await prisma.product.findUniqueOrThrow({
    where: { slug: "reindeer-antler-felt-headband" },
  });

  const drafts = [
    {
      slug: "purple-antler-rose-hair-clips",
      title: "Purple Antler & Rose Hair Clips — Pair",
      collection: "Deer Ears",
      subcategory: "HAIR_ACCESSORIES",
      price: redClips.price,
      materials: redClips.materials,
      shortDescription: "A matching pair of handmade felt antler hair clips with purple roses.",
      fullDescription:
        "A pair of felt deer-ear hair clips with brown antlers, purple roses, soft green leaves and tiny decorative details. Each ear is attached to its own metal clip.\n\nPrice is for one pair of hair clips. Handmade in Oxford.\n\nDraft listing — photos attached; not yet published.",
    },
    {
      slug: "purple-antler-rose-headband",
      title: "Purple Antler & Rose Headband",
      collection: "Deer Ears",
      subcategory: "HAIR_ACCESSORIES",
      price: redBand.price,
      materials: redBand.materials,
      shortDescription: "A handmade felt antler headband with purple roses on a lavender band.",
      fullDescription:
        "Flocked antlers, felt ears and a purple rose cluster on a satin alice band.\n\nHandmade in Oxford.\n\nDraft listing — photos attached; not yet published.",
    },
  ];

  const results: { slug: string; action: string }[] = [];
  for (const d of drafts) {
    const existing = await prisma.product.findUnique({ where: { slug: d.slug } });
    if (existing) {
      results.push({ slug: d.slug, action: "exists" });
      continue;
    }
    if (!APPLY) {
      results.push({ slug: d.slug, action: "would-create-unpublished" });
      continue;
    }
    await prisma.product.create({
      data: {
        slug: d.slug,
        title: d.title,
        category: "FELT",
        subcategory: d.subcategory,
        collection: d.collection,
        price: d.price,
        stockCount: 0,
        isPublished: false,
        materials: d.materials,
        shortDescription: d.shortDescription,
        fullDescription: d.fullDescription,
      },
    });
    results.push({ slug: d.slug, action: "created-unpublished" });
  }
  return results;
}

async function main() {
  const rows = loadMapping();
  // Guard: never use september-2026 collision path
  for (const r of rows) {
    if (r.url.includes("september-2026")) {
      throw new Error(`Jade collision path forbidden: ${r.url}`);
    }
    if (!r.url.startsWith("/products/sept8-2026/")) {
      throw new Error(`Unexpected asset path: ${r.url}`);
    }
  }

  const draftResult = await ensurePurpleDrafts();
  console.log("Draft SKUs:", draftResult);

  const bySlug = new Map<string, Row[]>();
  for (const r of rows) {
    const list = bySlug.get(r.slug) ?? [];
    list.push(r);
    bySlug.set(r.slug, list);
  }

  const summary: Record<string, unknown>[] = [];

  for (const [slug, images] of bySlug) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!product) {
      summary.push({ slug, error: "MISSING_PRODUCT", planned: images.length });
      continue;
    }

    const existingUrls = new Set(product.images.map((i) => i.url));
    const toAdd = images.filter((i) => !existingUrls.has(i.url));
    const skipped = images.length - toAdd.length;
    const weakGallery = product.images.length <= 1;
    const nextSortStart =
      product.images.length === 0
        ? 0
        : Math.max(...product.images.map((i) => i.sortOrder)) + 1;

    const plan = toAdd.map((img, idx) => ({
      url: img.url,
      altText: (ALT[slug] ?? ((n: string) => `${slug} — ${n}`))(img.note),
      sortOrder: nextSortStart + idx,
      isPrimary: weakGallery && idx === 0,
      note: img.note,
    }));

    summary.push({
      slug,
      published: product.isPublished,
      beforeCount: product.images.length,
      weakGallery,
      plannedAdd: plan.length,
      skippedExisting: skipped,
      setPrimaryOnFirstNew: weakGallery && plan.length > 0,
      urls: plan.map((p) => p.url),
    });

    if (!APPLY || plan.length === 0) continue;

    await prisma.$transaction(async (tx) => {
      if (weakGallery && plan[0]?.isPrimary) {
        await tx.productImage.updateMany({
          where: { productId: product.id },
          data: { isPrimary: false },
        });
      }
      for (const photo of plan) {
        const already = await tx.productImage.findFirst({
          where: { productId: product.id, url: photo.url },
        });
        if (already) continue;
        await tx.productImage.create({
          data: {
            productId: product.id,
            url: photo.url,
            altText: photo.altText,
            sortOrder: photo.sortOrder,
            isPrimary: photo.isPrimary,
          },
        });
      }
    });
  }

  console.log(JSON.stringify({ apply: APPLY, summary }, null, 2));
  if (!APPLY) {
    console.log("\nDry-run only. Re-run with --apply to write.");
  } else {
    console.log("\nApplied.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
