import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Heart Rose Plush Hair Clip → Cat Ear Rose Plush Hair Clips — Pair.
 * Adds the Sept 9 shoot (IMG_9740–9758) for all three colourways and makes
 * the three-together shot the primary. Slug kept so existing links hold.
 * Idempotent on URL. Dry run unless --apply.
 *
 *   npx tsx prisma/update-cat-ear-rose-clips.ts [--apply]
 */

const SLUG = "heart-rose-plush-hair-clip";
const APPLY = process.argv.includes("--apply");

const TITLE = "Cat Ear Rose Plush Hair Clips — Pair";

const SHORT =
  "A pair of fluffy plush cat-ear claw clips, each finished with a felt rose, leaves and berries. In Cream / Blush, Snow White / Red, or Mocha / Lilac.";

const FULL = `Two soft plush cat ears, each one its own small claw clip, finished at the base with a hand-shaped felt rose, a spray of leaves and felted berries. Clip one either side for ears that peek out of loose hair, a half-up twist or a pair of bunches.

Choose your colour:
• Cream / Blush — cream plush, dusty pink rose, spring-green leaves
• Snow White / Red — white plush, red rose, holly-green leaves
• Mocha / Lilac — mocha plush, lilac rose with a plum berry, sage leaves

Price is for one pair (two clips).

• Faux-fur plush over a small claw clip
• Wool felt rose and leaves, felted wool berries
• Made in Oxford`;

const MATERIALS = "faux-fur plush, wool felt, felted wool berries, claw clips";

const P = "/products/sept8-2026";

/** Final gallery, in order. The first is primary. */
const GALLERY: { url: string; altText: string }[] = [
  { url: `${P}/img_9740.webp`, altText: "Cat ear rose plush hair clips in all three colours — Cream / Blush, Snow White / Red and Mocha / Lilac — on a wood slice" },
  { url: `${P}/img_9744.webp`, altText: "All three colours of the cat ear rose clips, Mocha / Lilac pair in front" },
  { url: `${P}/img_9747.webp`, altText: "Cream / Blush cat ear rose clips — pair from above" },
  { url: `${P}/img_9746.webp`, altText: "Cream / Blush cat ear rose clips — pair side view" },
  { url: `${P}/img_9756.webp`, altText: "Cream / Blush cat ear clip held open to show the claw clip" },
  { url: `${P}/img_9748.webp`, altText: "Snow White / Red cat ear rose clips — pair from above" },
  { url: `${P}/img_9635.webp`, altText: "Snow White / Red cat ear rose clips — pair on a wood slice" },
  { url: `${P}/img_9634.webp`, altText: "Snow White / Red cat ear rose clips — alt angle" },
  { url: `${P}/img_9757.webp`, altText: "Snow White / Red cat ear clip held open to show the claw clip" },
  { url: `${P}/img_9751.webp`, altText: "Mocha / Lilac cat ear rose clips — pair from above" },
  { url: `${P}/img_9753.webp`, altText: "Mocha / Lilac cat ear rose clips — pair on linen" },
  { url: `${P}/img_9758.webp`, altText: "Mocha / Lilac cat ear clip held open to show the claw clip" },
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const product = await prisma.product.findUnique({
    where: { slug: SLUG },
    include: { images: true },
  });
  if (!product) throw new Error(`No product for slug ${SLUG}`);

  console.log(APPLY ? "APPLYING" : "DRY RUN (pass --apply to write)");
  console.log(`  title: ${product.title} → ${TITLE}`);

  const byUrl = new Map(product.images.map((img) => [img.url, img]));
  const extras = product.images.filter((img) => !GALLERY.some((g) => g.url === img.url));
  if (extras.length) console.log(`  kept at end: ${extras.map((e) => e.url).join(", ")}`);

  if (APPLY) {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: { title: TITLE, shortDescription: SHORT, fullDescription: FULL, materials: MATERIALS },
      });
      await tx.productSeo.upsert({
        where: { productId: product.id },
        update: {
          metaTitle: "Cat Ear Rose Plush Hair Clips — Pair | Handmade Felt",
          metaDescription:
            "A pair of fluffy cat-ear claw clips with handmade felt roses, in Cream / Blush, Snow White / Red or Mocha / Lilac. Made in Oxford.",
        },
        create: {
          productId: product.id,
          metaTitle: "Cat Ear Rose Plush Hair Clips — Pair | Handmade Felt",
          metaDescription:
            "A pair of fluffy cat-ear claw clips with handmade felt roses, in Cream / Blush, Snow White / Red or Mocha / Lilac. Made in Oxford.",
        },
      });
      await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false } });
      for (const [i, g] of GALLERY.entries()) {
        const data = { altText: g.altText, sortOrder: i, isPrimary: i === 0 };
        const existing = byUrl.get(g.url);
        if (existing) await tx.productImage.update({ where: { id: existing.id }, data });
        else await tx.productImage.create({ data: { ...data, productId: product.id, url: g.url } });
      }
      for (const [i, e] of extras.entries()) {
        await tx.productImage.update({ where: { id: e.id }, data: { sortOrder: GALLERY.length + i } });
      }
    });
  }

  for (const [i, g] of GALLERY.entries()) {
    console.log(`  ${i}${i === 0 ? " *" : "  "} ${byUrl.has(g.url) ? "=" : "+"} ${g.url}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
