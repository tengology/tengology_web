import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Additive seed for the felt Ornaments range: four nigiri and the brussels
 * sprout baubles, the first products to land in the Ornaments collection.
 *
 * The sprout is one listing rather than six. The catalogue has no variant
 * model, so — as in seed.ts — each character becomes a labelled gallery image
 * and the prose names the options.
 *
 * Safe to re-run. Products match on slug and are never overwritten, but the
 * gallery is authoritative: images not listed here are removed, so correcting
 * a URL in this file corrects the listing. That is deliberate — the first pass
 * shipped crops from a group photo before the studio shots were found.
 *
 *   npx tsx prisma/seed-ornaments.ts
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Listing = {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  materials: string;
  price: number;
  stockCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  collection: string;
  images: { url: string; altText: string }[];
  tags: string[];
  seo: { metaTitle: string; metaDescription: string; focusKeyword: string };
};

const NIGIRI_BODY =
  "A rice ball needle-felted from white wool, worked until it holds its shape, with two glass bead eyes set into the front. The topping is cut from wool felt and shaped over the rice by hand.\n\n✦ Made entirely by hand · One of a kind\n\nIt hangs from a silver ribbon with a small brass bell below, and sits comfortably in a palm. For the tree, a gift bow, or someone who orders the same thing every time.\n\nHandmade in Oxford.";

const nigiriTags = (fish: string) => [
  "felt sushi",
  `${fish} sushi`,
  "sushi ornament",
  "felt food",
  "needle felted",
  "christmas ornament",
  "wool felt",
  "kawaii",
  "one of a kind",
  "handmade in oxford",
];

const boardShot = {
  url: "/products/ornaments/nigiri-four-on-board.jpg",
  altText:
    "Four handmade felt nigiri ornaments — egg, tuna, salmon and prawn — on a wooden board with their brass bells",
};

const spreadShot = {
  url: "/products/ornaments/nigiri-spread.jpg",
  altText:
    "A spread of handmade felt nigiri ornaments in tuna, salmon, egg and prawn",
};

