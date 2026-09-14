import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Third unicorn colourway: Light Pink / Gold (new AirDrop flats) plus the
 * unused gold-2 / silver-2 model frames. Idempotent on URL.
 *
 *   npx tsx prisma/add-unicorn-pink.ts
 */

const SLUG = "unicorn-flower-crown-headband";

const SHORT =
  "A coiled felt horn between glitter-lined ears, wreathed in a full flower crown. In Light Pink / Gold, Fuchsia / Silver, or Peach / Gold.";

const FULL = `A coiled horn set between two ears, with a crown of felt flowers worked around the base — anemones, small roses, buds and leaves, built up until the band underneath disappears.

Choose Light Pink / Gold, Fuchsia / Silver, or Peach / Gold. Named by the centre flower and the horn metal; the band and ear linings change with it.

Built on a padded, fabric-covered alice band, so it sits comfortably through a party rather than digging in after twenty minutes.

• Wool and wool-blend felt, with glitter felt for the horn and ear linings
• Padded alice band, covered to the underside
• Approx. 14cm across the crown
• Made in Oxford`;

const NEW_IMAGES: { url: string; altText: string }[] = [
  {
    url: "/products/unicorn/unicorn-crown-pink-hero.jpg",
    altText:
      "Unicorn flower crown headband in Light Pink / Gold — pink satin band, gold glitter ears, and a light pink centre flower",
  },
  {
    url: "/products/unicorn/unicorn-crown-pink-detail.jpg",
    altText:
      "Close view of the Light Pink / Gold unicorn crown — peach-pink centre flower, gold glitter horn, and pink satin band",
  },
  {
    url: "/products/model/unicorn-flower-crown-headband-gold-2.jpg",
    altText: "The Light Pink / Gold unicorn flower crown headband worn",
  },
  {
    url: "/products/model/unicorn-flower-crown-headband-silver-2.jpg",
    altText: "The Fuchsia / Silver unicorn flower crown headband worn",
  },
];

const ALT_UPDATES: { url: string; altText: string }[] = [
  {
    url: "/products/model/unicorn-flower-crown-headband-gold-1.jpg",
    altText: "The Light Pink / Gold unicorn flower crown headband worn",
  },
  {
    url: "/products/model/unicorn-flower-crown-headband-silver-1.jpg",
    altText: "The Fuchsia / Silver unicorn flower crown headband worn",
  },
  {
    url: "/products/unicorn/unicorn-crown-gold-hero.jpg",
    altText:
      "Unicorn flower crown headband in Peach / Gold — gold band, gold glitter ears, and a coral-peach centre flower",
  },
  {
    url: "/products/unicorn/unicorn-crown-gold-detail.jpg",
    altText: "Detail of the Peach / Gold unicorn horn and felt flower crown",
  },
  {
    url: "/products/unicorn/unicorn-crown-silver-hero.jpg",
    altText:
      "Unicorn flower crown headband in Fuchsia / Silver — silver band, silver glitter ears, and a fuchsia centre flower",
  },
  {
    url: "/products/unicorn/unicorn-crown-silver-detail.jpg",
    altText: "Detail of the Fuchsia / Silver unicorn horn and felt flower crown",
  },
];

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const product = await prisma.product.findUnique({
    where: { slug: SLUG },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) throw new Error(`No product for slug ${SLUG}`);

  await prisma.product.update({
    where: { id: product.id },
    data: {
      shortDescription: SHORT,
      fullDescription: FULL,
    },
  });
  console.log("Updated shortDescription / fullDescription");

  await prisma.productSeo.update({
    where: { productId: product.id },
    data: {
      metaTitle: "Unicorn Flower Crown Headband | Handmade Wool Felt",
      metaDescription:
        "A handmade wool felt unicorn headband in Light Pink / Gold, Fuchsia / Silver, or Peach / Gold. Made in Oxford. Free UK shipping over £50.",
    },
  });
  console.log("Updated SEO");

  const seen = new Set(product.images.map((img) => img.url));
  let sortOrder = product.images.reduce((max, img) => Math.max(max, img.sortOrder), -1);

  for (const image of NEW_IMAGES) {
    if (seen.has(image.url)) {
      console.log(`  =  ${image.url}`);
      continue;
    }
    sortOrder += 1;
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: image.url,
        altText: image.altText,
        sortOrder,
        isPrimary: false,
      },
    });
    seen.add(image.url);
    console.log(`  +  ${image.url} (sort ${sortOrder})`);
  }

  for (const upd of ALT_UPDATES) {
    const res = await prisma.productImage.updateMany({
      where: { productId: product.id, url: upd.url },
      data: { altText: upd.altText },
    });
    if (res.count) console.log(`  ~  alt ${upd.url}`);
  }

  const images = await prisma.productImage.findMany({
    where: { productId: product.id },
    orderBy: { sortOrder: "asc" },
    select: { sortOrder: true, isPrimary: true, url: true },
  });
  console.log("Gallery:");
  for (const img of images) {
    console.log(`  ${img.sortOrder}${img.isPrimary ? " *" : "  "} ${img.url}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
