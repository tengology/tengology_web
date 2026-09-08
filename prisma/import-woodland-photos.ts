import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Publish the static assets before applying this to the shared database.
// Dry run: npx tsx prisma/import-woodland-photos.ts
// Apply:   npx tsx prisma/import-woodland-photos.ts --apply
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const photos = [
  ["front", "Woodland Antler Headband with felt deer ears, antlers and toadstools on a green background"],
  ["detail", "Close-up of the felt toadstool, deer ear, flowers and antler"],
  ["held", "Woodland Antler Headband held in one hand to show its size and shape"],
  ["back", "Back of the headband showing white-spotted felt deer ears and antlers"],
  ["workbench", "Woodland Antler Headbands and felt pieces on the maker's workbench"],
].map(([name, altText]) => ({
  url: `/products/woodland/woodland-antler-${name}.webp`,
  altText,
}));

async function main() {
  const product = await prisma.product.findUniqueOrThrow({
    where: { slug: "woodland-antler-headband" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  console.log(JSON.stringify({ title: product.title, previousImages: product.images, selected: photos }, null, 2));
  if (!process.argv.includes("--apply")) return;

  await prisma.$transaction(async (tx) => {
    const retained = product.images.filter((image) => !photos.some((photo) => photo.url === image.url));
    for (const [index, image] of retained.entries()) {
      await tx.productImage.update({
        where: { id: image.id },
        data: { sortOrder: photos.length + index, isPrimary: false },
      });
    }
    for (const [index, photo] of photos.entries()) {
      const existing = product.images.find((image) => image.url === photo.url);
      const data = { ...photo, sortOrder: index, isPrimary: index === 0 };
      if (existing) {
        await tx.productImage.update({ where: { id: existing.id }, data });
      } else {
        await tx.productImage.create({ data: { ...data, productId: product.id } });
      }
    }
  });
  console.log("Updated Woodland Antler Headband gallery.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
