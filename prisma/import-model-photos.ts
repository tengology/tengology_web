import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Files model photos from the May shoot onto their product listings.
 *
 * Photos were grouped by the headband being worn, so every shot of one piece
 * lands on one listing. Only one or two frames per piece are kept — the shoot
 * ran many near-identical poses of the same child, and the extras added page
 * weight without telling a shopper anything new. They are appended, never promoted: the existing
 * product-only stills stay as the hero images that the shop grid shows.
 *
 * Headbands with no listing get an unpublished, zero-priced draft so the
 * photography is not stranded — title and copy are a starting point, price and
 * stock are for a human to fill in.
 *
 * Idempotent: an image already recorded at the same URL is left alone.
 *
 *   npx tsx prisma/import-model-photos.ts           # dry run
 *   npx tsx prisma/import-model-photos.ts --apply
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Photos of pieces that already sell on the site. */
const APPEND_TO_EXISTING: Record<string, { count: number; alt: string }> = {
  "strawberry-felt-headband-sage": {
    count: 2,
    alt: "The Strawberry Felt Headband with sage ribbon worn — felt strawberries and a white blossom above the ear",
  },
  "sunflower-felt-headband": {
    count: 2,
    alt: "The Sunflower Felt Headband worn — a single yellow sunflower with a brown looped centre on green leaves",
  },
  "woodland-antler-headband": {
    count: 2,
    alt: "The Woodland Antler Headband worn — felt antlers with a red toadstool, daisies and acorns",
  },
  "reindeer-antler-felt-headband": {
    count: 2,
    alt: "The Reindeer Antler Felt Headband worn — felt antlers and ears with red roses and holly",
  },
  "blue-anemone-headband": {
    count: 2,
    alt: "The Blue Anemone Headband worn — a pale blue felt bloom with a gold glitter centre",
  },
  "easter-bunny-ear-floral-headband": {
    count: 2,
    alt: "The Easter Bunny Ear Floral Headband worn — cream felt ears above a garland of spring flowers",
  },
  // Gold and silver are separate listings and the photos were split on the
  // tell that distinguishes them: glitter ear colour and the centre of the
  // focal bloom (coral + gold, versus fuchsia + silver).
  "unicorn-flower-crown-headband-gold": {
    count: 2,
    alt: "The Unicorn Flower Crown Headband in gold worn — a felt horn and gold-glitter ears in a crown of coral and blush blooms",
  },
  "unicorn-flower-crown-headband-silver": {
    count: 2,
    alt: "The Unicorn Flower Crown Headband in silver worn — a felt horn and silver-glitter ears in a crown of fuchsia, lilac and mint blooms",
  },
  "remembrance-poppy-felt-headband": {
    count: 2,
    alt: "The Remembrance Poppy Felt Headband worn — a single red felt poppy with a black centre",
  },
};

type Draft = {
  slug: string;
  title: string;
  shortDescription: string;
  materials: string;
  collection: string;
  count: number;
  alt: string;
};

