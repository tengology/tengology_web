/**
 * Four listings drafted from the August 2026 studio photography.
 *
 * The three Liberty pieces go live; the lion dance charm stays a draft until
 * its price is confirmed. Prices here are the studio's to correct in
 * /admin/products — this script only seeds a starting point.
 *
 * Stained glass is deliberately absent. It is cut in ones and never twice the
 * same, so it lives on the site as a photographed body of work — see the
 * `gallery` block on the GLASS family in lib/taxonomy.
 *
 * Idempotent: re-running refreshes copy and images without duplicating rows.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

interface Listing {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string | null;
  collection: string | null;
  intention: string | null;
  materials: string;
  /** Placeholder — confirm and correct in the admin. */
  price: number;
  /** Liberty is live; anything still awaiting a price stays a draft. */
  published: boolean;
  stockCount: number;
  tags: string[];
  seo: { metaTitle: string; metaDescription: string; focusKeyword: string };
  images: { url: string; altText: string }[];
}

const LISTINGS: Listing[] = [
  {
    slug: "cat-ear-drawstring-pouch",
    title: "Cat-Ear Drawstring Pouch",
    shortDescription:
      "A little floral-cotton pouch with pointed cat ears, a contrast lining and a clip so it rides on your bag strap.",
    fullDescription: `A small drawstring pouch with two pointed ears, cut from floral cotton and lined in a print that has nothing to do with the outside — lilac polka dot inside a moody navy bloom, peach inside a meadow.

Big enough for lip balm, earphones, a set of keys and a folded note. The cotton drawstrings pull the top closed into a soft gather, and the swivel clip at the back means it hangs off a tote handle, a belt loop or a rucksack strap instead of sinking to the bottom of a bag.

Every pouch is cut and sewn one at a time in the Oxford studio. Where the print falls across the ears shifts a little from one to the next, so yours will not be identical to the photograph, but the shape, the lining and the finish are the same each time. Binding is stitched in a contrast stripe, and the seams are finished inside.

• Approx. 12cm tall (excluding ears) × 11cm wide
• Floral cotton outer, contrast printed cotton lining
• Cotton drawstring cords with knotted ends
• Silver-tone swivel clip and D-ring
• Machine-sewn and hand-finished in Oxford`,
    category: "LIBERTY",
    subcategory: "BAGS",
    collection: "Everyday Carry",
    intention: null,
    materials: "floral cotton, contrast cotton lining, cotton cord, silver-tone swivel clip",
    price: 16.0,
    stockCount: 8,
    published: true,
    tags: [
      "drawstring pouch", "cat ear pouch", "floral cotton", "handmade pouch",
      "bag charm", "coin purse", "liberty print", "gift for her", "handmade in oxford",
    ],
    seo: {
      metaTitle: "Cat-Ear Drawstring Pouch | Handmade Floral Cotton",
      metaDescription:
        "A small floral cotton drawstring pouch with pointed cat ears, contrast lining and a swivel clip for your bag strap. Cut and sewn one at a time in Oxford.",
      focusKeyword: "cat ear drawstring pouch",
    },
    images: [
      { url: "/products/pouch/cat-ear-pouch-pink-floral-hero.jpg", altText: "Cat-ear drawstring pouch in pink and mint floral cotton with cream cords" },
      { url: "/products/pouch/cat-ear-pouch-navy-floral.jpg", altText: "Cat-ear drawstring pouch in navy blue floral cotton" },
      { url: "/products/pouch/cat-ear-pouch-meadow-floral.jpg", altText: "Cat-ear drawstring pouch in a bright meadow floral print" },
      { url: "/products/pouch/cat-ear-pouch-pink-strawberry.jpg", altText: "Cat-ear drawstring pouch in a pink strawberry print" },
      { url: "/products/pouch/cat-ear-pouch-red-gingham.jpg", altText: "Cat-ear drawstring pouch in red gingham cotton" },
      { url: "/products/pouch/cat-ear-pouch-lilac-lining.jpg", altText: "Navy floral pouch opened to show the lilac polka dot lining and striped binding" },
      { url: "/products/pouch/cat-ear-pouch-open-detail.jpg", altText: "Meadow floral pouch opened flat showing the peach lining and D-ring" },
      { url: "/products/pouch/cat-ear-pouch-on-tote-meadow.jpg", altText: "Meadow floral cat-ear pouch clipped to the strap of a tan canvas tote bag" },
      { url: "/products/pouch/cat-ear-pouch-on-tote-strawberry.jpg", altText: "Strawberry print cat-ear pouch hanging from a tan canvas tote" },
      { url: "/products/pouch/cat-ear-pouch-on-tote-pink.jpg", altText: "Pink floral cat-ear pouch clipped to a tan canvas tote bag" },
    ],
  },



  {
    slug: "liberty-print-knot-headband",
    title: "Floral Knot Headband",
    shortDescription:
      "A padded alice band wrapped in floral cotton and finished with a soft top knot that holds its shape.",
    fullDescription: `Fabric-covered alice band with a knotted bow sitting just off-centre — the shape holds because the bow is stuffed and wired rather than simply tied, so it does not flop by lunchtime.

The band itself is padded and covered to the underside, which is the part that decides whether a headband is comfortable. No exposed metal teeth, no pressure point behind the ears.

Cut from small-scale floral cottons: meadow blues, strawberries on white, lilac ditsy, mustard, deep berry. The same prints run through the bow clips and the pouches, so a set can be matched. The fabric is reordered when it runs low — what shifts is which part of the repeat a band happens to be cut from, so the flowers will sit a little differently to the photograph.

• Padded alice band, approx. 3cm at its widest
• Floral cotton cover, knotted and shaped bow
• Adult size — sits comfortably on most head shapes
• Cut and sewn in Oxford

Choose your print from the photographs. If you would like one that isn't shown, ask — most of the range can be made up on request.`,
    category: "LIBERTY",
    subcategory: "HAIR_ACCESSORIES",
    collection: "Meadow",
    intention: null,
    materials: "floral cotton, padded alice band, wadding",
    price: 18.0,
    stockCount: 12,
    published: true,
    tags: [
      "knot headband", "floral headband", "liberty print", "alice band",
      "hair accessories", "handmade headband", "gift for her", "handmade in oxford",
    ],
    seo: {
      metaTitle: "Floral Knot Headband | Handmade Padded Alice Band",
      metaDescription:
        "A padded alice band wrapped in small-scale floral cotton with a shaped top knot that holds all day. Cut and sewn in small runs in Oxford.",
      focusKeyword: "floral knot headband",
    },
    images: [
      { url: "/products/headband/knot-headband-blue-meadow-hero.jpg", altText: "Floral knot headband in a pale blue meadow print held against a white wall" },
      { url: "/products/headband/knot-headband-turquoise.jpg", altText: "Knot headband in a turquoise and coral floral cotton" },
      { url: "/products/headband/knot-headband-blue-poppy.jpg", altText: "Knot headband in a blue and white poppy print" },
      { url: "/products/headband/knot-headband-green-meadow.jpg", altText: "Knot headband in a green and blue meadow floral" },
      { url: "/products/headband/knot-headband-strawberry.jpg", altText: "Knot headband in a red strawberry print on white cotton" },
      { url: "/products/headband/knot-headband-lilac.jpg", altText: "Knot headband in a lilac ditsy floral print" },
      { url: "/products/headband/knot-headband-berry.jpg", altText: "Knot headband in a deep berry and green floral cotton" },
      { url: "/products/headband/knot-headband-pink-ditsy.jpg", altText: "Knot headband in a soft pink ditsy floral" },
      { url: "/products/headband/knot-headband-rose.jpg", altText: "Knot headband in a rose and green floral print" },
      { url: "/products/headband/knot-headband-mustard.jpg", altText: "Knot headband in a mustard and cream floral cotton" },
      { url: "/products/headband/knot-headband-multi.jpg", altText: "Knot headband in a multicoloured small-scale floral print" },
    ],
  },

  {
    slug: "liberty-print-bow-hair-clips",
    title: "Floral Bow Hair Clips",
    shortDescription:
      "A pair of small fabric bows on snap clips, cut from the same floral cottons as the headbands.",
    fullDescription: `Two small bows, each gathered at the centre with a contrast thread and mounted on a lined snap clip. Sold as a pair on a kraft card, so they arrive ready to give.

The clips are lined with a strip of grosgrain, which is the difference between a clip that grips fine hair and one that slides straight out. Small enough for a toddler's fringe, sturdy enough that adults keep borrowing them.

Cut from the same cottons as the knot headbands, so a pair can be matched to a band exactly. New prints join the range as they come in, and the regulars stay.

• Pair of bows, each approx. 6cm wide
• Floral cotton, gathered centre
• Lined snap clips for grip on fine hair
• Presented on a kraft card
• Cut and sewn in Oxford`,
    category: "LIBERTY",
    subcategory: "HAIR_ACCESSORIES",
    collection: "Meadow",
    intention: null,
    materials: "floral cotton, grosgrain-lined snap clips, cotton thread",
    price: 9.0,
    stockCount: 20,
    published: true,
    tags: [
      "bow hair clips", "floral hair clips", "liberty print", "snap clips",
      "hair accessories", "toddler hair clips", "handmade", "handmade in oxford",
    ],
    seo: {
      metaTitle: "Floral Bow Hair Clips | Handmade Pair on Snap Clips",
      metaDescription:
        "A pair of small floral cotton bows on grosgrain-lined snap clips, presented on a kraft card. Cut from small-run cottons in Oxford.",
      focusKeyword: "floral bow hair clips",
    },
    images: [
      { url: "/products/bows/liberty-bow-clips-hero.jpg", altText: "Three cards of floral bow hair clips in blue, pink and white prints" },
      { url: "/products/bows/liberty-bow-clips-trio.jpg", altText: "Three kraft cards of paired floral bow hair clips" },
      { url: "/products/bows/liberty-bow-clips-pair.jpg", altText: "Two cards of floral bow clips in turquoise and pink prints" },
      { url: "/products/bows/liberty-bow-clips-spread.jpg", altText: "Several cards of floral bow hair clips spread across a white surface" },
      { url: "/products/bows/liberty-bow-clips-range.jpg", altText: "The range of floral bow hair clip prints laid out on kraft cards" },
      { url: "/products/bows/liberty-bow-clips-card.jpg", altText: "A single kraft card holding a pair of floral bow hair clips" },
    ],
  },

  {
    slug: "lion-dance-charm",
    title: "Lion Dance Charm",
    shortDescription:
      "A hand-built lion dance head in chenille and fur, with mirrored eyes, a silk tassel and feather antennae.",
    fullDescription: `A lion dance head, small enough to hang from a bag, built the way the full-size ones are: a shaped body wrapped in chenille stem, fur trim around the face, a mirrored bead at the centre of each eye, and a pair of pheasant feathers rising from the crown.

Each one takes an evening. The curled horn is wound by hand, the eyelashes are cut and set one at a time, and the tassel underneath is silk thread trimmed flat.

Made in the traditional colourways — the orange and yellow of the young lion, red and white, and two that are entirely our own in pink and lilac. Hangs from a beaded chain with a clip.

• Approx. 8cm across the face, 20cm including feathers
• Chenille stem, faux fur, mirrored beads, silk tassel, pheasant feather
• Beaded chain with a lobster clip
• Made one at a time in Oxford
• Decorative — not a toy, and not suitable for children under three`,
    category: "FELT",
    subcategory: "ORNAMENTS",
    collection: "Lion Dance",
    intention: null,
    materials: "chenille stem, faux fur, mirrored beads, silk thread tassel, pheasant feather, beaded chain",
    price: 24.0,
    stockCount: 6,
    published: false,
    tags: [
      "lion dance", "chinese new year", "lunar new year", "bag charm",
      "handmade charm", "cny decoration", "keyring", "handmade in oxford", "gift",
    ],
    seo: {
      metaTitle: "Lion Dance Charm | Handmade Lunar New Year Bag Charm",
      metaDescription:
        "A hand-built lion dance head charm in chenille and fur with mirrored eyes, a silk tassel and feather antennae. Made one at a time in Oxford for Lunar New Year.",
      focusKeyword: "lion dance charm",
    },
    images: [
      { url: "/products/lion-dance/lion-dance-charm-lineup-hero.jpg", altText: "Four lion dance charms in lilac, orange, red and pink lined up on a wooden shelf" },
      { url: "/products/lion-dance/lion-dance-charm-orange.jpg", altText: "Orange and yellow lion dance charm held in a hand, showing the mirrored eyes" },
      { url: "/products/lion-dance/lion-dance-charm-pink.jpg", altText: "Pink lion dance charm hanging from its beaded chain with feather antennae" },
      { url: "/products/lion-dance/lion-dance-charm-purple.jpg", altText: "Lilac lion dance charm held in a hand showing the curled horn and fur trim" },
      { url: "/products/lion-dance/lion-dance-charm-white-red.jpg", altText: "Red and white lion dance charm hanging against a pale wall" },
      { url: "/products/lion-dance/lion-dance-charm-group-shelf.jpg", altText: "A group of lion dance charms arranged on a wooden shelf" },
      { url: "/products/lion-dance/lion-dance-charm-group-red.jpg", altText: "Lion dance charms photographed together on a red cloth for Lunar New Year" },
      { url: "/products/lion-dance/lion-dance-charm-styled.jpg", altText: "Orange lion dance charm styled on a shelf beside Chinese calligraphy" },
      { url: "/products/lion-dance/lion-dance-charm-held-pink.jpg", altText: "Pink lion dance charm held up in a hand against a grey curtain" },
      { url: "/products/lion-dance/lion-dance-charm-making.jpg", altText: "The maker assembling a pink lion dance charm at the studio cutting mat" },
    ],
  },
];

