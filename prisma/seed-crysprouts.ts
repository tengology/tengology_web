import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Crysprouts — clay figures crowned with raw crystal, one listing each, in the
 * Gemstone › Ornaments bucket under the "Crysprout" collection.
 * Photos: May 2026 card shoot IMG_5993–6004 (Tengology album) →
 * public/products/crysprout/. Stones and benefits are as printed on each
 * sprout's card. The Oct 2025 daisy shoot is decoration only (taxonomy gallery).
 *
 * Idempotent on slug. Dry run unless --apply; created as drafts unless
 * --publish.
 *
 *   npx tsx prisma/seed-crysprouts.ts [--apply] [--publish]
 */

const APPLY = process.argv.includes("--apply");
const PUBLISH = process.argv.includes("--publish");

/** Teng, 2026-09-15: single-stone minis £20, large and three-stone £25, the big clear quartz point £30. */
const PRICE: Record<"large" | "mini", number> = { large: 25, mini: 20 };

const img = (n: number) => `/products/crysprout/img_${n}-garden.webp`;

type Sprout = {
  slug: string;
  /** As printed on the card. */
  stones: string[];
  size: "large" | "mini";
  intention: string;
  benefits: string;
  photo: number;
  /** Overrides the size price. */
  price?: number;
};

const SPROUTS: Sprout[] = [
  { slug: "mini-aquamarine-crysprout", stones: ["Aquamarine"], size: "mini", intention: "Stillness", benefits: "tranquility, courage, communication and protection", photo: 5994 },
  { slug: "mini-apatite-crysprout", stones: ["Apatite"], size: "mini", intention: "Uniqueness", benefits: "creativity, self-expression, communication and clarity", photo: 5995 },
  { slug: "mini-green-fluorite-crysprout", stones: ["Green Fluorite"], size: "mini", intention: "Focus", benefits: "concentration, learning, self-love and mental balance", photo: 5996 },
  { slug: "mini-sodalite-crysprout", stones: ["Sodalite"], size: "mini", intention: "Clarity", benefits: "truth, intuition, logic and emotional balance", photo: 5997 },
  { slug: "mini-rose-quartz-crysprout", stones: ["Rose Quartz"], size: "mini", intention: "Softness", benefits: "love, compassion, emotional healing and relationships", photo: 5998 },
  { slug: "mini-amethyst-crysprout", stones: ["Amethyst"], size: "mini", intention: "Stillness", benefits: "tranquility, peace, intuition and spiritual protection", photo: 6002 },
  { slug: "clear-quartz-crysprout", stones: ["Clear Quartz"], size: "large", intention: "Clarity", benefits: "amplified energy, clarity and focus — the master healer", photo: 5999, price: 30 },
  { slug: "amethyst-crysprout", stones: ["Amethyst"], size: "large", intention: "Stillness", benefits: "tranquility, peace, intuition and spiritual protection", photo: 6002 },
  { slug: "citrine-aquamarine-green-quartz-crysprout", stones: ["Citrine", "Aquamarine", "Green Quartz"], size: "large", intention: "Optimism", benefits: "success, joy, communication, compassionate connection, growth and balance", photo: 6001 },
  { slug: "rose-quartz-amethyst-citrine-crysprout", stones: ["Rose Quartz", "Amethyst", "Citrine"], size: "large", intention: "Connection", benefits: "love, peace, abundance, joy and harmony", photo: 6003 },
  { slug: "citrine-amethyst-clear-quartz-crysprout", stones: ["Citrine", "Amethyst", "Clear Quartz"], size: "large", intention: "Alignment", benefits: "abundance, intuition, aligned energy and transformation", photo: 6004 },
];

const list = (xs: string[]) =>
  xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} & ${xs[xs.length - 1]}`;

function title(s: Sprout) {
  return `${s.size === "mini" ? "Mini " : ""}${list(s.stones)} Crysprout`;
}

function copy(s: Sprout) {
  const stones = list(s.stones);
  const crown = s.stones.length > 1 ? `raw ${stones.toLowerCase()}` : `a raw ${stones.toLowerCase()}`;
  const short = `A ${s.size === "mini" ? "little " : ""}clay sprout crowned with ${crown} — for ${s.benefits.split(/,| and | — /)[0]}.`;
  const full = `A round clay sprout with a sleepy smile, crowned with ${crown} set into a tuft of moss and tiny flowers, so it looks as if it grew there.

${stones} ${s.stones.length > 1 ? "are" : "is"} kept for ${s.benefits}. Your sprout arrives with its own illustrated intention card, explaining what ${s.stones.length > 1 ? "each stone" : "the stone"} is kept for.

Made around its own ${s.stones.length > 1 ? "stones" : "stone"}, so this is the only one — the sprout in the photograph is the sprout you get. Happy on a desk, a windowsill or beside the bed.

✦ Hand-shaped clay · Raw ${stones.toLowerCase()} · Intention card included · One of a kind

Made in Oxford.`;
  return { short, full };
}

async function main() {
  console.log(APPLY ? `APPLYING (${PUBLISH ? "published" : "drafts"})` : "DRY RUN (pass --apply to write)");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  for (const s of SPROUTS) {
    const { short, full } = copy(s);
    const data = {
      title: title(s),
      shortDescription: short,
      fullDescription: full,
      category: "GEMSTONE",
      subcategory: "ORNAMENTS",
      collection: "Crysprout",
      intention: s.intention,
      materials: `clay, ${s.stones.map((x) => x.toLowerCase()).join(", ")}, preserved moss, dried flowers`,
      price: s.price ?? PRICE[s.size],
      stockCount: 1,
      isPublished: PUBLISH,
    };
    const image = {
      url: img(s.photo),
      altText: `${title(s)} — clay figure crowned with ${list(s.stones).toLowerCase()}, beside its crystal card`,
      sortOrder: 0,
      isPrimary: true,
    };

    const existing = await prisma.product.findUnique({ where: { slug: s.slug }, include: { images: true } });
    console.log(`  ${existing ? "~" : "+"} ${s.slug} — ${data.title} £${data.price} (${s.size}, ${s.intention}) IMG_${s.photo}`);
    if (!APPLY) {
      if (s === SPROUTS[0]) console.log(`\n    ${short}\n\n    ${full.replace(/\n/g, "\n    ")}\n`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const product = existing
        ? await tx.product.update({ where: { id: existing.id }, data })
        : await tx.product.create({ data: { ...data, slug: s.slug } });
      const current = existing?.images.find((i) => i.url === image.url);
      await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false } });
      if (current) await tx.productImage.update({ where: { id: current.id }, data: image });
      else await tx.productImage.create({ data: { ...image, productId: product.id } });
      const seo = {
        metaTitle: `${data.title} | Clay & Raw Crystal Figure`,
        metaDescription: `A one-of-a-kind clay Crysprout crowned with raw ${list(s.stones).toLowerCase()}, moss and tiny flowers. Made in Oxford.`,
      };
      await tx.productSeo.upsert({ where: { productId: product.id }, update: seo, create: { ...seo, productId: product.id } });
    });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
