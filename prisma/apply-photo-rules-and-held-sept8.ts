/**
 * 1) Apply Teng photo rules (Poppy first): delete cropped/composites, set Sept-8 singles as primary.
 * 2) Fix sunflower-felt-brooch flatlay (+ sunflower clip primary).
 * 3) Antler Colour merge (clips + floral headband).
 * 4) Create held SKUs G07–G10 + unpublished G12 fidget draft.
 *
 * Dry-run: npx tsx prisma/apply-photo-rules-and-held-sept8.ts
 * Apply:   npx tsx prisma/apply-photo-rules-and-held-sept8.ts --apply
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { writeFileSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const APPLY = process.argv.includes("--apply");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Img = { url: string; altText: string };

const deletedLog: { slug: string; url: string; reason: string }[] = [];
const report: Record<string, unknown> = { apply: APPLY, deleted: deletedLog };

function deleteReason(url: string): string {
  if (url.includes("poppy-set-group")) return "group flatlay";
  if (
    url.includes("poppy-brooch-hero") ||
    url.includes("poppy-brooch-2") ||
    url.includes("poppy-headband-hero")
  )
    return "cropped/composite";
  if (url.includes("flatlay") || url.includes("headband-and-clips")) return "group flatlay";
  return "not in cleaned gallery";
}

async function retire(slug: string, into: string) {
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (!existing) {
    console.log(`  retire skip (missing): ${slug}`);
    return;
  }
  if (!APPLY) {
    console.log(`  would-retire ${slug} → ${into} (published=${existing.isPublished})`);
    return;
  }
  await prisma.product.update({
    where: { slug },
    data: { isPublished: false, isFeatured: false },
  });
  console.log(`  retired ${slug} → ${into}`);
}

async function replaceGallery(
  slug: string,
  ordered: Img[],
  productPatch?: Record<string, unknown>,
) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true },
  });
  if (!product) throw new Error(`missing product ${slug}`);

  const finalUrls = new Set(ordered.map((o) => o.url));
  const deleteThese = product.images.filter((i) => !finalUrls.has(i.url));
  for (const d of deleteThese) {
    deletedLog.push({ slug, url: d.url, reason: deleteReason(d.url) });
  }

  console.log(
    `  ${slug}: gallery ${product.images.length} → ${ordered.length}; delete ${deleteThese.length}; primary → ${ordered[0]?.url}`,
  );

  if (!APPLY) return;

  await prisma.$transaction(
    async (tx) => {
      if (deleteThese.length) {
        await tx.productImage.deleteMany({
          where: { id: { in: deleteThese.map((d) => d.id) } },
        });
      }
      const remaining = await tx.productImage.findMany({ where: { productId: product.id } });
      const byUrl = new Map(remaining.map((i) => [i.url, i]));

      await tx.productImage.updateMany({
        where: { productId: product.id },
        data: { isPrimary: false },
      });

      for (const [sortOrder, img] of ordered.entries()) {
        const existing = byUrl.get(img.url);
        const isPrimary = sortOrder === 0;
        if (existing) {
          await tx.productImage.update({
            where: { id: existing.id },
            data: { sortOrder, isPrimary, altText: img.altText },
          });
        } else {
          await tx.productImage.create({
            data: {
              productId: product.id,
              url: img.url,
              altText: img.altText,
              sortOrder,
              isPrimary,
            },
          });
        }
      }

      if (productPatch) {
        await tx.product.update({ where: { id: product.id }, data: productPatch });
      }
    },
    { timeout: 60000 },
  );
}

async function ensureProduct(data: {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  collection: string;
  materials: string;
  price: number;
  stockCount: number;
  isPublished: boolean;
  images: Img[];
}) {
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (!existing) {
    console.log(`  create ${data.slug} published=${data.isPublished} imgs=${data.images.length}`);
    if (!APPLY) return;
    await prisma.product.create({
      data: {
        slug: data.slug,
        title: data.title,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        category: data.category,
        subcategory: data.subcategory,
        collection: data.collection,
        materials: data.materials,
        price: data.price,
        stockCount: data.stockCount,
        isPublished: data.isPublished,
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            altText: img.altText,
            sortOrder: i,
            isPrimary: i === 0,
          })),
        },
      },
    });
    return;
  }
  console.log(`  upsert-existing ${data.slug}`);
  await replaceGallery(data.slug, data.images, {
    title: data.title,
    shortDescription: data.shortDescription,
    fullDescription: data.fullDescription,
    price: data.price,
    stockCount: data.stockCount,
    isPublished: data.isPublished,
    collection: data.collection,
    subcategory: data.subcategory,
    materials: data.materials,
  });
}

async function cleanPoppy() {
  console.log("\n=== POPPY photo rules ===");
  await replaceGallery("remembrance-poppy-felt-brooch", [
    { url: "/products/sept8-2026/img_9517.webp", altText: "Remembrance poppy felt brooch on kraft card — front" },
    { url: "/products/sept8-2026/img_9519.webp", altText: "Remembrance poppy felt brooch — front alt" },
    { url: "/products/sept8-2026/img_9520.webp", altText: "Remembrance poppy felt brooch — front alt 2" },
    { url: "/products/sept8-2026/img_9518.webp", altText: "Remembrance poppy felt brooch — pin back" },
  ]);

  await replaceGallery("remembrance-poppy-felt-hair-clip", [
    { url: "/products/sept8-2026/img_9525.webp", altText: "Remembrance poppy felt hair clip on kraft card — front" },
    { url: "/products/sept8-2026/img_9529.webp", altText: "Remembrance poppy felt hair clip — front alt" },
    { url: "/products/sept8-2026/img_9530.webp", altText: "Remembrance poppy felt hair clip — clip back" },
    { url: "/products/sept8-2026/img_9531.webp", altText: "Remembrance poppy felt hair clip — clip open" },
    { url: "/products/festive/poppy-clip-hero.jpg", altText: "Remembrance poppy felt hair clip held on card" },
  ]);

  await replaceGallery("remembrance-poppy-felt-headband", [
    { url: "/products/sept8-2026/img_9538.webp", altText: "Remembrance poppy felt headband on grapevine wreath" },
    { url: "/products/sept8-2026/img_9539.webp", altText: "Remembrance poppy felt headband on wreath — alt" },
    { url: "/products/sept8-2026/img_9533.webp", altText: "Remembrance poppy felt headband held" },
    { url: "/products/model/remembrance-poppy-felt-headband-1.jpg", altText: "Remembrance poppy felt headband worn" },
    { url: "/products/model/remembrance-poppy-felt-headband-2.jpg", altText: "Remembrance poppy felt headband worn — alt" },
  ]);
}

async function fixSunflower() {
  console.log("\n=== Sunflower brooch (strip headband flatlay) ===");
  const p = await prisma.product.findUniqueOrThrow({
    where: { slug: "sunflower-felt-brooch" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  const flatlay = "/products/sunflower/sunflower-accessories-flatlay-v2.jpeg";
  const ordered = p.images
    .filter((i) => i.url !== flatlay)
    .map((i) => ({ url: i.url, altText: i.altText ?? "Sunflower felt brooch" }));
  const lifestyle = "/products/sunflower/sunflower-brooch-lifestyle-v1.jpeg";
  if (!ordered.some((i) => i.url === lifestyle)) {
    ordered.push({ url: lifestyle, altText: "Sunflower felt brooch lifestyle" });
  }
  await replaceGallery("sunflower-felt-brooch", ordered);

  console.log("\n=== Sunflower hair clip (sept8 primary, strip flatlays) ===");
  const clip = await prisma.product.findUniqueOrThrow({
    where: { slug: "sunflower-felt-hair-clip" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  const drop = new Set([
    "/products/sunflower/sunflower-accessories-flatlay-v2.jpeg",
    "/products/sunflower/sunflower-headband-and-clips-flatlay-v2.jpeg",
    "/products/sunflower/sunflower-headband-clips-closeup-v2.jpeg",
  ]);
  const preferredPrimary = "/products/sept8-2026/img_9480.webp";
  const sept8 = clip.images
    .filter((i) => i.url.startsWith("/products/sept8-2026/"))
    .sort((a, b) => {
      if (a.url === preferredPrimary) return -1;
      if (b.url === preferredPrimary) return 1;
      return a.sortOrder - b.sortOrder;
    });
  const other = clip.images.filter(
    (i) => !i.url.startsWith("/products/sept8-2026/") && !drop.has(i.url),
  );
  await replaceGallery("sunflower-felt-hair-clip", [
    ...sept8.map((i) => ({ url: i.url, altText: i.altText ?? "Sunflower felt hair clip" })),
    ...other.map((i) => ({ url: i.url, altText: i.altText ?? "Sunflower felt hair clip" })),
  ]);
}

async function mergeAntlerClips() {
  console.log("\n=== Antler clips Colour merge → reindeer-antler-rose-hair-clips ===");
  const red = await prisma.product.findUniqueOrThrow({
    where: { slug: "reindeer-antler-rose-hair-clips" },
    include: { images: true },
  });
  const blush = await prisma.product.findUnique({
    where: { slug: "blush-antler-rose-hair-clips" },
    include: { images: true },
  });
  const purple = await prisma.product.findUnique({
    where: { slug: "purple-antler-rose-hair-clips" },
    include: { images: true },
  });

  const urls: Img[] = [
    { url: "/products/sept8-2026/img_9505.webp", altText: "Reindeer antler & red rose hair clips — pair front" },
    { url: "/products/sept8-2026/img_9507.webp", altText: "Reindeer antler & red rose hair clips — pair back" },
    { url: "/products/sept8-2026/img_9510.webp", altText: "Reindeer antler & red rose hair clips — held detail" },
    { url: "/products/sept8-2026/img_9503.webp", altText: "Blush antler & rose hair clips — pair front" },
    { url: "/products/sept8-2026/img_9504.webp", altText: "Blush antler & rose hair clips — pair back" },
    { url: "/products/sept8-2026/img_9514.webp", altText: "Blush antler & rose hair clips — held detail" },
    { url: "/products/sept8-2026/img_9485.webp", altText: "Purple antler & rose hair clips — pair front" },
    { url: "/products/sept8-2026/img_9486.webp", altText: "Purple antler & rose hair clips — pair alt" },
    { url: "/products/sept8-2026/img_9508.webp", altText: "Purple antler & rose hair clips — pair front 2" },
    { url: "/products/sept8-2026/img_9509.webp", altText: "Purple antler & rose hair clips — pair back" },
  ];
  for (const src of [red, blush, purple]) {
    if (!src) continue;
    for (const i of src.images) {
      if (urls.some((u) => u.url === i.url)) continue;
      if (i.url.includes("antler-headbands-approved")) continue;
      if (i.url.startsWith("/products/sept8-2026/")) continue;
      urls.push({ url: i.url, altText: i.altText ?? "Antler rose hair clips" });
    }
  }

  await replaceGallery("reindeer-antler-rose-hair-clips", urls, {
    title: "Reindeer Antler & Rose Hair Clips — Pair",
    collection: "Deer Ears",
    shortDescription:
      "A matching pair of handmade felt antler hair clips with a rose cluster — choose red, blush or purple.",
    fullDescription:
      "A pair of felt deer-ear hair clips with brown antlers, a rose with soft green leaves and tiny decorative details. Each ear is attached to its own metal clip.\n\nChoose your colour: Red / Christmas, Blush / pink, or Purple / lavender.\n\nPrice is for one pair of hair clips. Handmade in Oxford.",
    stockCount: Math.max(red.stockCount, 1),
    isPublished: true,
  });

  await retire("blush-antler-rose-hair-clips", "reindeer-antler-rose-hair-clips");
  await retire("purple-antler-rose-hair-clips", "reindeer-antler-rose-hair-clips");
}

async function mergeAntlerHeadbands() {
  console.log("\n=== Antler headbands Colour merge → reindeer-antler-floral-headband ===");
  const red = await prisma.product.findUnique({
    where: { slug: "reindeer-antler-felt-headband" },
    include: { images: true },
  });
  const already = await prisma.product.findUnique({
    where: { slug: "reindeer-antler-floral-headband" },
  });

  const gallery: Img[] = [
    { url: "/products/sept8-2026/img_9553.webp", altText: "Reindeer antler floral headband — red band full" },
    { url: "/products/sept8-2026/img_9545.webp", altText: "Reindeer antler floral headband — red detail" },
    { url: "/products/sept8-2026/img_9546.webp", altText: "Reindeer antler floral headband — red detail alt" },
    { url: "/products/sept8-2026/img_9552.webp", altText: "Blush antler floral headband — full band" },
    { url: "/products/sept8-2026/img_9547.webp", altText: "Blush antler floral headband — detail" },
    { url: "/products/sept8-2026/img_9548.webp", altText: "Blush antler floral headband — detail alt" },
    { url: "/products/sept8-2026/img_9551.webp", altText: "Purple antler floral headband — full band" },
    { url: "/products/sept8-2026/img_9549.webp", altText: "Purple antler floral headband — detail" },
    { url: "/products/sept8-2026/img_9550.webp", altText: "Purple antler floral headband — detail alt" },
    { url: "/products/model/reindeer-antler-felt-headband-1.jpg", altText: "Reindeer antler floral headband worn" },
    { url: "/products/model/reindeer-antler-felt-headband-2.jpg", altText: "Reindeer antler floral headband worn — alt" },
    { url: "/products/festive/reindeer-antler-headband-hero.jpg", altText: "Reindeer antler floral headband — studio hero" },
  ];

  const price = Number(red?.price ?? 18);
  const materials = red?.materials || "wool felt, flocked antlers, satin alice band, decorative details";
  const patch = {
    title: "Reindeer Antler & Rose Floral Headband",
    shortDescription:
      "Handmade antler headband with rose cluster — choose red, blush or purple band.",
    fullDescription:
      "Flocked antlers, felt ears and a rose cluster with leaves and berries on a satin alice band.\n\nChoose your colour: Red band, Blush / pink band, or Purple / lavender band.\n\nPrice is for one headband. Handmade in Oxford.",
    price,
    stockCount: 1,
    isPublished: true,
    collection: "Deer Ears",
    subcategory: "HAIR_ACCESSORIES",
    materials,
  };

  if (already) {
    await replaceGallery("reindeer-antler-floral-headband", gallery, patch);
  } else if (red) {
    if (!APPLY) {
      console.log("  would-rename reindeer-antler-felt-headband → reindeer-antler-floral-headband");
      console.log(`  would-set gallery ${gallery.length}; price £${price}`);
    } else {
      await prisma.product.update({
        where: { id: red.id },
        data: { slug: "reindeer-antler-floral-headband", ...patch },
      });
      await replaceGallery("reindeer-antler-floral-headband", gallery);
    }
  } else {
    await ensureProduct({
      slug: "reindeer-antler-floral-headband",
      category: "FELT",
      ...patch,
      images: gallery,
    } as never);
  }

  await retire("blush-antler-rose-headband", "reindeer-antler-floral-headband");
  await retire("purple-antler-rose-headband", "reindeer-antler-floral-headband");
  const redStill = await prisma.product.findUnique({ where: { slug: "reindeer-antler-felt-headband" } });
  if (redStill) await retire("reindeer-antler-felt-headband", "reindeer-antler-floral-headband");
}

async function createHeld() {
  console.log("\n=== Held creates G07–G12 ===");
  const pumpkin = await prisma.product.findUniqueOrThrow({ where: { slug: "pumpkin-felt-hair-clip" } });
  const clipPrice = Number(pumpkin.price);

  await ensureProduct({
    slug: "woodland-toadstool-felt-brooch",
    title: "Woodland Toadstool Felt Brooch",
    shortDescription:
      "A handmade woodland brooch with spotted toadstools, a daisy, acorns and pinecones.",
    fullDescription:
      "A botanical woodland brooch on a dark felt base: red spotted toadstools, a white daisy, acorn caps with felt nuts, tiny pinecones and mixed leaves.\n\nFinished with a brooch pin. One of a kind.\n\nHandmade in Oxford.",
    category: "FELT",
    subcategory: "BROOCHES",
    collection: "Woodland",
    materials: "wool felt, natural pinecones, acorn caps, brooch pin",
    price: 8,
    stockCount: 1,
    isPublished: true,
    images: [
      { url: "/products/sept8-2026/img_9626.webp", altText: "Woodland toadstool felt brooch on kraft card" },
    ],
  });

  await ensureProduct({
    slug: "reindeer-antler-rose-felt-brooch",
    title: "Reindeer Antler & Rose Felt Brooch",
    shortDescription:
      "A handmade reindeer antler brooch with a red rose cluster and flocked antler.",
    fullDescription:
      "The same antler-and-rose motif as the hair clips, finished as a brooch: flocked antler, felt ear, red rose with leaves and berries on a pin back.\n\nPrice is for one brooch. Handmade in Oxford.",
    category: "FELT",
    subcategory: "BROOCHES",
    collection: "Deer Ears",
    materials: "wool felt, flocked antler, brooch pin, decorative details",
    price: 12,
    stockCount: 1,
    isPublished: true,
    images: [
      { url: "/products/sept8-2026/img_9631.webp", altText: "Reindeer antler rose felt brooch on kraft card — front" },
      { url: "/products/sept8-2026/img_9632.webp", altText: "Reindeer antler rose felt brooch — pin back" },
      { url: "/products/sept8-2026/img_9629.webp", altText: "Reindeer antler rose felt brooches — pair on linen" },
      { url: "/products/sept8-2026/img_9628.webp", altText: "Reindeer antler rose felt brooches — pair alt" },
      { url: "/products/sept8-2026/img_9630.webp", altText: "Reindeer antler rose felt brooch — detail" },
    ],
  });

  await ensureProduct({
    slug: "heart-rose-plush-hair-clip",
    title: "Heart Rose Plush Hair Clip",
    shortDescription:
      "A fluffy cream heart hair clip with a red felt rose, leaves and berries.",
    fullDescription:
      "A soft plush heart base topped with a red felt rosebud, green leaves and tiny berries. Pair photographed; price is for one clip.\n\nHandmade in Oxford.",
    category: "FELT",
    subcategory: "HAIR_ACCESSORIES",
    collection: "Winter",
    materials: "plush fabric, wool felt, metal hair clip",
    price: clipPrice,
    stockCount: 1,
    isPublished: true,
    images: [
      { url: "/products/sept8-2026/img_9635.webp", altText: "Heart rose plush hair clips on wood slice" },
      { url: "/products/sept8-2026/img_9634.webp", altText: "Heart rose plush hair clips — alt angle" },
      { url: "/products/sept8-2026/img_9633.webp", altText: "White and red rose plush cat-ear hair clips on a wood slice" },
    ],
  });

  await ensureProduct({
    slug: "layered-felt-flower-hair-clip",
    title: "Layered Felt Flower Hair Clip",
    shortDescription:
      "A layered wool-felt flower hair clip — choose from eight colourways.",
    fullDescription:
      `A hand-cut layered felt bloom with leaves and berry accents on a colour-matched grosgrain-wrapped alligator clip.\n\nChoose your colour. Price is for one clip. Made to order in Oxford.\n\n(Price matched to pumpkin-felt-hair-clip at £${clipPrice}.)`,
    category: "FELT",
    subcategory: "HAIR_ACCESSORIES",
    collection: "Statement Blooms",
    materials: "wool felt, grosgrain ribbon, metal alligator clip",
    price: clipPrice,
    stockCount: 1,
    isPublished: true,
    images: [
      { url: "/products/sept8-2026/img_9643.webp", altText: "Layered felt flower hair clip — lavender" },
      { url: "/products/sept8-2026/img_9657.webp", altText: "Layered felt flower hair clip — pink / magenta" },
      { url: "/products/sept8-2026/img_9664.webp", altText: "Layered felt flower hair clip — deep red / burgundy" },
      { url: "/products/sept8-2026/img_9678.webp", altText: "Layered felt flower hair clip — colourway" },
      { url: "/products/sept8-2026/img_9688.webp", altText: "Layered felt flower hair clip — colourway" },
      { url: "/products/sept8-2026/img_9638.webp", altText: "Layered felt flower hair clip — colourway" },
      { url: "/products/sept8-2026/img_9639.webp", altText: "Layered felt flower hair clip — colourway" },
      { url: "/products/sept8-2026/img_9640.webp", altText: "Layered felt flower hair clip — colourway" },
      { url: "/products/sept8-2026/img_9641.webp", altText: "Layered felt flower hair clip — colourway" },
      { url: "/products/sept8-2026/img_9642.webp", altText: "Layered felt flower hair clip — colourway" },
      { url: "/products/sept8-2026/img_9636.webp", altText: "Layered felt flower hair clips — colour family flatlay" },
    ],
  });

  await ensureProduct({
    slug: "alphabet-switch-fidget-keychain",
    title: "Alphabet Switch Fidget Keychain",
    shortDescription:
      "Mechanical-switch style fidget keychains with letter/symbol caps — draft for review.",
    fullDescription:
      "Colourful switch-style fidget keychains with letter and symbol keycaps, jingle bells and carabiners.\n\nDRAFT — not confirmed as a Tengology core SKU. Photos attached for Teng to decide. Not published.",
    category: "OTHER",
    subcategory: "ACCESSORIES",
    collection: "Draft",
    materials: "plastic switch housing, keycap, bell, carabiner",
    price: 6,
    stockCount: 0,
    isPublished: false,
    images: [
      { url: "/products/sept8-2026/img_9692.webp", altText: "Alphabet switch fidget keychains — grid" },
      { url: "/products/sept8-2026/img_9693.webp", altText: "Alphabet switch fidget keychains — detail" },
      { url: "/products/sept8-2026/img_9694.webp", altText: "Alphabet switch fidget keychains — detail alt" },
    ],
  });
}

async function main() {
  await cleanPoppy();
  await fixSunflower();
  await mergeAntlerClips();
  await mergeAntlerHeadbands();
  await createHeld();

  const out = `/tmp/tengology-photo-rules-held-${Date.now()}.json`;
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log("\nDeleted URL log count:", deletedLog.length);
  for (const d of deletedLog) console.log(`  DEL ${d.slug}: ${d.url} (${d.reason})`);
  console.log("Report:", out);
  if (!APPLY) console.log("\nDry-run only. Re-run with --apply to write.");
  else console.log("\nApplied.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