const listings: Listing[] = [
  {
    slug: "tuna-nigiri-felt-ornament",
    title: "Tuna Nigiri Felt Ornament",
    shortDescription:
      "A needle-felted rice ball under a slice of deep pink tuna, marbled with fine white stitching.",
    fullDescription:
      "A slice of tuna cut from rose-pink wool felt and marked with fine white lines for the marbling, draped over a needle-felted rice ball.\n\n" +
      NIGIRI_BODY,
    category: "FELT",
    subcategory: "ORNAMENTS",
    materials: "wool roving, wool felt, embroidery thread, glass beads, brass bell, satin ribbon",
    price: 14.0,
    stockCount: 1,
    isPublished: true,
    isFeatured: false,
    collection: "Ornaments",
    images: [
      {
        url: "/products/ornaments/nigiri-tuna-hero.jpg",
        altText: "Handmade felt tuna nigiri ornament hanging on a ribbon with a brass bell",
      },
      {
        url: "/products/ornaments/nigiri-tuna-2.jpg",
        altText: "The felt tuna nigiri from the side, showing the stitched marbling",
      },
      {
        url: "/products/ornaments/nigiri-tuna-stack.jpg",
        altText: "A stack of felt tuna nigiri ornaments on a wooden board",
      },
      boardShot,
      spreadShot,
    ],
    tags: nigiriTags("tuna"),
    seo: {
      metaTitle: "Tuna Nigiri Felt Ornament | Handmade Felt Sushi",
      metaDescription:
        "A handmade wool felt tuna nigiri with a needle-felted rice ball. One of a kind, made in Oxford. Free UK shipping over £50.",
      focusKeyword: "felt sushi ornament",
    },
  },
  {
    slug: "salmon-nigiri-felt-ornament",
    title: "Salmon Nigiri Felt Ornament",
    shortDescription:
      "A needle-felted rice ball under a slice of orange salmon, striped in white felt.",
    fullDescription:
      "A slice of salmon cut from bright orange wool felt, banded with white for the fat lines, sitting over a needle-felted rice ball.\n\n" +
      NIGIRI_BODY,
    category: "FELT",
    subcategory: "ORNAMENTS",
    materials: "wool roving, wool felt, glass beads, brass bell, satin ribbon",
    price: 14.0,
    stockCount: 1,
    isPublished: true,
    isFeatured: false,
    collection: "Ornaments",
    images: [
      {
        url: "/products/ornaments/nigiri-salmon-hero.jpg",
        altText: "Handmade felt salmon nigiri ornament hanging on a ribbon with a brass bell",
      },
      {
        url: "/products/ornaments/nigiri-salmon-2.jpg",
        altText: "The felt salmon nigiri from the side, showing its white felt stripes",
      },
      {
        url: "/products/ornaments/nigiri-salmon-stack.jpg",
        altText: "A stack of felt salmon nigiri ornaments on a wooden board",
      },
      boardShot,
      spreadShot,
    ],
    tags: nigiriTags("salmon"),
    seo: {
      metaTitle: "Salmon Nigiri Felt Ornament | Handmade Felt Sushi",
      metaDescription:
        "A handmade wool felt salmon nigiri with a needle-felted rice ball. One of a kind, made in Oxford. Free UK shipping over £50.",
      focusKeyword: "felt sushi ornament",
    },
  },
  {
    slug: "tamago-nigiri-felt-ornament",
    title: "Tamago Nigiri Felt Ornament",
    shortDescription:
      "A needle-felted rice ball topped with a slab of yellow egg, belted with a dark green nori band.",
    fullDescription:
      "A block of tamago cut from yellow wool felt, laid over a needle-felted rice ball and belted with a strip of deep green felt for the nori.\n\n" +
      NIGIRI_BODY,
    category: "FELT",
    subcategory: "ORNAMENTS",
    materials: "wool roving, wool felt, glass beads, brass bell, satin ribbon",
    price: 14.0,
    stockCount: 1,
    isPublished: true,
    isFeatured: false,
    collection: "Ornaments",
    images: [
      {
        url: "/products/ornaments/nigiri-egg-hero.jpg",
        altText: "Handmade felt tamago nigiri ornament hanging on a ribbon with a brass bell",
      },
      {
        url: "/products/ornaments/nigiri-egg-2.jpg",
        altText: "The felt tamago nigiri from the side, showing the nori band",
      },
      {
        url: "/products/ornaments/nigiri-egg-stack.jpg",
        altText: "A stack of felt tamago nigiri ornaments on a wooden board",
      },
      boardShot,
      spreadShot,
    ],
    tags: nigiriTags("egg"),
    seo: {
      metaTitle: "Tamago Nigiri Felt Ornament | Handmade Felt Sushi",
      metaDescription:
        "A handmade wool felt tamago nigiri with a nori band and needle-felted rice ball. Made in Oxford. Free UK shipping over £50.",
      focusKeyword: "felt sushi ornament",
    },
  },
  {
    slug: "prawn-nigiri-felt-ornament",
    title: "Prawn Nigiri Felt Ornament",
    shortDescription:
      "A needle-felted rice ball under a white prawn marked with peach segments, finished with an orange tail.",
    fullDescription:
      "A prawn cut from cream wool felt, its segments picked out in peach and its tail fanned in bright orange, laid over a needle-felted rice ball.\n\n" +
      NIGIRI_BODY,
    category: "FELT",
    subcategory: "ORNAMENTS",
    materials: "wool roving, wool felt, glass beads, brass bell, satin ribbon",
    price: 14.0,
    stockCount: 1,
    isPublished: true,
    isFeatured: true,
    collection: "Ornaments",
    images: [
      {
        url: "/products/ornaments/nigiri-prawn-hero.jpg",
        altText: "Handmade felt prawn nigiri ornament hanging on a ribbon with a brass bell",
      },
      {
        url: "/products/ornaments/nigiri-prawn-2.jpg",
        altText: "The felt prawn nigiri from the side, showing its shaped orange tail",
      },
      {
        url: "/products/ornaments/nigiri-prawn-stack.jpg",
        altText: "A stack of felt prawn nigiri ornaments on a wooden board",
      },
      boardShot,
      spreadShot,
    ],
    tags: nigiriTags("prawn"),
    seo: {
      metaTitle: "Prawn Nigiri Felt Ornament | Handmade Felt Sushi",
      metaDescription:
        "A handmade wool felt prawn nigiri with a shaped orange tail and needle-felted rice ball. Made in Oxford. Free UK shipping over £50.",
      focusKeyword: "felt sushi ornament",
    },
  },
  {
    slug: "brussels-sprout-felt-christmas-ornament",
    title: "Brussels Sprout Felt Christmas Ornament",
    shortDescription:
      "A needle-felted sprout with a brass bell and a face of its own — moustache, glasses, or a bow.",
    fullDescription:
      "A brussels sprout needle-felted from wool in three greens, wrapped in its own outer leaves, hung on a silver ribbon with a brass bell below.\n\nEvery sprout gets a character: a white, brown, or black moustache; small round gold glasses; a red satin bow; or a red gingham one. Tell us which you'd like in the order notes and we'll send that one — or leave it to us and we'll pick the one with the best face.\n\n✦ Made entirely by hand · One of a kind\n\nThe vegetable nobody asks for, on the tree where it belongs. Also good on a wreath, a gift bow, or hung from a rear-view mirror.\n\nHandmade in Oxford.",
    category: "FELT",
    subcategory: "ORNAMENTS",
    materials: "wool roving, wool felt, brass bell, satin ribbon, glass beads",
    price: 12.0,
    stockCount: 6,
    isPublished: true,
    isFeatured: true,
    collection: "Ornaments",
    images: [
      {
        url: "/lookbook/felt-sprout-ornaments-pair.jpg",
        altText:
          "Two handmade felt brussels sprout ornaments with brass bells, hanging on ribbons",
      },
      {
        url: "/products/ornaments/sprout-bow-gingham.jpg",
        altText: "Felt brussels sprout ornament with a red gingham bow",
      },
      {
        url: "/products/ornaments/sprout-bow-red.jpg",
        altText: "Felt brussels sprout ornament with a red satin bow",
      },
      {
        url: "/products/ornaments/sprout-glasses.jpg",
        altText: "Felt brussels sprout ornament wearing small round gold glasses",
      },
      {
        url: "/products/ornaments/sprout-moustache-white.jpg",
        altText: "Felt brussels sprout ornament with a white moustache",
      },
      {
        url: "/products/ornaments/sprout-moustache-brown.jpg",
        altText: "Felt brussels sprout ornament with a brown moustache",
      },
      {
        url: "/products/ornaments/sprout-moustache-black.jpg",
        altText: "Felt brussels sprout ornament with a black moustache",
      },
      {
        url: "/lookbook/felt-sprout-ornaments-wreath.jpg",
        altText:
          "Handmade felt sprout ornaments with brass bells arranged on a willow wreath",
      },
    ],
    tags: [
      "brussels sprout",
      "sprout ornament",
      "christmas ornament",
      "needle felted",
      "felt food",
      "wool felt",
      "secret santa",
      "stocking filler",
      "novelty christmas",
      "one of a kind",
      "handmade in oxford",
    ],
    seo: {
      metaTitle: "Brussels Sprout Felt Christmas Ornament | Handmade Wool Felt",
      metaDescription:
        "A needle-felted brussels sprout ornament with a brass bell and a face of its own. Handmade in Oxford. Free UK shipping over £50.",
      focusKeyword: "brussels sprout ornament",
    },
  },
];

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function syncImages(
  productId: string,
  images: { url: string; altText: string }[],
) {
  const wanted = new Set(images.map((img) => img.url));
  const existing = await prisma.productImage.findMany({
    where: { productId },
    select: { id: true, url: true },
  });

  const stale = existing.filter((img) => !wanted.has(img.url));
  if (stale.length > 0) {
    await prisma.productImage.deleteMany({
      where: { id: { in: stale.map((img) => img.id) } },
    });
  }

  const byUrl = new Map(existing.map((img) => [img.url, img.id]));
  for (const [index, image] of images.entries()) {
    const id = byUrl.get(image.url);
    const data = {
      altText: image.altText,
      sortOrder: index,
      isPrimary: index === 0,
    };
    if (id) {
      await prisma.productImage.update({ where: { id }, data });
    } else {
      await prisma.productImage.create({
        data: { productId, url: image.url, ...data },
      });
    }
  }
  return { added: images.length - byUrl.size, removed: stale.length };
}

async function main() {
  for (const listing of listings) {
    const { images, tags, seo, ...data } = listing;

    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existing) {
      const { added, removed } = await syncImages(existing.id, images);
      const delta =
        added || removed ? ` (+${added} image, -${removed})` : "";
      console.log(`Exists: ${data.title}${delta}`);
      continue;
    }

    const product = await prisma.product.create({ data });
    await syncImages(product.id, images);

    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      if (!tagSlug) continue;
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        create: { name: tagName, slug: tagSlug },
        update: {},
      });
      await prisma.productTag.upsert({
        where: { productId_tagId: { productId: product.id, tagId: tag.id } },
        create: { productId: product.id, tagId: tag.id },
        update: {},
      });
    }

    await prisma.productSeo.upsert({
      where: { productId: product.id },
      create: { productId: product.id, ...seo },
      update: seo,
    });

    console.log(
      `Created: ${data.title} — ${images.length} images, ${tags.length} tags`,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
