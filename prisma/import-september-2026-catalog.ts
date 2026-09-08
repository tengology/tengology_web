import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Assets must be deployed before --apply: the catalogue database is shared.
// Existing photos, prices and stock are retained. Re-running adds no duplicates.
type Row = {
  slug: string; existing: boolean; publishExisting?: boolean; title?: string; price?: number;
  stockCount?: number; category?: string; subcategory?: string;
  collection?: string; materials?: string;
  shortDescription?: string; fullDescription?: string;
  images: { url: string; altText: string; source: string }[];
};
const selectedSlugs = process.argv.filter(arg => arg.startsWith("--slug=")).map(arg => arg.slice(7));
const catalogue: Row[] = JSON.parse(readFileSync(resolve("prisma/data/september-2026-catalog.json"), "utf8"));
const rows = selectedSlugs.length ? catalogue.filter(row => selectedSlugs.includes(row.slug)) : catalogue;
if (selectedSlugs.some(slug => !rows.some(row => row.slug === slug))) throw new Error("Unknown selected product slug");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  if (new Set(rows.map(r => r.slug)).size !== rows.length) throw new Error("Duplicate product slug");
  for (const row of rows) {
    if (!row.images.length) throw new Error(`No photos: ${row.slug}`);
    for (const image of row.images) {
      if (!existsSync(resolve(`public${image.url}`))) throw new Error(`Missing asset: ${image.url}`);
    }
    if (!row.existing && (!row.title || !row.price || row.price <= 0 || row.stockCount !== 1 || !row.fullDescription)) {
      throw new Error(`Incomplete new product: ${row.slug}`);
    }
  }
  const before = await prisma.product.findMany({
    where: { slug: { in: rows.map(r => r.slug) } },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  for (const row of rows) {
    if (row.existing && !before.some(p => p.slug === row.slug)) throw new Error(`Missing existing product: ${row.slug}`);
  }
  console.log(JSON.stringify({ existing: rows.filter(r => r.existing).length, new: rows.filter(r => !r.existing).length, images: rows.reduce((n,r) => n+r.images.length,0) }));
  if (!process.argv.includes("--apply")) return;
  const backup = `/tmp/tengology-september-catalog-before-${Date.now()}.json`;
  writeFileSync(backup, JSON.stringify(before, null, 2));
  console.log(`Saved catalogue backup: ${backup}`);

  // Check production assets before any database write.
  const urls = [...new Set(rows.flatMap(r => r.images.map(i => i.url)))];
  for (let i=0; i<urls.length; i+=8) {
    await Promise.all(urls.slice(i,i+8).map(async url => {
      const response = await fetch(`https://tengology.com${url}`, { method: "HEAD", signal: AbortSignal.timeout(30000) });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error(`Asset not live: ${url} (${response.status})`);
    }));
  }
  for (const row of rows) {
    await prisma.$transaction(async tx => {
      let product = await tx.product.findUnique({ where: { slug: row.slug }, include: { images: true } });
      if (!product) {
        const { slug, title, price, stockCount, category, subcategory, collection, materials, shortDescription, fullDescription } = row;
        product = await tx.product.create({
          data: { slug, title: title!, price: price!, stockCount, category, subcategory, collection, materials, shortDescription, fullDescription, isPublished: true },
          include: { images: true },
        });
      } else if (!product.isPublished && row.publishExisting) {
        // User requested today's matched listings online; preserve existing stock.
        await tx.product.update({ where: { id: product.id }, data: {
          isPublished: true,
          ...(!product.fullDescription ? { fullDescription: `${product.shortDescription || product.title}\n\nHandmade in Oxford. The gallery shows the piece and its details.` } : {}),
        } });
      }
      let sortOrder = product.images.reduce((m,i) => Math.max(m,i.sortOrder),-1)+1;
      for (const image of row.images) {
        if (product.images.some(i => i.url === image.url)) continue;
        await tx.productImage.create({ data: {
          productId: product.id, url: image.url, altText: image.altText,
          sortOrder, isPrimary: sortOrder === 0,
        } });
        sortOrder++;
      }
    }, { timeout: 30000 });
    console.log(`Published: ${row.slug}`);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
