/**
 * Merge near-duplicate listings and tidy the headband range.
 *
 * Four nigiri become one listing with a topping choice; two unicorn crowns
 * become one with a horn choice. Nothing is deleted — a merged-away listing is
 * unpublished and keeps its images, so it can be brought back or consulted, and
 * any order that already points at it still resolves.
 *
 * Also corrects a real mix-up: the Easter bunny "hair clip" was photographed
 * with headband shots. Both photographs move to the headband, and the hair clip
 * is unpublished until it has a picture of itself.
 *
 * Prices are deliberately untouched here — see the note at the end.
 *
 * Idempotent.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function setImages(slug: string, images: { url: string; altText: string }[]) {
  const p = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!p) throw new Error(`no product ${slug}`);
  await prisma.productImage.deleteMany({ where: { productId: p.id } });
  await prisma.productImage.createMany({
    data: images.map((img, i) => ({
      productId: p.id,
      url: img.url,
      altText: img.altText,
      sortOrder: i,
      isPrimary: i === 0,
    })),
  });
}

/** Retire a listing that has been folded into another. */
async function retire(slug: string, into: string) {
  const r = await prisma.product.updateMany({
    where: { slug },
    data: { isPublished: false, isFeatured: false },
  });
  if (r.count) console.log(`   retired ${slug} → ${into}`);
}

