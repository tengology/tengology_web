/**
 * Name the actual stones in the gemstone earrings' Materials list.
 *
 * The metal was already right in both places the product page shows it — the
 * Materials chips and the closing line of the description. But the chips
 * opened with a generic "natural crystal", which on a one-off pair is a wasted
 * line: the stones are most of what the price is for, and the bracelets
 * already name every one of theirs.
 *
 * Also spells out "sterling silver" rather than leaning on "S925". They mean
 * the same thing to a jeweller and not much to a shopper, and sterling silver
 * is the part worth reading — the hooks are sterling silver, gold-plated
 * sterling silver where the pair is gold.
 *
 * Stones are taken from each listing's own description, so the two agree.
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

const GOLD = "14k gold-plated sterling silver (S925) ear hooks, gold-plated alloy findings";
const SILVER = "sterling silver (S925) ear hooks, silver-tone alloy findings";

const MATERIALS: Record<string, string> = {
  "smoky-quartz-drop-earrings":
    `smoky quartz, raw citrine, tiger's eye, hematite, fine gold-plated chain, ${GOLD}`,
  "pearl-carnelian-cluster-earrings":
    `baroque freshwater pearl, carnelian, peach quartz, champagne quartz, gold sequins, ${GOLD}`,
  "green-fluorite-cluster-drop-earrings":
    `green fluorite, fluorite rondelles, amethyst, ${GOLD}`,
  "milky-quartz-cluster-earrings":
    `milky quartz, amazonite, aquamarine, ${GOLD}`,
  "clear-quartz-star-cluster-earrings":
    `carved clear quartz, black spinel, aquamarine, labradorite, ${GOLD}`,
  "rose-quartz-star-cluster-earrings":
    `rose quartz, amazonite, baroque freshwater pearl, peach quartz, ${SILVER}`,
};

async function main() {
  for (const [slug, materials] of Object.entries(MATERIALS)) {
    const before = await prisma.product.findUnique({
      where: { slug },
      select: { title: true, materials: true },
    });
    if (!before) {
      console.log(`  MISSING  ${slug}`);
      continue;
    }
    if (before.materials !== materials) {
      await prisma.product.update({ where: { slug }, data: { materials } });
    }
    console.log(`${before.title}\n  was: ${before.materials}\n  now: ${materials}\n`);
  }
}

main().finally(() => prisma.$disconnect());
