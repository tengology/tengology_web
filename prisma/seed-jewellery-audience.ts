/**
 * Classify jewellery for the For Her / For Him split.
 *
 * Only jewellery is classified: the split is a gift-shopping aid, and a felt
 * headband or a hair clip has no useful answer. A piece left null is not
 * "unisex" — it is unclassified, and shows under "Everyone" but under neither
 * side of the split, which is the honest state for anything not yet decided.
 *
 * Every current piece reads as women's: cluster and drop earrings, a bridal
 * initial necklace, floral crystal bracelets. The men's side is genuinely
 * empty until the studio makes for it — the darker stones (obsidian, tiger's
 * eye, hematoid) already in the bead designer are the obvious starting point.
 *
 * Idempotent: re-running only rewrites the same values.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const FOR_HER = [
  "clear-quartz-star-cluster-earrings",
  "pearl-carnelian-cluster-earrings",
  "green-fluorite-cluster-drop-earrings",
  "initial-letter-crystal-necklace",
  "milky-quartz-cluster-earrings",
  "rose-quartz-star-cluster-earrings",
  "smoky-quartz-drop-earrings",
  "autumn-glow-mixed-crystal-bracelet",
  "golden-hour-amethyst-citrine-bracelet",
  "rose-garden-mixed-crystal-bracelet",
  "golden-leaf-batik-bead-embroidered-earrings",
  "sage-green-felt-leaf-earrings",
];

const FOR_HIM: string[] = [];

async function main() {
  const her = await prisma.product.updateMany({
    where: { slug: { in: FOR_HER } },
    data: { audience: "HER" },
  });
  const him = FOR_HIM.length
    ? await prisma.product.updateMany({
        where: { slug: { in: FOR_HIM } },
        data: { audience: "HIM" },
      })
    : { count: 0 };

  // The bespoke anchor product is never browsed, so it stays unclassified.
  await prisma.product.updateMany({
    where: { slug: "bespoke-crystal-design" },
    data: { audience: null },
  });

  const unclassified = await prisma.product.findMany({
    where: { subcategory: "JEWELLERY", audience: null, isPublished: true },
    select: { slug: true },
  });

  console.log(`For Her: ${her.count}   For Him: ${him.count}`);
  if (unclassified.length) {
    console.log(
      `Still unclassified (published jewellery): ${unclassified
        .map((p) => p.slug)
        .join(", ")}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
