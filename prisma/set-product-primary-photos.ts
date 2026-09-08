import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { readFileSync, writeFileSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Reviewed product photographs. Preserve every existing gallery image.
const plan: Record<string, string> = JSON.parse(readFileSync("prisma/data/product-primary-photos.json", "utf8"));
const selected = process.argv.filter(arg => arg.startsWith("--slug=")).map(arg => arg.slice(7));
if (selected.some(slug => !plan[slug])) throw new Error("Unknown product slug");
if (selected.length) for (const slug of Object.keys(plan)) if (!selected.includes(slug)) delete plan[slug];
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const before = await prisma.product.findMany({ where: { slug: { in: Object.keys(plan) } }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  if (before.length !== Object.keys(plan).length) throw new Error("Missing product");
  for (const url of new Set(Object.values(plan))) {
    const response = await fetch(`https://tengology.com${url}`, { method: "HEAD", signal: AbortSignal.timeout(30000) });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error(`Photo unavailable: ${url}`);
  }
  if (!process.argv.includes("--apply")) { console.log(`Validated ${before.length} product main photos`); return; }
  writeFileSync(`/tmp/tengology-primary-before-${Date.now()}.json`, JSON.stringify(before, null, 2));
  for (const product of before) {
    await prisma.$transaction(async tx => {
      const images = await tx.productImage.findMany({ where: { productId: product.id }, orderBy: { sortOrder: "asc" } });
      let primary = images.find(image => image.url === plan[product.slug]);
      if (!primary) {
        if (product.slug !== "pumpkin-cluster-felt-brooch") throw new Error(`Unexpected missing gallery photo: ${product.slug}`);
        primary = await tx.productImage.create({ data: {
          productId: product.id, url: plan[product.slug], sortOrder: images.length, isPrimary: false,
          altText: "Pumpkin cluster brooches on cards; this listing is for one orange, peach and cream brooch, shown at the upper left.",
        } });
      }
      const ordered = [primary, ...images.filter(image => image.id !== primary.id)];
      await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false } });
      for (const [sortOrder, image] of ordered.entries()) {
        await tx.productImage.update({ where: { id: image.id }, data: { sortOrder, isPrimary: sortOrder === 0 } });
      }
    }, { timeout: 30000 });
    console.log(`Updated: ${product.slug}`);
  }
  const after = await prisma.product.findMany({ where: { slug: { in: Object.keys(plan) } }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  for (const product of after) {
    const old = before.find(p => p.id === product.id)!;
    if (product.images[0]?.url !== plan[product.slug] || !product.images[0].isPrimary || product.images.filter(i => i.isPrimary).length !== 1) throw new Error(`Invalid primary: ${product.slug}`);
    if (old.images.some(i => !product.images.some(j => j.id === i.id && j.url === i.url))) throw new Error(`Lost photo: ${product.slug}`);
    if (Number(old.price) !== Number(product.price) || old.stockCount !== product.stockCount) throw new Error(`Product changed: ${product.slug}`);
  }
  console.log(`Verified ${after.length} main photos; previous photos, prices and stock retained.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
