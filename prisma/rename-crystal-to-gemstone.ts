/**
 * Rename the crystal family to Gemstone.
 *
 * Jade, lapis and turquoise are not crystals, so the old label had started to
 * describe the shelf inaccurately as the range grew. Only the family key moves;
 * the word "crystal" stays in copy, tags and SEO where it is still correct and
 * still what people search for.
 *
 * `?category=CRYSTAL` keeps resolving — see LEGACY_CATEGORY_KEYS in
 * lib/taxonomy — so existing links and anything already indexed survive.
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

async function main() {
  const r = await prisma.product.updateMany({
    where: { category: "CRYSTAL" },
    data: { category: "GEMSTONE" },
  });
  console.log(`moved ${r.count} product(s) CRYSTAL → GEMSTONE`);
  const g = await prisma.product.groupBy({ by: ["category"], _count: true });
  console.log(JSON.stringify(g));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
