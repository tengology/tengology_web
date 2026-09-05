/**
 * Price the one-of-a-kind gemstone earrings.
 *
 * These sit outside the shop-counter sheet on purpose. That sheet prices
 * repeatable stock — a nigiri ornament, a sunflower clip, anything the studio
 * can make fifty of. Each of these pairs exists once: the stones were bought as
 * a single parcel, they are gone, and the design cannot be restrung.
 *
 * That changes the comparison set. Etsy's £21–36 band is where sellers restring
 * one design indefinitely; genuinely unrepeatable wire-wrapped work from UK
 * makers sits at £55 (Odessi9), £78 (Zahidas, 14k gold-filled) and £100
 * (ISAland). £36–54 is the gap between the two, which is where these belong.
 *
 * The ladder is anchored on the smoky quartz pair at £54 — the studio's own
 * number, and the right one: it is the longest, carries the most stone, and its
 * hematite-and-tiger's-eye cascade is many separate hand-wrapped links rather
 * than one cluster. Everything else is stepped down from there on drop length,
 * bead count and what the materials actually cost.
 *
 * Idempotent.
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

interface Row {
  slug: string;
  price: number;
  /** What earns the step: material value first, then labour. */
  why: string;
}

const PRICES: Row[] = [
  {
    slug: "smoky-quartz-drop-earrings",
    price: 54,
    why: "Longest drop; raw citrine crown over a chain cascade of tiger's eye and hematite — the most separate wrapped links of the six",
  },
  {
    slug: "pearl-carnelian-cluster-earrings",
    price: 46,
    why: "Baroque freshwater coin pearls, the dearest material here, under a cluster graded bead-by-bead from carnelian to champagne",
  },
  {
    slug: "green-fluorite-cluster-drop-earrings",
    price: 42,
    why: "The densest cluster — the most individual wraps — over a faceted fluorite nugget",
  },
  {
    slug: "milky-quartz-cluster-earrings",
    price: 40,
    why: "Same build as the fluorite with a looser cluster and a smaller drop",
  },
  {
    slug: "rose-quartz-star-cluster-earrings",
    price: 38,
    why: "Faceted rose quartz stars, the largest of the two star drops, with real freshwater pearls in the cluster; silver-finished",
  },
  {
    slug: "clear-quartz-star-cluster-earrings",
    price: 36,
    why: "The smallest pair: a carved star on a headpin under a compact spinel and labradorite cluster",
  },
];

async function main() {
  for (const row of PRICES) {
    const before = await prisma.product.findUnique({
      where: { slug: row.slug },
      select: { title: true, price: true, stockCount: true },
    });
    if (!before) {
      console.log(`  MISSING  ${row.slug}`);
      continue;
    }
    if (before.price !== row.price) {
      await prisma.product.update({ where: { slug: row.slug }, data: { price: row.price } });
    }
    const move = before.price === row.price ? "unchanged" : `£${before.price} → £${row.price}`;
    console.log(`£${row.price}  ${before.title}\n        ${move}, stock ${before.stockCount}\n        ${row.why}\n`);
  }
}

main().finally(() => prisma.$disconnect());
