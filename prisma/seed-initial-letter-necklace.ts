/**
 * The Birthstone & Initial Choker.
 *
 * One listing, 312 combinations: twelve birthstone strands × twenty-six
 * initials. Both choices are made on the product page and travel with the bag
 * line through to the packing slip. The `initial-letter` tag is what turns the
 * picker on — see lib/personalisation; the twelve stones live in lib/birthstones.
 *
 * The gallery leads on the product itself rather than a model, then shows how
 * the two halves combine, then the twelve strands.
 *
 * Idempotent: re-running updates the listing and replaces its images rather
 * than stacking duplicates. `audience` is set separately by
 * seed-jewellery-audience and is deliberately not written here.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SLUG = "initial-letter-crystal-necklace";

const IMAGES = [
  // Order: the product itself, one diagram of how it is built, every strand,
  // then the lifestyle shots. Just the one composite — a gallery of them
  // repeats the same idea twelve times and buries the photography.
  {
    url: "/products/initial/finished/09-september-lapis-lazuli-s.jpg",
    altText: "A September lapis lazuli choker with a gold initial S, on the studio bust",
  },
  {
    url: "/products/initial/pairings/09-september-lapis-lazuli-s.jpg",
    altText: "How it is built: a gold initial, plus a birthstone strand, equals the finished necklace",
  },
  {
    url: "/products/initial/finished/02-february-amethyst-f.jpg",
    altText: "A February amethyst choker with a gold initial F, on the studio bust",
  },
  {
    url: "/products/initial/finished/03-march-aquamarine-k.jpg",
    altText: "A March aquamarine choker with a gold initial K, on the studio bust",
  },
  {
    url: "/products/initial/finished/04-april-clear-quartz-a.jpg",
    altText: "A April clear quartz choker with a gold initial A, on the studio bust",
  },
  {
    url: "/products/initial/finished/05-may-amazonite-m.jpg",
    altText: "A May amazonite choker with a gold initial M, on the studio bust",
  },
  {
    url: "/products/initial/finished/06-june-moonstone-e.jpg",
    altText: "A June moonstone choker with a gold initial E, on the studio bust",
  },
  {
    url: "/products/initial/finished/07-july-ruby-r.jpg",
    altText: "A July ruby choker with a gold initial R, on the studio bust",
  },
  {
    url: "/products/initial/finished/08-august-peridot-b.jpg",
    altText: "A August peridot choker with a gold initial B, on the studio bust",
  },
  {
    url: "/products/initial/finished/10-october-rainbow-tourmaline-o.jpg",
    altText: "A October rainbow tourmaline choker with a gold initial O, on the studio bust",
  },
  {
    url: "/products/initial/finished/11-november-citrine-n.jpg",
    altText: "A November citrine choker with a gold initial N, on the studio bust",
  },
  {
    url: "/products/initial/finished/12-december-turquoise-d.jpg",
    altText: "A December turquoise choker with a gold initial D, on the studio bust",
  },
  {
    url: "/products/initial/birthstones/01-january-garnet.jpg",
    altText: "January — garnet choker, for passion and protection",
  },
  {
    url: "/products/initial/birthstones/02-february-amethyst.jpg",
    altText: "February — amethyst choker, for calm and clarity",
  },
  {
    url: "/products/initial/birthstones/03-march-aquamarine.jpg",
    altText: "March — aquamarine choker, for serenity and courage",
  },
  {
    url: "/products/initial/birthstones/04-april-clear-quartz.jpg",
    altText: "April — clear quartz choker, for purity and focus",
  },
  {
    url: "/products/initial/birthstones/05-may-amazonite.jpg",
    altText: "May — amazonite choker, for hope and harmony",
  },
  {
    url: "/products/initial/birthstones/06-june-moonstone.jpg",
    altText: "June — moonstone choker, for intuition and balance",
  },
  {
    url: "/products/initial/birthstones/07-july-ruby.jpg",
    altText: "July — ruby choker, for confidence and love",
  },
  {
    url: "/products/initial/birthstones/08-august-peridot.jpg",
    altText: "August — peridot choker, for joy and good vibes",
  },
  {
    url: "/products/initial/birthstones/09-september-lapis-lazuli.jpg",
    altText: "September — lapis lazuli choker, for wisdom and truth",
  },
  {
    url: "/products/initial/birthstones/10-october-rainbow-tourmaline.jpg",
    altText: "October — rainbow tourmaline choker, for creativity and balance",
  },
  {
    url: "/products/initial/birthstones/11-november-citrine.jpg",
    altText: "November — citrine choker, for warmth and abundance",
  },
  {
    url: "/products/initial/birthstones/12-december-turquoise.jpg",
    altText: "December — turquoise choker, for friendship and peace",
  },
  {
    url: "/products/initial/initial-letter-necklace-hero.jpg",
    altText: "A bride in ivory silk wearing a clear quartz choker with a gold initial A",
  },
  {
    url: "/products/initial/initial-letter-necklace-bridesmaids-trio.jpg",
    altText: "Three bridesmaids each wearing an initial choker — E, A and O",
  },
  {
    url: "/products/initial/initial-letter-necklace-navy-mother-daughter.jpg",
    altText: "Mother and flower girl in navy wearing matching lapis lazuli initial chokers, S and K",
  },
  {
    url: "/products/initial/initial-letter-necklace-lilac-amethyst.jpg",
    altText: "A bridesmaid in lilac wearing an amethyst choker with a gold initial F",
  },
  {
    url: "/products/initial/initial-letter-necklace-burgundy-garnet.jpg",
    altText: "A bridesmaid in burgundy wearing a garnet choker with a gold initial J",
  },
  {
    url: "/products/initial/initial-letter-necklace-rose-pink.jpg",
    altText: "A bridesmaid in rose pink wearing a ruby choker with a gold initial R",
  },
  {
    url: "/products/initial/initial-letter-necklace-flower-girl-blue.jpg",
    altText: "A flower girl in pale blue on the beach wearing an aquamarine initial choker",
  },
  {
    url: "/products/initial/initial-letter-necklace-teal-gift-box.jpg",
    altText: "An amazonite choker with a gold initial, presented in a Tengology gift box",
  },
  {
    url: "/products/initial/initial-letter-necklace-pink-gift-box.jpg",
    altText: "A ruby choker with a gold initial in a Tengology gift box beside a thank you card",
  },
  {
    url: "/products/initial/initial-letter-necklace-pink-lace-gift-box.jpg",
    altText: "A ruby choker boxed on lace among cream roses",
  },
];

const TAGS = [
  "initial-letter",
  "birthstone necklace",
  "birthstone choker",
  "personalised birthstone",
  "personalised necklace",
  "initial necklace",
  "bridesmaid gift",
  "crystal necklace",
  "letter pendant",
  "wedding jewellery",
  "gold initial",
  "flower girl gift",
  "gift for her",
  "handmade jewellery",
];

const FULL_DESCRIPTION = `Two choices make the necklace: the birthstone strand, and the initial that hangs from it.

Pick a month and the choker is strung from that stone — garnet for January, amethyst for February, lapis lazuli for September, turquoise for December. Twelve in all, each a strand of tiny faceted beads on a gold-plated clasp with an extension chain and a small heart at the end.

Then pick a letter. The charm is polished 18K gold-plated stainless steel, about 11mm wide and 12mm tall, and it is threaded onto the strand by hand once you have chosen.

That is why a whole bridal party can order the same necklace and still get something that is only theirs — her month, her initial. Order several and each one is strung, boxed and labelled separately, so there is nothing to sort out when the parcel arrives.

**The twelve stones**
January · Garnet — Passion & Protection
February · Amethyst — Calm & Clarity
March · Aquamarine — Serenity & Courage
April · Clear Quartz — Purity & Focus
May · Amazonite — Hope & Harmony
June · Moonstone — Intuition & Balance
July · Ruby — Confidence & Love
August · Peridot — Joy & Good Vibes
September · Lapis Lazuli — Wisdom & Truth
October · Rainbow Tourmaline — Creativity & Balance
November · Citrine — Warmth & Abundance
December · Turquoise — Friendship & Peace

• Faceted natural stone beads, roughly 2–3mm
• 18K gold-plated stainless steel initial charm, approx. 11 × 12mm
• Gold-plated clasp, extension chain and heart drop
• Choker length, adjustable
• Presented in a Tengology gift box
• Made to order in Oxford — allow 2–3 working days before dispatch

The stones are natural, so the exact shade varies a little from strand to strand.`;

async function main() {
  const product = await prisma.product.upsert({
    where: { slug: SLUG },
    update: {
      title: "Birthstone & Initial Choker",
      shortDescription:
        "Pick a birthstone and an initial: a strand of your month's stone, finished with an 18K gold-plated letter. Made to order.",
      fullDescription: FULL_DESCRIPTION,
      category: "GEMSTONE",
      subcategory: "JEWELLERY",
      collection: "Bridal Party",
      intention: "Love",
      materials:
        "faceted natural birthstone beads, 18K gold-plated stainless steel initial charm, gold-plated clasp and extension chain",
      price: 25.0,
      stockCount: 40,
      lowStockThreshold: 5,
      isPublished: true,
      isFeatured: true,
    },
    create: {
      slug: SLUG,
      title: "Birthstone & Initial Choker",
      shortDescription:
        "Pick a birthstone and an initial: a strand of your month's stone, finished with an 18K gold-plated letter. Made to order.",
      fullDescription: FULL_DESCRIPTION,
      category: "GEMSTONE",
      subcategory: "JEWELLERY",
      collection: "Bridal Party",
      intention: "Love",
      materials:
        "faceted natural birthstone beads, 18K gold-plated stainless steel initial charm, gold-plated clasp and extension chain",
      price: 25.0,
      stockCount: 40,
      lowStockThreshold: 5,
      isPublished: true,
      isFeatured: true,
    },
  });

  // Replace the gallery wholesale so re-runs can reorder without duplicating.
  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  await prisma.productImage.createMany({
    data: IMAGES.map((img, i) => ({
      productId: product.id,
      url: img.url,
      altText: img.altText,
      sortOrder: i,
      isPrimary: i === 0,
    })),
  });

  for (const name of TAGS) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    await prisma.productTag.upsert({
      where: { productId_tagId: { productId: product.id, tagId: tag.id } },
      update: {},
      create: { productId: product.id, tagId: tag.id },
    });
  }

  await prisma.productSeo.upsert({
    where: { productId: product.id },
    update: {},
    create: {
      productId: product.id,
      metaTitle: "Birthstone & Initial Choker | Personalised Bridesmaid Gift",
      metaDescription:
        "Choose a birthstone and an initial: a hand-strung choker in your month's stone finished with an 18K gold-plated letter. Twelve stones, A–Z, made to order in Oxford and gift boxed.",
      focusKeyword: "birthstone initial necklace",
      ogTitle: "Birthstone & Initial Choker",
      ogDescription:
        "Pick your month and your letter. A hand-strung birthstone choker with an 18K gold-plated initial, made to order and gift boxed.",
      ogImageUrl: IMAGES[0].url,
    },
  });

  console.log(`✓ ${product.title} — /product/${product.slug} (£${product.price}, ${IMAGES.length} images, ${TAGS.length} tags)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
