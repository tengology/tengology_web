import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATEGORIES } from "../src/lib/taxonomy";

/**
 * Re-files every felt product onto the motif-led collections defined for FELT
 * in src/lib/taxonomy.ts.
 *
 * The rule the collections encode: a piece belongs to its subject. A named
 * motif — Strawberry, Poppy, Daffodil — always wins, and only pieces with no
 * single named subject fall back to the form collections (Flower Headband,
 * Flower Hairclip, Flower Brooch). A daisy accent on a toadstool clip does not
 * make it a Daisy piece; the toadstool is the subject, and toadstools are not
 * a collection, so it files by form.
 *
 * Idempotent — a second run finds every product already filed and writes
 * nothing. Products absent from the map keep whatever collection they have, so
 * an unclassified draft is left alone rather than silently re-filed.
 *
 *   npx tsx prisma/migrate-felt-collections.ts           # dry run, prints the plan
 *   npx tsx prisma/migrate-felt-collections.ts --apply   # writes
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const FELT_COLLECTION_BY_SLUG: Record<string, string> = {
  // Strawberry — the motif carries every form, scrunchie included.
  "single-strawberry-hair-clip": "Strawberry",
  "strawberry-blossom-felt-brooch": "Strawberry",
  "strawberry-cluster-hair-pin": "Strawberry",
  "strawberry-felt-hair-clip-pair": "Strawberry",
  "strawberry-felt-headband-crimson": "Strawberry",
  "strawberry-felt-headband-sage": "Strawberry",

  "sunflower-felt-barrette-clip": "Sunflower",
  "sunflower-felt-brooch": "Sunflower",
  "sunflower-felt-hair-clip": "Sunflower",
  "sunflower-felt-headband": "Sunflower",

  "pastel-daisy-headband-mint": "Daisy",

  "remembrance-poppy-felt-brooch": "Poppy",
  "remembrance-poppy-felt-hair-clip": "Poppy",
  "remembrance-poppy-felt-headband": "Poppy",

  // Antler pieces file by the antler, not by the roses dressing it.
  "reindeer-antler-felt-headband": "Reindeer Ears",
  "woodland-antler-headband": "Deer Ears",
  "blush-antler-rose-headband": "Deer Ears",

  "easter-bunny-ear-floral-hair-clip": "Easter Rabbit Ears",
  "easter-bunny-ear-floral-headband": "Easter Rabbit Ears",
  "bunny-bloom-felt-headband": "Easter Rabbit Ears",

  // No single named bloom — these fall back to form.
  "spring-bouquet-statement-headband": "Flower Headband",
  "oversized-bloom-headband": "Flower Headband",
  "blue-anemone-headband": "Flower Headband",
  "felt-dahlia-headband": "Flower Headband",
  "pink-hydrangea-felt-headband": "Flower Headband",

  "peach-hibiscus-felt-hair-clip": "Flower Hairclip",
  "pink-hydrangea-felt-hair-clip": "Flower Hairclip",
  "pink-hydrangea-pearl-claw-clip": "Flower Hairclip",
  "toadstool-buttercup-felt-hair-clip": "Flower Hairclip",
  "toadstool-daisy-felt-hair-clip": "Flower Hairclip",
  "spring-bouquet-faux-fur-scrunchie": "Flower Hairclip",

  "peach-hibiscus-felt-brooch": "Flower Brooch",
  "pink-hydrangea-felt-brooch": "Flower Brooch",

  "forget-me-not-felt-brooch": "Forget-me-not",
  "forget-me-not-felt-hair-clip": "Forget-me-not",
  "forget-me-not-long-barrette": "Forget-me-not",

  // Both variants of the spring bouquet brooch lead on a daffodil.
  "daffodil-felt-hair-clip": "Daffodil",
  "daffodil-felt-lapel-pin": "Daffodil",
  "spring-bouquet-brooch": "Daffodil",

  "unicorn-flower-crown-headband-gold": "Unicorn",
  "unicorn-flower-crown-headband-silver": "Unicorn",

  "festive-berry-felt-headband": "Berry",
  "autumn-berry-wool-brooch": "Berry",

  "autumn-pumpkin-felt-headband": "Pumpkin",
};

async function main() {
  const apply = process.argv.includes("--apply");
  const known = new Set(
    (CATEGORIES.FELT.collections ?? []).map((col) => col.name),
  );

  for (const name of Object.values(FELT_COLLECTION_BY_SLUG)) {
    if (!known.has(name)) {
      throw new Error(`"${name}" is not a FELT collection in taxonomy.ts`);
    }
  }

  const products = await prisma.product.findMany({
    where: { category: "FELT" },
    select: { id: true, slug: true, title: true, collection: true },
    orderBy: { slug: "asc" },
  });

  const moved: string[] = [];
  const settled: string[] = [];
  const unfiled: string[] = [];

  for (const product of products) {
    const target = FELT_COLLECTION_BY_SLUG[product.slug];
    if (!target) {
      unfiled.push(`${product.slug} (${product.collection ?? "—"})`);
      continue;
    }
    if (product.collection === target) {
      settled.push(product.slug);
      continue;
    }
    moved.push(`${product.collection ?? "—"} -> ${target}  ${product.slug}`);
    if (apply) {
      await prisma.product.update({
        where: { id: product.id },
        data: { collection: target },
      });
    }
  }

  for (const line of moved) console.log(`  ${line}`);
  console.log(
    `\n${apply ? "Moved" : "Would move"} ${moved.length}, already filed ${settled.length}, unmapped ${unfiled.length}`,
  );
  if (unfiled.length > 0) {
    console.log("\nLeft alone — no collection matches their subject:");
    for (const line of unfiled) console.log(`  ${line}`);
  }

  const counts = new Map<string, number>();
  for (const name of known) counts.set(name, 0);
  for (const product of products) {
    const name = FELT_COLLECTION_BY_SLUG[product.slug];
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  console.log("\nCollection sizes:");
  for (const col of CATEGORIES.FELT.collections ?? []) {
    console.log(`  ${String(counts.get(col.name) ?? 0).padStart(2)}  ${col.name}`);
  }

  if (!apply) console.log("\nDry run — pass --apply to write.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
