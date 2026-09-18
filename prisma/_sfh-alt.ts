import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const alts: Record<string, string> = {
  "/products/single-flower-headband-2026/img_0376.jpg": "Single Flower Headband colour range (five)",
  "/products/single-flower-headband-2026/img_0375.jpg": "Single Flower Headband colour range (seven)",
  "/products/single-flower-headband-2026/img_0377.jpg": "Single Flower Headband — Red",
  "/products/single-flower-headband-2026/img_0378.jpg": "Single Flower Headband — Pink",
  "/products/single-flower-headband-2026/img_0379.jpg": "Single Flower Headband — Teal",
  "/products/single-flower-headband-2026/img_0380.jpg": "Single Flower Headband — Mint",
  "/products/single-flower-headband-2026/img_0381.jpg": "Single Flower Headband — Lavender",
  "/products/single-flower-headband-2026/img_0382.jpg": "Single Flower Headband — Light blue",
  "/products/single-flower-headband-2026/img_0383.jpg": "Single Flower Headband — Yellow",
  "/products/statement-blooms/anemone-blue-hero.jpg": "Single Flower Headband — Light blue and gold",
  "/products/model/blue-anemone-headband-1.jpg": "Single Flower Headband — Light blue and gold, worn",
};

async function main() {
  const p = await prisma.product.findUnique({
    where: { slug: "single-flower-headband" },
    include: { images: true },
  });
  if (!p) throw new Error("missing");
  for (const im of p.images) {
    const alt = alts[im.url];
    if (alt && im.altText !== alt) {
      await prisma.productImage.update({ where: { id: im.id }, data: { altText: alt } });
      console.log("updated", im.url);
    }
  }
}
main().finally(() => prisma.$disconnect());
