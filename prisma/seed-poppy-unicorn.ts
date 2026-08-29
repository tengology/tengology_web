import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Additive seed for the August 2026 photo drop: two unicorn flower crowns and
 * the two remembrance poppy pieces that share a flat-lay with the poppy clip
 * already in the catalogue.
 *
 * Additive, and safe to re-run. Products are matched on slug and skipped if
 * they exist, images are matched on URL, so a second run writes nothing. The
 * poppy clip is deliberately *not* re-listed — the group shot it appears in is
 * attached to the existing listing instead.
 *
 *   npx tsx prisma/seed-poppy-unicorn.ts
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

const listings: Listing[] = [
  {
    slug: "remembrance-poppy-felt-headband",
    title: "Remembrance Poppy Felt Headband",
    shortDescription:
      "A single red wool felt poppy with a black centre and gold-stitched seed head, on a slim black headband.",
    fullDescription:
      "A large red poppy cut and shaped from wool felt, layered petal over petal, with a black fringed centre and a green seed head worked in gold thread. It sits to one side of a slim black satin-wrapped metal headband.\n\n✦ Made entirely by hand · One of a kind\n\nA quiet, respectful piece for Remembrance Sunday, school services, and parades — and comfortable enough to wear all day.\n\nMatching poppy brooch and hair clip available separately.\n\nHandmade in Oxford.",
    category: "FELT",
    subcategory: "HAIR_ACCESSORIES",
    materials: "wool felt, embroidery thread, satin-wrapped metal headband",
    price: 16.0,
    stockCount: 1,
    isPublished: true,
    isFeatured: false,
    collection: "Poppy",
    images: [
      {
        url: "/products/festive/poppy-headband-hero.jpg",
        altText: "Red felt remembrance poppy on a slim black headband",
      },
      {
        url: "/products/festive/poppy-set-group.jpg",
        altText:
          "The remembrance poppy headband, brooch, and hair clip laid together on a wooden tray",
      },
    ],
    tags: [
      "remembrance poppy",
      "poppy headband",
      "felt headband",
      "wool felt",
      "handmade headband",
      "remembrance sunday",
      "red poppy",
      "one of a kind",
      "poppy appeal",
      "handmade in oxford",
    ],
    seo: {
      metaTitle: "Remembrance Poppy Felt Headband | Handmade Wool Felt",
      metaDescription:
        "A handmade wool felt remembrance poppy on a slim black headband. One of a kind, made in Oxford. Free UK shipping over £50.",
      focusKeyword: "poppy headband",
    },
  },
  {
    slug: "remembrance-poppy-felt-brooch",
    title: "Remembrance Poppy Felt Brooch",
    shortDescription:
      "A red wool felt poppy brooch with a black fringed centre and a gold-stitched green seed head.",
    fullDescription:
      "A generous red poppy, each petal cut and shaped by hand from wool felt and layered for depth, finished with a black fringed centre and a green seed head stitched in gold thread. Backed with a pin so it can move between coat, blazer, and bag.\n\n✦ Made entirely by hand · One of a kind\n\nWorn for Remembrance Sunday and the days around it, and sturdy enough to pin on year after year.\n\nMatching poppy headband and hair clip available separately.\n\nHandmade in Oxford.",
    category: "FELT",
    subcategory: "BROOCHES",
    materials: "wool felt, embroidery thread, metal pin back",
    price: 14.0,
    stockCount: 2,
    isPublished: true,
    isFeatured: false,
    collection: "Poppy",
    images: [
      {
        url: "/products/festive/poppy-brooch-hero.jpg",
        altText:
          "Red felt remembrance poppy brooch on a kraft Tengology card",
      },
      {
        url: "/products/festive/poppy-brooch-2.jpg",
        altText:
          "Close view of the poppy brooch showing the black fringed centre and gold-stitched seed head",
      },
      {
        url: "/products/festive/poppy-set-group.jpg",
        altText:
          "The remembrance poppy headband, brooch, and hair clip laid together on a wooden tray",
      },
    ],
    tags: [
      "remembrance poppy",
      "poppy brooch",
      "felt brooch",
      "wool felt",
      "handmade brooch",
      "remembrance sunday",
      "red poppy",
      "lapel pin",
      "one of a kind",
      "handmade in oxford",
    ],
    seo: {
      metaTitle: "Remembrance Poppy Felt Brooch | Handmade Wool Felt",
      metaDescription:
        "A handmade wool felt remembrance poppy brooch with a gold-stitched seed head. Made in Oxford. Free UK shipping over £50.",
      focusKeyword: "poppy brooch",
    },
  },
  {
    slug: "unicorn-flower-crown-headband-silver",
    title: "Unicorn Flower Crown Headband — Silver",
    shortDescription:
      "A felt unicorn horn and silver-glitter ears wreathed in fuchsia, lilac, and mint blooms on a white headband.",
    fullDescription:
      "A cream wool felt horn, coiled and stitched by hand, rises between two ears lined with silver glitter felt. Around them sits a full wreath of blooms — a fuchsia anemone with a silver glitter bead centre, a lilac daisy with a yellow wool pom-pom, mint and sage leaves, and tiny buttercup and blush buds tucked into the gaps.\n\n✦ Made entirely by hand · One of a kind\n\nBuilt on a white satin-wrapped metal headband, wide enough to stay put through a party and light enough to forget you're wearing it. For birthdays, dressing-up boxes, and photographs you'll keep.\n\nAlso available in gold.\n\nHandmade in Oxford.",
    category: "FELT",
    subcategory: "HAIR_ACCESSORIES",
    materials:
      "wool felt, glitter felt, wool pom-poms, glitter beads, satin-wrapped metal headband",
    price: 28.0,
    stockCount: 1,
    isPublished: true,
    isFeatured: false,
    collection: "Unicorn",
    images: [
      {
        url: "/products/unicorn/unicorn-crown-silver-hero.jpg",
        altText:
          "Unicorn flower crown headband with a cream felt horn, silver glitter ears, and fuchsia and lilac felt blooms",
      },
      {
        url: "/products/unicorn/unicorn-crown-silver-detail.jpg",
        altText:
          "Close view of the fuchsia anemone with its silver glitter bead centre and the lilac daisy beside it",
      },
    ],
    tags: [
      "unicorn headband",
      "flower crown",
      "felt headband",
      "unicorn horn",
      "wool felt",
      "birthday headband",
      "party headband",
      "girls headband",
      "dress up",
      "one of a kind",
      "handmade in oxford",
    ],
    seo: {
      metaTitle: "Silver Unicorn Flower Crown Headband | Handmade Wool Felt",
      metaDescription:
        "A handmade wool felt unicorn headband with silver glitter ears and a fuchsia and lilac flower crown. Made in Oxford. Free UK shipping over £50.",
      focusKeyword: "unicorn flower crown headband",
    },
  },
  {
    slug: "unicorn-flower-crown-headband-gold",
    title: "Unicorn Flower Crown Headband — Gold",
    shortDescription:
      "A felt unicorn horn and gold-glitter ears wreathed in coral, lilac, and blush blooms on a gold headband.",
    fullDescription:
      "A cream wool felt horn, coiled and stitched by hand, rises between two ears lined with gold glitter felt. Around them sits a full wreath of blooms — a coral anemone with a gold glitter bead centre, a lilac daisy with a yellow wool pom-pom, bright green leaves, and blush, peach, and buttercup buds filling the gaps.\n\n✦ Made entirely by hand · One of a kind\n\nBuilt on a gold satin-wrapped metal headband, wide enough to stay put through a party and light enough to forget you're wearing it. For birthdays, dressing-up boxes, and photographs you'll keep.\n\nAlso available in silver.\n\nHandmade in Oxford.",
    category: "FELT",
    subcategory: "HAIR_ACCESSORIES",
    materials:
      "wool felt, glitter felt, wool pom-poms, glitter beads, satin-wrapped metal headband",
    price: 28.0,
    stockCount: 1,
    isPublished: true,
    isFeatured: false,
    collection: "Unicorn",
    images: [
      {
        url: "/products/unicorn/unicorn-crown-gold-hero.jpg",
        altText:
          "Unicorn flower crown headband with a cream felt horn, gold glitter ears, and coral and lilac felt blooms",
      },
      {
        url: "/products/unicorn/unicorn-crown-gold-detail.jpg",
        altText:
          "Close view of the coral anemone with its gold glitter bead centre and the lilac daisy beside it",
      },
    ],
    tags: [
      "unicorn headband",
      "flower crown",
      "felt headband",
      "unicorn horn",
      "wool felt",
      "birthday headband",
      "party headband",
      "girls headband",
      "dress up",
      "one of a kind",
      "handmade in oxford",
    ],
    seo: {
      metaTitle: "Gold Unicorn Flower Crown Headband | Handmade Wool Felt",
      metaDescription:
        "A handmade wool felt unicorn headband with gold glitter ears and a coral and lilac flower crown. Made in Oxford. Free UK shipping over £50.",
      focusKeyword: "unicorn flower crown headband",
    },
  },
];

