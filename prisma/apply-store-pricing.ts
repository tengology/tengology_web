/**
 * Bring every listing onto the shop-counter price list.
 *
 * Prices come from "Sell in Store.xlsx", sheet `Sheet12` — the Oxford column,
 * which is the studio's own retail sheet for the physical stockists. The
 * website had been carrying my earlier guesses, and several of them were well
 * above what the same piece sells for on a shelf.
 *
 * `sheet` on each row is the line it was taken from, verbatim, so the two can
 * be reconciled later without re-reading the spreadsheet. Where a listing's
 * name and the sheet's name differ, the match was made on the photograph and
 * the description, and `note` says how.
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
  /** The `Sheet12` product title this price was read from. */
  sheet: string;
  /** Why this pairing, where the two names don't read the same. */
  note?: string;
}

const PRICES: Row[] = [
  // ---- Felt: hair accessories ----
  { slug: "autumn-pumpkin-felt-headband", price: 18, sheet: "Headband - Pumpkins" },
  { slug: "blue-anemone-headband", price: 9, sheet: "Headband - Single flower", note: "Draft; was to be folded into single-flower-headband" },
  { slug: "blush-antler-rose-headband", price: 18, sheet: "Headband - Deer", note: "Felt antlers; the sheet files antlers under deer" },
  { slug: "bunny-bloom-felt-headband", price: 18, sheet: "Headband - Easter rabbit ears" },
  { slug: "daffodil-felt-hair-clip", price: 7, sheet: "Hair clip - Daffodil" },
  { slug: "easter-bunny-ear-floral-hair-clip", price: 18, sheet: "Hair Clip Pair - Easter rabbit ears" },
  { slug: "easter-bunny-ear-floral-headband", price: 18, sheet: "Headband - Easter rabbit ears" },
  { slug: "festive-berry-felt-headband", price: 18, sheet: "Headband - Berry Bow" },
  { slug: "flower-headband", price: 18, sheet: "Headband - Flower" },
  { slug: "forget-me-not-felt-hair-clip", price: 12, sheet: "Hair Clip - Forget-me-not" },
  { slug: "forget-me-not-long-barrette", price: 15, sheet: "Barrette clip - Forget-me-not" },
  { slug: "peach-hibiscus-felt-hair-clip", price: 7, sheet: "Hair Clip - Single Peach Flower", note: "One bloom, not the triple" },
  { slug: "pink-sakura-felt-hair-clip", price: 7, sheet: "Hair clip - Sakura" },
  { slug: "pink-sakura-felt-headband", price: 18, sheet: "Headband - Cherry Blossom" },
  { slug: "pink-sakura-pearl-claw-clip", price: 15, sheet: "Claw Clip - Cherry blossom" },
  { slug: "reindeer-antler-felt-headband", price: 18, sheet: "Headband - Reindeer Ears" },
  { slug: "remembrance-poppy-felt-hair-clip", price: 7, sheet: "Hairclip - Poppy" },
  { slug: "remembrance-poppy-felt-headband", price: 12, sheet: "Headband - Poppy" },
  { slug: "single-flower-headband", price: 9, sheet: "Headband - Single flower" },
  { slug: "single-strawberry-hair-clip", price: 8, sheet: "Hair Clip - Single Strawberry" },
  { slug: "spring-bouquet-statement-headband", price: 18, sheet: "Headband - Spring Flowers" },
  { slug: "strawberry-cluster-hair-pin", price: 15, sheet: "Claw Clip - Triple strawberry", note: "Photographed as the claw clip" },
  { slug: "strawberry-felt-hair-clip-pair", price: 14, sheet: "Hair Clip Pair - single strawberry hair clips" },
  { slug: "strawberry-felt-headband-crimson", price: 18, sheet: "Headband - Triple strawberry" },
  { slug: "strawberry-felt-headband-sage", price: 18, sheet: "Headband - Triple strawberry" },
  { slug: "sunflower-felt-barrette-clip", price: 15, sheet: "Barrette - Berry Bow", note: "No sunflower barrette on the sheet; priced with the other barrettes, which sit at 15" },
  { slug: "sunflower-felt-hair-clip", price: 12, sheet: "Hair Clip - Sunflower" },
  { slug: "sunflower-felt-headband", price: 18, sheet: "Headband - Sunflower" },
  { slug: "toadstool-buttercup-felt-hair-clip", price: 7, sheet: "Hairclip - Mushroom daisy", note: "Same build; a buttercup in place of the daisy" },
  { slug: "toadstool-daisy-felt-hair-clip", price: 7, sheet: "Hairclip - Mushroom daisy" },
  { slug: "unicorn-flower-crown-headband", price: 18, sheet: "Unicorn headband" },
  { slug: "unicorn-flower-crown-headband-silver", price: 18, sheet: "Unicorn headband" },
  { slug: "woodland-antler-headband", price: 18, sheet: "Headband - mushroom deer" },

  // ---- Felt: brooches and pins ----
  { slug: "autumn-berry-wool-brooch", price: 8, sheet: "brooch - berries" },
  { slug: "daffodil-felt-lapel-pin", price: 7, sheet: "Lapel Pin - Daffodil" },
  { slug: "forget-me-not-felt-brooch", price: 12, sheet: "Brooch - Forget-me-not" },
  { slug: "peach-hibiscus-felt-brooch", price: 8, sheet: "Brooch - Big Flower", note: "One large bloom; no peach-flower brooch on the sheet" },
  { slug: "pink-sakura-felt-brooch", price: 15, sheet: "Brooch - Plum Blossom (Beaded)", note: "Pearl-centred blossom cluster; no sakura brooch on the sheet" },
  { slug: "remembrance-poppy-felt-brooch", price: 8, sheet: "Brooch - Poppy", note: "The standard, not 'Poppy Large' at 10" },
  { slug: "spring-bouquet-brooch", price: 15, sheet: "Brooch - Spring Flowers" },
  { slug: "strawberry-blossom-felt-brooch", price: 15, sheet: "Brooch - Triple strawberry" },
  { slug: "sunflower-felt-brooch", price: 15, sheet: "Brooch - Sunflower" },

  // ---- Felt: ornaments ----
  { slug: "brussels-sprout-felt-christmas-ornament", price: 8, sheet: "Ornament - brussel sprout" },
  { slug: "nigiri-felt-ornament", price: 8, sheet: "Ornament - sushi" },
  { slug: "prawn-nigiri-felt-ornament", price: 8, sheet: "Ornament - sushi" },
  { slug: "tamago-nigiri-felt-ornament", price: 8, sheet: "Ornament - sushi" },
  { slug: "tuna-nigiri-felt-ornament", price: 8, sheet: "Ornament - sushi" },

  // ---- Liberty ----
  { slug: "cat-ear-drawstring-pouch", price: 15, sheet: "Drawstring bag - Liberty Fabric Cat Shape" },
  { slug: "liberty-print-bow-hair-clips", price: 10, sheet: "Hair Clip - Liberty Pair Bows " },
  { slug: "liberty-print-knot-headband", price: 10, sheet: "Headband - Liberty " },

  // Gemstone is priced by tier on the sheet ("Necklace 25", "Earrings 18"),
  // not by design, so nothing there can be matched by name. The birthstone
  // choker already sits on the £25 necklace tier and is left alone.
];

async function main() {
  const changed: string[] = [];
  const same: string[] = [];
  const missing: string[] = [];

  for (const row of PRICES) {
    const product = await prisma.product.findUnique({
      where: { slug: row.slug },
      select: { price: true, title: true },
    });
    if (!product) {
      missing.push(row.slug);
      continue;
    }
    if (product.price === row.price) {
      same.push(`${product.title} — £${row.price}`);
      continue;
    }
    await prisma.product.update({ where: { slug: row.slug }, data: { price: row.price } });
    changed.push(
      `${product.title}: £${product.price.toFixed(2)} → £${row.price.toFixed(2)}   [${row.sheet}]`
    );
  }

  console.log(`\nChanged (${changed.length}):`);
  for (const line of changed) console.log("  " + line);
  console.log(`\nAlready correct (${same.length}):`);
  for (const line of same) console.log("  " + line);
  if (missing.length) {
    console.log(`\nSlug not in the database (${missing.length}):`);
    for (const line of missing) console.log("  " + line);
  }
}

main().finally(() => prisma.$disconnect());