/** Pieces photographed at the shoot that the shop has never listed. */
const NEW_DRAFTS: Draft[] = [
  {
    slug: "bunny-bloom-felt-headband",
    title: "Bunny Bloom Felt Headband",
    shortDescription:
      "A little felt bunny tucked into a cluster of blooms, on a bright pink band.",
    materials: "wool felt, satin ribbon, metal headband",
    collection: "Easter Rabbit Ears",
    count: 2,
    alt: "The Bunny Bloom Felt Headband worn — a small felt bunny among pink and cream blooms",
  },
  {
    slug: "blush-antler-rose-headband",
    title: "Blush Antler & Rose Headband",
    shortDescription: "Soft felt antlers with blush roses and sage leaves.",
    materials: "wool felt, satin ribbon, metal headband",
    collection: "Deer Ears",
    count: 1,
    alt: "The Blush Antler & Rose Headband worn — felt antlers with blush roses and sage leaves",
  },
  {
    slug: "festive-berry-felt-headband",
    title: "Festive Berry Felt Headband",
    shortDescription:
      "A padded band in festive stripes, dotted with hand-rolled red berries.",
    materials: "wool felt, metal headband",
    collection: "Berry",
    count: 1,
    alt: "The Festive Berry Felt Headband worn — a padded striped band dotted with red felt berries",
  },
  {
    slug: "bluebird-felt-headband",
    title: "Bluebird Felt Headband",
    shortDescription: "A little felt bluebird perched among leaves and blossom.",
    materials: "wool felt, satin ribbon, metal headband",
    collection: "Woodland",
    count: 2,
    alt: "The Bluebird Felt Headband worn — a small blue felt bird among green leaves",
  },
  {
    slug: "autumn-pumpkin-felt-headband",
    title: "Autumn Pumpkin Felt Headband",
    shortDescription:
      "A felt pumpkin nestled with cream blooms and turning leaves.",
    materials: "wool felt, satin ribbon, metal headband",
    collection: "Pumpkin",
    count: 1,
    alt: "The Autumn Pumpkin Felt Headband worn — a felt pumpkin with cream blooms and autumn leaves",
  },
];

const imageUrl = (slug: string, n: number) => `/products/model/${slug}-${n}.jpg`;

async function main() {
  const apply = process.argv.includes("--apply");
  const log: string[] = [];

  for (const [slug, spec] of Object.entries(APPEND_TO_EXISTING)) {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, title: true, images: { select: { url: true, sortOrder: true } } },
    });
    if (!product) {
      log.push(`SKIP  ${slug} — no such product`);
      continue;
    }

    const existing = new Set(product.images.map((i) => i.url));
    // Append after whatever is already there so the current hero keeps sort 0.
    let next = product.images.reduce((max, i) => Math.max(max, i.sortOrder), -1) + 1;

    for (let n = 1; n <= spec.count; n++) {
      const url = imageUrl(slug, n);
      if (existing.has(url)) {
        log.push(`  =   ${url} already on ${slug}`);
        continue;
      }
      log.push(`  +   ${url} → ${product.title} (sort ${next})`);
      if (apply) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url,
            altText: spec.alt,
            sortOrder: next,
            isPrimary: false,
          },
        });
      }
      next++;
    }
  }

  for (const draft of NEW_DRAFTS) {
    const existing = await prisma.product.findUnique({
      where: { slug: draft.slug },
      select: { id: true, images: { select: { url: true } } },
    });

    let productId = existing?.id;
    if (!productId) {
      log.push(`NEW   ${draft.slug} — "${draft.title}" (unpublished, £0)`);
      if (apply) {
        const created = await prisma.product.create({
          data: {
            slug: draft.slug,
            title: draft.title,
            shortDescription: draft.shortDescription,
            category: "FELT",
            subcategory: "HAIR_ACCESSORIES",
            materials: draft.materials,
            collection: draft.collection,
            // Priced and stocked by a human before this can go live.
            price: 0,
            stockCount: 0,
            isPublished: false,
          },
          select: { id: true },
        });
        productId = created.id;
      }
    } else {
      log.push(`EXIST ${draft.slug} — already a product, adding any missing images`);
    }

    const already = new Set(existing?.images.map((i) => i.url) ?? []);
    for (let n = 1; n <= draft.count; n++) {
      const url = imageUrl(draft.slug, n);
      if (already.has(url)) {
        log.push(`  =   ${url} already present`);
        continue;
      }
      log.push(`  +   ${url}${n === 1 ? "  (primary)" : ""}`);
      if (apply && productId) {
        await prisma.productImage.create({
          data: {
            productId,
            url,
            altText: draft.alt,
            sortOrder: n - 1,
            // A draft has no product-only still yet, so its first model shot
            // is the only thing that can carry the card.
            isPrimary: n === 1,
          },
        });
      }
    }
  }

  console.log(log.join("\n"));
  console.log(
    apply ? "\nApplied." : "\nDry run. Re-run with --apply to write these changes."
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