/**
 * The flat-lay also shows the poppy clip that is already listed. It joins that
 * listing's gallery rather than becoming a fifth product.
 */
const extraImages: { slug: string; url: string; altText: string }[] = [
  {
    slug: "remembrance-poppy-felt-hair-clip",
    url: "/products/festive/poppy-set-group.jpg",
    altText:
      "The remembrance poppy hair clip alongside the matching headband and brooch on a wooden tray",
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function attachImages(
  productId: string,
  images: { url: string; altText: string }[],
) {
  const existing = await prisma.productImage.findMany({
    where: { productId },
    select: { url: true, sortOrder: true, isPrimary: true },
  });
  const seen = new Set(existing.map((img) => img.url));
  let sortOrder = existing.reduce((max, img) => Math.max(max, img.sortOrder), -1);
  const hasPrimary = existing.some((img) => img.isPrimary);

  let added = 0;
  for (const image of images) {
    if (seen.has(image.url)) continue;
    seen.add(image.url);
    sortOrder += 1;
    await prisma.productImage.create({
      data: {
        productId,
        url: image.url,
        altText: image.altText,
        sortOrder,
        isPrimary: !hasPrimary && added === 0,
      },
    });
    added += 1;
  }
  return added;
}

async function main() {
  for (const listing of listings) {
    const { images, tags, seo, ...data } = listing;

    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existing) {
      const added = await attachImages(existing.id, images);
      console.log(
        `Exists, skipped: ${data.title}${added ? ` (+${added} image${added > 1 ? "s" : ""})` : ""}`,
      );
      continue;
    }

    const product = await prisma.product.create({ data });
    await attachImages(product.id, images);

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

  for (const extra of extraImages) {
    const product = await prisma.product.findUnique({
      where: { slug: extra.slug },
      select: { id: true, title: true },
    });
    if (!product) {
      console.log(`Missing, skipped image: ${extra.slug}`);
      continue;
    }
    const added = await attachImages(product.id, [extra]);
    console.log(
      added
        ? `Added group photo to: ${product.title}`
        : `Group photo already on: ${product.title}`,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