async function main() {
  for (const l of LISTINGS) {
    const data = {
      title: l.title,
      shortDescription: l.shortDescription,
      fullDescription: l.fullDescription,
      category: l.category,
      subcategory: l.subcategory,
      collection: l.collection,
      intention: l.intention,
      materials: l.materials,
      price: l.price,
      stockCount: l.stockCount,
      lowStockThreshold: 2,
      isPublished: l.published,
      isFeatured: false,
    };

    const product = await prisma.product.upsert({
      where: { slug: l.slug },
      update: data,
      create: { slug: l.slug, ...data },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: l.images.map((img, i) => ({
        productId: product.id,
        url: img.url,
        altText: img.altText,
        sortOrder: i,
        isPrimary: i === 0,
      })),
    });

    for (const name of l.tags) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
      await prisma.productTag.upsert({
        where: { productId_tagId: { productId: product.id, tagId: tag.id } },
        update: {},
        create: { productId: product.id, tagId: tag.id },
      });
    }

    await prisma.productSeo.upsert({
      where: { productId: product.id },
      update: { ...l.seo, ogTitle: l.title, ogDescription: l.shortDescription, ogImageUrl: l.images[0].url },
      create: {
        productId: product.id,
        ...l.seo,
        ogTitle: l.title,
        ogDescription: l.shortDescription,
        ogImageUrl: l.images[0].url,
      },
    });

    console.log(
      `${l.published ? "LIVE " : "draft"} — ${l.title} (£${l.price}, ${l.images.length} images) /product/${l.slug}`
    );
  }

  console.log(
    "\nPrices are a starting point, not a decision — correct them in /admin/products."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