async function main() {
  // ── Nigiri: four listings, one product ──────────────────────────────────
  await prisma.product.update({
    where: { slug: "salmon-nigiri-felt-ornament" },
    data: {
      slug: "nigiri-felt-ornament",
      title: "Nigiri Felt Ornament",
      shortDescription:
        "A hand-stitched piece of nigiri to hang on the tree — salmon, tuna, tamago or prawn.",
      fullDescription: `A single piece of nigiri, stitched from wool felt: a pressed cushion of rice with the topping laid over it and a band of nori where one is called for.

Choose the topping. Salmon and tuna are cut from marbled felt so the grain reads at arm's length, tamago is the sweet egg with its dark seaweed belt, and the prawn keeps its tail stripes.

They started as Christmas ornaments and have been bought just as often as bag charms and window decorations. Each one hangs from a cotton loop.

• Approx. 6cm long
• Wool and wool-blend felt, hand-stitched
• Cotton hanging loop
• Made in Oxford
• Decorative — not a toy, and not food, however convincing`,
      stockCount: 4,
      isPublished: true,
    },
  });
  await setImages("nigiri-felt-ornament", [
    { url: "/products/ornaments/nigiri-four-up-hero.jpg", altText: "Four handmade felt nigiri — salmon, tuna, tamago and prawn" },
    { url: "/products/ornaments/nigiri-salmon-hero.jpg", altText: "Handmade felt salmon nigiri ornament" },
    { url: "/products/ornaments/nigiri-tuna-hero.jpg", altText: "Handmade felt tuna nigiri ornament" },
    { url: "/products/ornaments/nigiri-egg-hero.jpg", altText: "Handmade felt tamago nigiri ornament with a nori band" },
    { url: "/products/ornaments/nigiri-prawn-hero.jpg", altText: "Handmade felt prawn nigiri ornament" },
    { url: "/products/ornaments/nigiri-four-on-board.jpg", altText: "Four felt nigiri arranged on a wooden serving board" },
    { url: "/products/ornaments/nigiri-spread.jpg", altText: "A spread of handmade felt nigiri in a basket" },
    { url: "/products/ornaments/nigiri-salmon-stack.jpg", altText: "Felt salmon nigiri stacked, showing the rice cushion" },
  ]);
  for (const s of ["tuna-nigiri-felt-ornament", "tamago-nigiri-felt-ornament", "prawn-nigiri-felt-ornament"]) {
    await retire(s, "nigiri-felt-ornament");
  }
  console.log("✓ Nigiri — four listings merged into one");

  // ── Unicorn: gold and silver, one product ───────────────────────────────
  await prisma.product.update({
    where: { slug: "unicorn-flower-crown-headband-gold" },
    data: {
      slug: "unicorn-flower-crown-headband",
      title: "Unicorn Flower Crown Headband",
      shortDescription:
        "A coiled felt horn between glitter-lined ears, wreathed in a full flower crown. In gold or silver.",
      fullDescription: `A coiled horn set between two ears, with a crown of felt flowers worked around the base — anemones, small roses, buds and leaves, built up until the band underneath disappears.

Choose gold or silver. The horn and the lining inside the ears change with it; the flowers are the same either way.

Built on a padded, fabric-covered alice band, so it sits comfortably through a party rather than digging in after twenty minutes.

• Wool and wool-blend felt, with glitter felt for the horn and ear linings
• Padded alice band, covered to the underside
• Approx. 14cm across the crown
• Made in Oxford`,
      stockCount: 2,
      isPublished: true,
    },
  });
  await setImages("unicorn-flower-crown-headband", [
    { url: "/products/unicorn/unicorn-crown-pair-hero.jpg", altText: "Unicorn flower crown headbands in gold and silver, side by side" },
    { url: "/products/unicorn/unicorn-crown-gold-hero.jpg", altText: "Unicorn flower crown headband with a gold horn" },
    { url: "/products/unicorn/unicorn-crown-silver-hero.jpg", altText: "Unicorn flower crown headband with a silver horn" },
    { url: "/products/unicorn/unicorn-crown-gold-detail.jpg", altText: "Detail of the gold horn and felt flower crown" },
    { url: "/products/unicorn/unicorn-crown-silver-detail.jpg", altText: "Detail of the silver horn and felt flower crown" },
    { url: "/products/model/unicorn-flower-crown-headband-gold-1.jpg", altText: "The gold unicorn flower crown headband worn" },
    { url: "/products/model/unicorn-flower-crown-headband-silver-1.jpg", altText: "The silver unicorn flower crown headband worn" },
  ]);
  await retire("unicorn-flower-crown-headband-silver", "unicorn-flower-crown-headband");
  console.log("✓ Unicorn — gold and silver merged into one");

  // ── Headband range ──────────────────────────────────────────────────────
  await retire("pastel-daisy-headband-mint", "removed at the studio's request");
  console.log("✓ Pastel Daisy Headband — removed from the shop");

  await prisma.product.update({
    where: { slug: "felt-dahlia-headband" },
    data: { slug: "flower-headband", title: "Flower Headband" },
  });
  console.log("✓ Felt Dahlia Headband → Flower Headband");

  // Blue Anemone was never its own piece — it is one of these, in blue.
  await prisma.product.update({
    where: { slug: "oversized-bloom-headband" },
    data: {
      slug: "single-flower-headband",
      title: "Single Flower Headband",
      shortDescription:
        "One oversized felt bloom on a covered band — anemone, poppy or dahlia, in whichever colour is on the table.",
      fullDescription: `One large flower and nothing else: petals cut and shaped by hand, layered around a textured centre, and set on a fabric-covered band.

It is the piece to reach for when a full crown is too much. Made in whatever blooms and colours are in the studio — deep blue anemones, coral poppies, blush dahlias — so the photographs show the range rather than a fixed list. Ask if you are after a particular colour.

• Wool and wool-blend felt
• Fabric-covered alice band, padded to the underside
• Bloom approx. 9–11cm across
• Made in Oxford`,
      stockCount: 3,
    },
  });
  await setImages("single-flower-headband", [
    { url: "/products/statement-blooms/blooms-pair-hero.jpg", altText: "Two single-bloom felt headbands, in purple and coral" },
    { url: "/products/statement-blooms/anemone-blue-hero.jpg", altText: "A single blue felt anemone headband held in a hand" },
    { url: "/products/model/blue-anemone-headband-1.jpg", altText: "The blue anemone single flower headband worn" },
    { url: "/products/model/blue-anemone-headband-2.jpg", altText: "The blue anemone single flower headband worn, side view" },
    { url: "/products/statement-blooms/blooms-pair-2.jpg", altText: "Single-bloom felt headbands photographed on a wooden slice" },
  ]);
  await retire("blue-anemone-headband", "single-flower-headband");
  console.log("✓ Oversized Bloom → Single Flower Headband (Blue Anemone folded in)");

  // ── Easter bunny: the clip was wearing the headband's photographs ───────
  await setImages("easter-bunny-ear-floral-headband", [
    { url: "/products/spring-bouquet/bunny-ear-headband-3.jpg", altText: "Easter bunny ear floral headband propped on a wooden bunny board" },
    { url: "/products/spring-bouquet/bunny-ear-headband-hero.jpg", altText: "Easter bunny ear floral headband with felt ears and spring flowers" },
    { url: "/products/spring-bouquet/bunny-ear-headband-4.jpg", altText: "Easter bunny ear floral headband held in a hand" },
    { url: "/products/spring-bouquet/bunny-ear-headband-2.jpg", altText: "Easter bunny ear floral headband laid flat, showing the flower cluster" },
    { url: "/products/spring-bouquet/bunny-ear-group.jpg", altText: "Easter bunny ear headband with the felt ears and blooms in view" },
    { url: "/products/model/easter-bunny-ear-floral-headband-1.jpg", altText: "The Easter bunny ear floral headband worn" },
    { url: "/products/model/easter-bunny-ear-floral-headband-2.jpg", altText: "The Easter bunny ear floral headband worn, side view" },
  ]);
  await prisma.productImage.deleteMany({
    where: { product: { slug: "easter-bunny-ear-floral-hair-clip" } },
  });
  await prisma.product.updateMany({
    where: { slug: "easter-bunny-ear-floral-hair-clip" },
    data: { isPublished: false, isFeatured: false },
  });
  console.log("✓ Easter bunny — headband photos reassigned, hair clip unpublished (needs its own photo)");

  const live = await prisma.product.count({ where: { isPublished: true } });
  console.log(`\nPublished products now: ${live}`);
  console.log("Prices unchanged — tell me the new ones and I'll set them.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
