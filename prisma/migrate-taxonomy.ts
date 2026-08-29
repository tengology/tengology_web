import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  UNCATEGORISED,
  isSubcategoryKey,
  type CategoryKey,
  type SubcategoryKey,
} from "../src/lib/taxonomy";

/**
 * Re-files every product onto the two-level taxonomy: material family in
 * `category`, product type in `subcategory`.
 *
 * The rules read the product's own materials rather than a slug list, so this
 * keeps working as the catalogue grows, and it is idempotent — a second run
 * re-derives the same answer from already-migrated rows and writes nothing.
 *
 *   npx tsx prisma/migrate-taxonomy.ts           # dry run, prints the plan
 *   npx tsx prisma/migrate-taxonomy.ts --apply   # writes
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Product types under the old category-as-product-type scheme. */
const TYPE_FROM_LEGACY_CATEGORY: Record<string, SubcategoryKey> = {
  HAIR_ACCESSORIES: "HAIR_ACCESSORIES",
  BROOCHES: "BROOCHES",
  JEWELLERY: "JEWELLERY",
  CHRISTMAS_ORNAMENTS: "ORNAMENTS",
};

/** Categories whose pieces are crystal work when no fabric is in the materials. */
const CRYSTAL_SOURCES = new Set(["JEWELLERY", "CRYSTAL"]);

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory: string | null;
  materials: string;
  isPublished: boolean;
};

/**
 * Batik is checked before felt on purpose: a batik flower is backed onto wool
 * felt, so its materials name both, and the batik is what the piece is about.
 */
function resolveFamily(row: Row): CategoryKey | null {
  const materials = row.materials.toLowerCase();
  if (materials.includes("batik")) return "BATIK";
  if (materials.includes("felt")) return "FELT";
  if (CRYSTAL_SOURCES.has(row.category)) return "CRYSTAL";
  return null;
}

function resolveType(row: Row): SubcategoryKey | null {
  // An already-migrated row carries the answer in `subcategory`.
  if (isSubcategoryKey(row.subcategory)) return row.subcategory;
  return TYPE_FROM_LEGACY_CATEGORY[row.category] ?? null;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const rows: Row[] = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      subcategory: true,
      materials: true,
      isPublished: true,
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  const changes: {
    row: Row;
    category: string;
    subcategory: SubcategoryKey | null;
    isPublished: boolean;
  }[] = [];
  const orphans: Row[] = [];

  for (const row of rows) {
    const family = resolveFamily(row);
    const type = resolveType(row);

    // No family fits — park it in OTHER and take it off the storefront rather
    // than filing it under a material it is not made of.
    const category = family ?? UNCATEGORISED;
    const isPublished = family ? row.isPublished : false;
    if (!family) orphans.push(row);

    const unchanged =
      row.category === category &&
      row.subcategory === type &&
      row.isPublished === isPublished;
    if (unchanged) continue;

    changes.push({ row, category, subcategory: type, isPublished });
  }

  console.log(`${rows.length} products, ${changes.length} to update\n`);

  for (const c of changes) {
    const from = `${c.row.category}/${c.row.subcategory ?? "—"}`;
    const to = `${c.category}/${c.subcategory ?? "—"}`;
    const unpublish =
      c.isPublished !== c.row.isPublished ? "  [unpublished]" : "";
    console.log(`  ${from.padEnd(32)} → ${to.padEnd(28)} ${c.row.slug}${unpublish}`);
  }

  if (orphans.length) {
    console.log(`\nNo material family fits ${orphans.length} product(s):`);
    for (const o of orphans) {
      console.log(`  ${o.slug} — "${o.title}" (${o.materials || "no materials listed"})`);
    }
  }

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to write these changes.");
    return;
  }

  for (const c of changes) {
    await prisma.product.update({
      where: { id: c.row.id },
      data: {
        category: c.category,
        subcategory: c.subcategory,
        isPublished: c.isPublished,
      },
    });
  }

  console.log(`\nUpdated ${changes.length} products.`);

  const after = await prisma.product.groupBy({
    by: ["category", "subcategory"],
    _count: { _all: true },
    orderBy: [{ category: "asc" }, { subcategory: "asc" }],
  });
  console.log("\nCatalogue now:");
  for (const g of after) {
    console.log(
      `  ${g.category.padEnd(10)} ${(g.subcategory ?? "—").padEnd(18)} ${g._count._all}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
