/**
 * Renames the four "Pink Hydrangea" pieces to Sakura.
 *
 * They were listed as hydrangea by mistake — the flower is a five-petal cherry
 * blossom with a pearl centre, which is what the photographs show and what the
 * Sakura collection in the taxonomy describes.
 *
 * This has to be a migration rather than a re-seed: the seed upserts on slug,
 * so seeding the corrected slugs would create four new products and leave the
 * originals published alongside them. Idempotent — running it twice is a no-op.
 *
 * Image filenames are deliberately left alone. They are not customer-facing,
 * and renaming them means moving files and rewriting every stored URL in the
 * same breath; not worth the risk for a cosmetic gain.
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { config } from "dotenv";

config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** The same substitutions the seed now carries, applied to stored copy. */
function toSakura(text: string): string {
  return text
    .replace(/pink hydrangea cluster/g, "pink sakura blossom")
    .replace(/pink hydrangea blooms/g, "pink sakura blossoms")
    .replace(/pink-hydrangea-/g, "pink-sakura-")
    .replace(/Pink Hydrangea/g, "Pink Sakura")
    .replace(/pink hydrangea/g, "pink sakura")
    .replace(/\bhydrangea\b/g, "sakura")
    .replace(/\bHydrangea\b/g, "Sakura");
}

async function main() {
  const products = await prisma.product.findMany({
    where: { slug: { contains: "hydrangea" } },
    include: { images: true },
  });

  if (products.length === 0) {
    console.log("Nothing to rename — no hydrangea products found.");
    return;
  }

  for (const p of products) {
    const slug = toSakura(p.slug);

    // A corrected row already sitting there would mean a half-finished run.
    const clash = await prisma.product.findUnique({ where: { slug } });
    if (clash && clash.id !== p.id) {
      console.warn(`! ${p.slug}: "${slug}" is already taken by another product — skipped`);
      continue;
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        slug,
        title: toSakura(p.title),
        shortDescription: p.shortDescription ? toSakura(p.shortDescription) : p.shortDescription,
        fullDescription: p.fullDescription ? toSakura(p.fullDescription) : p.fullDescription,
        materials: toSakura(p.materials),
      },
    });

    for (const img of p.images) {
      if (!img.altText || !/hydrangea/i.test(img.altText)) continue;
      await prisma.productImage.update({
        where: { id: img.id },
        data: { altText: toSakura(img.altText) },
      });
    }

    console.log(`✓ ${p.slug} → ${slug}  ("${toSakura(p.title)}")`);
  }

  const left = await prisma.product.count({ where: { slug: { contains: "hydrangea" } } });
  console.log(`\nRenamed ${products.length}. Hydrangea slugs remaining: ${left}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
