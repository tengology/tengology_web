/**
 * Product taxonomy — two levels, and only two.
 *
 * Level one (`Product.category`) is the material family: the craft a piece
 * comes out of. Level two (`Product.subcategory`) is what the piece *is*, and
 * draws on a single shared vocabulary, so "Brooches" means the same thing
 * whether it sits under Felt or under Batik.
 *
 * Everything the storefront and the admin know about a category lives here —
 * ordering, labels, copy, hero media, collection lines. Nothing outside this
 * file should hard-code a category key.
 */

export const CATEGORY_KEYS = ["GEMSTONE", "FELT", "BATIK", "LIBERTY", "GLASS"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const SUBCATEGORY_KEYS = [
  "JEWELLERY",
  "HAIR_ACCESSORIES",
  "BROOCHES",
  "ORNAMENTS",
  "BAGS",
] as const;
export type SubcategoryKey = (typeof SUBCATEGORY_KEYS)[number];

export const SUBCATEGORY_LABELS: Record<SubcategoryKey, string> = {
  JEWELLERY: "Jewellery",
  HAIR_ACCESSORIES: "Hair Accessories",
  BROOCHES: "Brooches",
  ORNAMENTS: "Ornaments",
  BAGS: "Bags & Pouches",
};

/**
 * Where a piece lands when no family fits — a one-off material, or a listing
 * drafted before it was classified. Selectable in the admin, never offered as
 * a storefront filter, so an unclassified product stays out of the shop nav
 * without being deleted.
 */
export const UNCATEGORISED = "OTHER";

/**
 * Media for the story block at the top of a category page. `aspect` is a
 * Tailwind arbitrary ratio rather than a fixed class so a portrait phone clip
 * is not cropped into a landscape frame.
 */
export type CategoryMedia =
  | { kind: "image"; src: string; alt: string; aspect: string }
  | {
      kind: "video";
      src: string;
      /** Still shown before playback, and the only frame reduced-motion sees. */
      poster: string;
      label: string;
      aspect: string;
    };

export type CategoryCollection = {
  name: string;
  tagline: string;
  detail: string;
  tags: string[];
  /**
   * Optional photograph for the head of the collection's own page. Omitted
   * where there is no shot worth showing yet — the page reads fine without
   * one, so a collection is never blocked on photography.
   */
  image?: { src: string; alt: string; aspectRatio?: string };
  /** Photographs shown under the collection's grid as decoration — earlier
   *  work, not for sale. Same shape as a family's gallery. */
  gallery?: Category["gallery"];
  /**
   * A tile that is really one of the family's types rather than a named line —
   * it opens that type's filter instead of a collection page, and is shown
   * only while the type has something published.
   */
  subcategory?: SubcategoryKey;
};

export type Category = {
  key: CategoryKey;
  label: string;
  /** One line under the label on the home page and shop cards. */
  blurb: string;
  /** Headline and body for the story block on the category page. */
  intro: { heading: string; body: string };
  /** Wide, low-opacity image behind the shop hero. */
  banner: { src: string; alt: string };
  /** Portrait crop for the home page "shop by craft" cards. */
  card: { src: string; alt: string };
  media: CategoryMedia;
  /** Which shared types this family offers, in display order. */
  subcategories: SubcategoryKey[];
  /** Gemstones are chosen by intention; felt and batik are not. */
  hasIntentions?: boolean;
  collections?: CategoryCollection[];
  /**
   * Work shown rather than sold. A family can be on the site as a body of work
   * before any of it is listed — glass is made in ones, and photographs of it
   * say more than an empty grid does. Rendered under the story block.
   */
  gallery?: {
    heading: string;
    body: string;
    items: (
      | { kind: "image"; src: string; alt: string }
      | { kind: "video"; src: string; poster: string; label: string }
    )[];
  };
};

export const CATEGORIES: Record<CategoryKey, Category> = {
  GEMSTONE: {
    key: "GEMSTONE",
    label: "Gemstone",
    blurb: "Ritual jewellery, one stone at a time",
    intro: {
      heading: "Grounded Luxury",
      body: "Tengology bridges the gap between the raw power of the earth and the refined elegance of modern life. We create ritual jewellery for the intentional wearer: pieces that don’t just look beautiful, but provide a physical point of connection to nature.",
    },
    banner: {
      src: "/products/initial/initial-letter-necklace-pink-lace-gift-box.jpg",
      alt: "A pink crystal bead necklace with a gold initial charm, boxed on lace among cream roses",
    },
    card: {
      src: "/products/comet/pearl-carnelian-cluster-earrings-hero.jpg",
      alt: "Freshwater pearl and carnelian cluster earrings on a pale background",
    },
    media: {
      kind: "image",
      src: "/products/initial/initial-letter-necklace-teal-gift-box.jpg",
      alt: "A teal crystal bead necklace with a gold initial charm, presented in a Tengology gift box",
      aspect: "4/5",
    },
    subcategories: ["JEWELLERY", "ORNAMENTS"],
    hasIntentions: true,
    collections: [
      {
        name: "Jewellery",
        subcategory: "JEWELLERY",
        tagline: "Stones strung, wired and worn",
        detail:
          "Bracelets, necklaces, earrings and rings built around a single stone or a small cluster — pearl, jade, rose quartz, carnelian and obsidian among them.",
        tags: ["Bracelets", "Necklaces", "Earrings", "Rings"],
      },
      {
        name: "Crysprout",
        image: { src: "/products/crysprout/crysprout-cover.webp", alt: "A small and a large amethyst Crysprout side by side on wood slices, with a daisy between them", aspectRatio: "2 / 1" },
        tagline: "Little clay sprouts, crowned in crystal",
        detail:
          "Round clay figures with sleepy faces, each wearing a raw crystal on its head, tufted with moss and tiny flowers. Every sprout is made around its own stone, so no two are alike.",
        tags: ["Clay", "Raw crystal", "One of a kind", "Desk companion"],
        gallery: {
          heading: "From the Sprout Patch",
          body: "Earlier sprouts, photographed among the daisies. Each one is made around its own stone, so none of these will be made again quite the same way.",
          items: [
            { kind: "image", src: "/products/crysprout/img_9322.webp", alt: "A small and a tall clear quartz Crysprout side by side on wood slices" },
            { kind: "image", src: "/products/crysprout/img_9303.webp", alt: "A Crysprout crowned with twin amethyst points and pink dried flowers" },
            { kind: "image", src: "/products/crysprout/img_9312.webp", alt: "A small Crysprout wearing a block of black tourmaline" },
            { kind: "image", src: "/products/crysprout/img_9306.webp", alt: "A Crysprout crowned with rough rose and lavender quartz" },
            { kind: "image", src: "/products/crysprout/img_9314.webp", alt: "A small Crysprout with bright orange rough stone and a red dried flower" },
            { kind: "image", src: "/products/crysprout/img_9305.webp", alt: "A Crysprout with a tall clear quartz point among daisies" },
            { kind: "image", src: "/products/crysprout/img_9315.webp", alt: "A small Crysprout with smoky quartz and lilac dried flowers" },
            { kind: "image", src: "/products/crysprout/img_9307.webp", alt: "A Crysprout crowned with a honey-gold citrine cluster" },
            { kind: "image", src: "/products/crysprout/img_9311.webp", alt: "A small Crysprout wearing deep blue lapis on a moss tuft" },
            { kind: "image", src: "/products/crysprout/img_9320.webp", alt: "A small and a large amethyst Crysprout side by side among daisies" },
            { kind: "image", src: "/products/crysprout/img_9308.webp", alt: "A Crysprout with sea-green fluorite and a red dried flower" },
            { kind: "image", src: "/products/crysprout/img_9317.webp", alt: "A small Crysprout with rough pink rose quartz" },
          ],
        },
      },
    ],
  },

  FELT: {
    key: "FELT",
    label: "Felt",
    blurb: "Hand-cut wool felt, stitched in Oxford",
    intro: {
      heading: "Cut, Shaped, Stitched",
      body: "Every petal is cut by hand from wool felt, shaped over steam, and stitched one at a time. Nothing is die-cut, nothing is rushed — which is why no two blooms in a bouquet ever sit quite the same way.",
    },
    banner: {
      src: "/lookbook/felt-flower-headbands-group.jpg",
      alt: "Several wool felt flower headbands laid out together on grey sheepskin",
    },
    card: {
      // Portrait tile: the crown sits centre frame, so the side crop is safe.
      src: "/lookbook/felt-flower-crown-held.jpg",
      alt: "A wool felt flower crown headband held up, massed with pink and cream blooms",
    },
    media: {
      kind: "image",
      src: "/lookbook/felt-flower-crown-detail.jpg",
      alt: "Close view of a wool felt flower headband, showing the shaped petals and hand-rolled centres",
      aspect: "4/3",
    },
    subcategories: ["HAIR_ACCESSORIES", "BROOCHES", "JEWELLERY", "ORNAMENTS"],
    collections: [
      {
        name: "Christmas",
        tagline: "Little handmade joys for the festive season",
        detail: "Festive headbands, antler hair clips, holly and berry accessories, and playful felt ornaments — handmade pieces for Christmas celebrations, thoughtful gifts and the tree.",
        tags: ["Christmas", "Headbands", "Hair clips", "Ornaments"],
      },
      {
        name: "Strawberry",
        image: { src: "/products/strawberries/flat-lay-top.jpg", alt: "Strawberry felt headbands, hair clips and brooches arranged together", aspectRatio: "3024 / 4032" },
        tagline: "Summer, cut from wool",
        detail:
          "Ripe berries with hand-stitched seeds, paired with cream blossom and sage leaves. The range runs from a single clip to a full crimson headband.",
        tags: ["Headbands", "Hair clips", "Scrunchies", "Brooches"],
      },
      {
        name: "Sunflower",
        image: { src: "/products/sunflower/sunflower-headband-clips-linen-v2.jpeg", alt: "Sunflower felt headband, small hair clip and brooch on ivory linen", aspectRatio: "1536 / 2048" },
        tagline: "Tall, bright, turned to the light",
        detail:
          "Golden petals layered in two rings around a textured brown centre, on a chocolate felt base. The most photographed piece in the studio.",
        tags: ["Headbands", "Hair clips", "Barrettes", "Brooches"],
      },
      {
        name: "Daisy",
        tagline: "The smallest bloom, done properly",
        detail:
          "Slim white petals around a wool pom-pom centre, scattered singly or in drifts. Deceptively fiddly — each petal is cut and set one at a time.",
        tags: ["Headbands", "Hair clips", "Pastel"],
      },
      {
        name: "Bee",
        image: { src: "/products/september-2026/img_3513.webp", alt: "Bumblebee flower accessories and headband arranged together", aspectRatio: "1400 / 1050" },
        tagline: "Stripes, wings, and a bit of mischief",
        detail:
          "Hand-stitched bees in black and gold with soft organza wings, made to sit among the blooms in the rest of the range.",
        tags: ["Hair clips", "Brooches", "Gold thread"],
      },
      {
        name: "Poppy",
        image: { src: "/products/festive/poppy-set-group.jpg", alt: "Red felt poppy headband, brooch and hair clip on wooden trays", aspectRatio: "4032 / 3024" },
        tagline: "For remembrance",
        detail:
          "Red wool felt petals layered over a black fringed centre, finished with a green seed head worked in gold thread. Quiet pieces for Remembrance Sunday.",
        tags: ["Headbands", "Hair clips", "Brooches", "Remembrance"],
      },
      {
        name: "Rose",
        tagline: "Petal over petal, rolled by hand",
        detail:
          "Each rose is a single long strip of felt, coiled and stitched as it turns, so no two open the same way.",
        tags: ["Headbands", "Brooches", "Blush"],
      },
      {
        name: "Sakura",
        tagline: "Five petals, blush to white",
        detail:
          "Cherry blossom with notched petals and gold-thread stamens, worked in the palest pinks — a fortnight of spring, kept.",
        tags: ["Hair clips", "Brooches", "Blush"],
      },
      {
        name: "Reindeer Ears",
        image: { src: "/products/original-product-photos/antler-headbands-approved.webp", alt: "Red and blush felt antler headbands", aspectRatio: "1350 / 1800" },
        tagline: "For the Christmas photograph",
        detail:
          "Brown felt antlers and ears on a red band, dressed with roses, holly berries, and pom-pom snowballs. Built for nativities and office parties.",
        tags: ["Headbands", "Christmas", "Statement"],
      },
      {
        name: "Deer Ears",
        image: { src: "/products/original-product-photos/antler-headbands-approved.webp", alt: "Blush and red felt antler headbands", aspectRatio: "1350 / 1800" },
        tagline: "Antlers, softened in wool",
        detail:
          "The same antler silhouette without the tinsel — bare or wreathed in blush roses and sage leaves, for wearing well past December.",
        tags: ["Headbands", "Woodland", "Statement"],
      },
      {
        name: "Easter Rabbit Ears",
        image: { src: "/products/spring-bouquet/bunny-ear-group.jpg", alt: "Floral felt rabbit ear accessories on a wooden tray", aspectRatio: "3024 / 4032" },
        tagline: "Ears up, blooms on",
        detail:
          "Long felt ears lined in blush, set into a cluster of spring flowers. Made as a headband and a clip so it suits any hair.",
        tags: ["Headbands", "Hair clips", "Easter"],
      },
      {
        name: "Flower Headband",
        image: { src: "/lookbook/felt-flower-headbands-group.jpg", alt: "Colourful felt flower headbands arranged together", aspectRatio: "2400 / 1800" },
        tagline: "A whole bouquet, worn",
        detail:
          "Mixed-bloom headbands that aren't any one flower — hydrangea, anemone, dahlia, and full spring bouquets, built on satin-wrapped bands.",
        tags: ["Headbands", "Mixed blooms", "Statement"],
      },
      {
        name: "Flower Hairclip",
        image: { src: "/products/cottage-garden/hydrangea-clip-group.jpg", alt: "Pink felt flower hair accessories on a wooden tray", aspectRatio: "3024 / 4032" },
        tagline: "One bloom, clipped in",
        detail:
          "Clips, claw clips, barrettes, and scrunchies carrying mixed florals — the pieces to reach for when a headband is too much.",
        tags: ["Hair clips", "Claw clips", "Barrettes", "Scrunchies"],
      },
      {
        name: "Flower Brooch",
        image: { src: "/products/cottage-garden/hydrangea-brooch-group.jpg", alt: "Pink felt flower brooches arranged on a wooden tray", aspectRatio: "3024 / 4032" },
        tagline: "A garden on the lapel",
        detail:
          "Mixed-bloom brooches backed with a pin, sized to move between a coat, a blazer, and the strap of a bag.",
        tags: ["Brooches", "Mixed blooms", "Lapel"],
      },
      {
        name: "Forget-me-not",
        image: { src: "/products/cottage-garden/forget-me-not-barrette-group.jpg", alt: "Blue forget-me-not felt accessories arranged together", aspectRatio: "3024 / 4032" },
        tagline: "The quietest blue there is",
        detail:
          "Tiny five-petal blooms in cornflower blue with yellow centres, massed in clusters because one is never enough.",
        tags: ["Hair clips", "Barrettes", "Brooches", "Blue"],
      },
      {
        name: "Daffodil",
        image: { src: "/products/cottage-garden/daffodil-clip-group.jpg", alt: "Yellow and cream felt daffodil clips on display cards", aspectRatio: "3024 / 4032" },
        tagline: "The first yellow of the year",
        detail:
          "Trumpet centres set into six-petal stars, in golden yellow and pale cream. The piece that opens the spring range.",
        tags: ["Hair clips", "Brooches", "Lapel pins", "Spring"],
      },
      {
        name: "Unicorn",
        image: { src: "/products/unicorn/unicorn-crown-pair-hero.jpg", alt: "Two felt unicorn flower crown headbands", aspectRatio: "1200 / 1200" },
        tagline: "Horn, ears, and a crown of blooms",
        detail:
          "A coiled cream horn between glitter-lined ears, wreathed in a full flower crown. Made in silver and in gold.",
        tags: ["Headbands", "Glitter felt", "Party", "Statement"],
      },
      {
        name: "Ornaments",
        tagline: "Felt food, hung on the tree",
        detail:
          "The odd little ones — brussel sprout, Christmas pudding, egg, salmon, tuna and prawn sushi, ice cream, and meatball spaghetti.",
        tags: ["Christmas", "Sushi", "Novelty", "Hanging"],
        image: {
          src: "/products/ornaments/nigiri-spread.jpg",
          alt: "A spread of handmade felt nigiri ornaments in tuna, salmon, egg and prawn",
        },
      },
      {
        name: "Berry",
        image: { src: "/products/september-2026/img_2979.webp", alt: "Golden berry felt bow accessory with autumn leaves", aspectRatio: "1400 / 1050" },
        tagline: "Hand-rolled, clustered on the branch",
        detail:
          "Beads of felt rolled between the palms until they hold, then wired into clusters with leaves — festive reds through to autumn russets.",
        tags: ["Headbands", "Brooches", "Christmas", "Autumn"],
      },
      {
        name: "Pumpkin",
        image: { src: "/products/september-2026/img_9051.webp", alt: "Colourful pumpkin felt brooches arranged on cards", aspectRatio: "1400 / 1050" },
        tagline: "Autumn, in wool",
        detail:
          "Ribbed felt pumpkins with curled stems, nestled among cream blooms and turning leaves.",
        tags: ["Headbands", "Autumn", "Halloween"],
      },
    ],
  },

  BATIK: {
    key: "BATIK",
    label: "Batik",
    blurb: "Indonesian cloth, cut into something wearable",
    intro: {
      heading: "Batik & Belonging",
      body: "The cloth arrives already a work of art — hand-stamped or hand-drawn by Indonesian artisans. Each flower is cut from it by hand, edged with tiny gold seed beads, and backed onto wool felt. A small fragment of Sabah, reimagined into something you can pin to a lapel.",
    },
    banner: {
      src: "/lookbook/batik-flower-brooches-earrings.jpg",
      alt: "Batik flower brooches and earrings laid out on the workbench",
    },
    card: {
      src: "/lookbook/batik-flower-brooches-earrings.jpg",
      alt: "Batik flower brooches and earrings, petals edged with tiny gold beads on wool felt",
    },
    media: {
      kind: "video",
      src: "/lookbook/batik-making.mp4",
      poster: "/lookbook/batik-flower-brooches-earrings.jpg",
      label:
        "Cutting a beaded flower from Indonesian batik fabric, stitching it onto wool felt, and the finished brooches and earrings",
      aspect: "9/16",
    },
    subcategories: ["BROOCHES", "JEWELLERY"],
  },

  LIBERTY: {
    key: "LIBERTY",
    label: "Liberty",
    blurb: "Small-run floral cotton, cut and sewn",
    intro: {
      heading: "One Print, Three Ways",
      body: "The same cottons run through all three pieces — a padded knot headband, a pair of bow clips, and a cat-ear pouch — so a whole set can be matched in one print. The fabric itself is reordered when it runs low, so a print you like is not a one-off. What changes is where it falls: a metre carries a small-scale floral over and over, and every piece is cut from a different part of that repeat, so yours will not land on exactly the same flowers as the one photographed. Cut, sewn and finished by hand in Oxford.",
    },
    banner: {
      src: "/lookbook/liberty-fabric-scraps.jpg",
      alt: "A pile of Liberty-style floral and gingham cotton offcuts on the studio table",
    },
    card: {
      src: "/products/headband/knot-headband-blue-meadow-hero.jpg",
      alt: "A floral knot headband in pale blue meadow print held against a white wall",
    },
    media: {
      kind: "image",
      src: "/products/bows/liberty-bow-clips-spread.jpg",
      alt: "Cards of paired floral bow hair clips spread across a white surface, showing the range of prints",
      aspect: "4/3",
    },
    subcategories: ["HAIR_ACCESSORIES", "BAGS"],
    collections: [
      {
        name: "Meadow",
        tagline: "The print range, worn in the hair",
        detail:
          "Padded knot headbands and paired bow clips cut from the same small-scale florals — meadow blues, strawberries, lilac ditsy, mustard and deep berry. Take the band and the clips in one print and they match exactly.",
        tags: ["Knot headbands", "Bow clips", "Small-scale florals", "Hair Accessories"],
        image: {
          src: "/products/headband/knot-headband-strawberry.jpg",
          alt: "A floral knot headband in a red strawberry print on white cotton",
        },
      },
      {
        name: "Everyday Carry",
        tagline: "Lined, corded, clipped to your bag",
        detail:
          "Drawstring pouches with pointed cat ears and a contrast lining you only see when you open them. A swivel clip keeps them on a tote handle instead of at the bottom of the bag.",
        tags: ["Pouches", "Contrast lining", "Swivel clip", "Bags & Pouches"],
        image: {
          src: "/products/pouch/cat-ear-pouch-on-tote-meadow.jpg",
          alt: "A meadow floral cat-ear pouch clipped to the strap of a tan canvas tote bag",
        },
      },
    ],
  },

  GLASS: {
    key: "GLASS",
    label: "Stained Glass",
    blurb: "Cut, foiled, soldered — a panel at a time",
    intro: {
      heading: "Scored and Broken",
      body: "A sheet of art glass is scored once, broken along the score, and ground back by hand until two halves match. The edges are wrapped in copper foil and soldered, which is where the bright, slightly uneven silver line comes from. It is the slowest thing made here, and the only one where the material decides the outcome as much as the maker does.",
    },
    banner: {
      src: "/products/stained-glass/glass-triangle-earrings-stand.jpg",
      alt: "Stained glass triangle earrings hanging from a clear acrylic display arch",
    },
    card: {
      src: "/products/stained-glass/glass-chevron-pendant-hero.jpg",
      alt: "A stained glass chevron pendant in clear and smoky glass on an adjustable brown cord",
    },
    media: {
      kind: "video",
      src: "/lookbook/stained-glass-pendant.mp4",
      poster: "/lookbook/stained-glass-pendant-poster.jpg",
      label:
        "A soldered stained glass chevron pendant turning on its cord, catching the light through clear and smoky glass",
      aspect: "9/16",
    },
    subcategories: ["JEWELLERY"],
    gallery: {
      heading: "The Glass So Far",
      body: "Nothing here is listed yet. Each piece is cut and soldered on its own, so these are photographs of what has come off the bench rather than a catalogue. If something catches your eye, ask — it can be made again, though the glass will vary a little from the one photographed.",
      items: [
        {
          kind: "video",
          src: "/lookbook/stained-glass-earrings.mp4",
          poster: "/lookbook/stained-glass-earrings-poster.jpg",
          label: "Soldered triangle drop earrings turning slowly on a display stand",
        },
        { kind: "image", src: "/products/stained-glass/glass-triangle-earrings-hero.jpg", alt: "Triangular stained glass drop earrings in smoky iridised glass" },
        { kind: "image", src: "/products/stained-glass/glass-kite-earrings-rose.jpg", alt: "Kite-shaped stained glass earrings in rose and clear textured glass" },
        { kind: "image", src: "/products/stained-glass/glass-chevron-pendant-hero.jpg", alt: "A stained glass chevron pendant on an adjustable brown cord" },
        { kind: "image", src: "/products/stained-glass/glass-rectangle-earrings.jpg", alt: "Long rectangular stained glass drop earrings in clear textured glass" },
        { kind: "image", src: "/products/stained-glass/glass-triangle-earrings-flat.jpg", alt: "A pair of stained glass triangle earrings laid flat on a pale surface" },
        { kind: "image", src: "/products/stained-glass/glass-trapezoid-earrings.jpg", alt: "Trapezoid stained glass drop earrings hanging from a clear acrylic arch" },
        { kind: "image", src: "/products/stained-glass/glass-chevron-pendant-detail.jpg", alt: "Close view of the soldered join between the clear and smoky glass panels" },
        { kind: "image", src: "/products/stained-glass/glass-angular-earrings.jpg", alt: "Angular stained glass earrings with a bright hand-run solder line" },
        { kind: "image", src: "/products/stained-glass/glass-kite-earrings-rose-pair.jpg", alt: "A pair of rose-toned stained glass kite earrings on a clear stand" },
        { kind: "image", src: "/products/stained-glass/glass-rectangle-earrings-detail.jpg", alt: "Detail of the soldered frame on rectangular stained glass earrings" },
        { kind: "image", src: "/products/stained-glass/glass-chevron-pendant-cord.jpg", alt: "The waxed cord of the chevron pendant coiled to show its sliding knots" },
      ],
    },
  },
};

/** Families in nav order. */
export const CATEGORY_LIST: Category[] = CATEGORY_KEYS.map((key) => CATEGORIES[key]);

export const INTENTIONS = [
  "Connection",
  "Focus",
  "Protection",
  "Clarity",
  "Stillness",
  "Energy",
  "Shielding",
  "Uniqueness",
  "Softness",
  "Optimism",
  "Alignment",
] as const;

/**
 * Who a piece is for.
 *
 * A third axis, deliberately kept off the two-level taxonomy above: it is not
 * a material and not a type, it is who you are buying for. It composes with
 * both, so "Crystal Jewellery For Him" is a view rather than a bucket someone
 * has to maintain by hand.
 *
 * Only jewellery carries it today — that is where the gift split earns its
 * keep. A piece with no audience is not "unisex", it is unclassified, and
 * simply does not appear under either filter.
 */
export const AUDIENCE_KEYS = ["HER", "HIM"] as const;
export type AudienceKey = (typeof AUDIENCE_KEYS)[number];

export const AUDIENCE_LABELS: Record<AudienceKey, string> = {
  HER: "For Her",
  HIM: "For Him",
};

/** Shown above an audience-filtered grid, so the view explains itself. */
export const AUDIENCE_BLURBS: Record<AudienceKey, string> = {
  HER: "Softer stones and finer settings — pearl, rose quartz, fluorite and the pieces made for a wedding party.",
  HIM: "Darker stones and heavier beads — obsidian, tiger's eye and hematoid, cut plain and strung without fuss.",
};

export function isAudienceKey(
  value: string | undefined | null
): value is AudienceKey {
  return !!value && (AUDIENCE_KEYS as readonly string[]).includes(value);
}

export function audienceLabel(value: string | undefined | null): string | null {
  return isAudienceKey(value) ? AUDIENCE_LABELS[value] : null;
}

/**
 * Keys this family used to answer to. The crystal range was renamed when jade
 * and other stones joined it — jade is not a crystal, and the label had started
 * to describe the shelf inaccurately. Old bookmarks, shared links and anything
 * already indexed still resolve here rather than falling back to the whole
 * catalogue.
 */
const LEGACY_CATEGORY_KEYS: Record<string, CategoryKey> = {
  CRYSTAL: "GEMSTONE",
};

export function isCategoryKey(value: string | undefined | null): value is CategoryKey {
  return !!value && (CATEGORY_KEYS as readonly string[]).includes(value);
}

export function isSubcategoryKey(
  value: string | undefined | null
): value is SubcategoryKey {
  return !!value && (SUBCATEGORY_KEYS as readonly string[]).includes(value);
}

/** The family a key names, or null — use this rather than indexing CATEGORIES
 *  with an unvalidated search param. */
export function getCategory(value: string | undefined | null): Category | null {
  if (isCategoryKey(value)) return CATEGORIES[value];
  const renamed = value ? LEGACY_CATEGORY_KEYS[value] : undefined;
  return renamed ? CATEGORIES[renamed] : null;
}

export function categoryLabel(value: string | undefined | null): string | null {
  return getCategory(value)?.label ?? null;
}

export function subcategoryLabel(value: string | undefined | null, category?: string | null): string | null {
  if (getCategory(category)?.key === "GEMSTONE" && value === "ORNAMENTS") return "Crysprout";
  return isSubcategoryKey(value) ? SUBCATEGORY_LABELS[value] : null;
}

/**
 * The full name of a bucket, e.g. "Batik Brooches". Falls back to whichever
 * half is known so a stale bookmark still renders a sensible heading.
 */
export function bucketLabel(
  category: string | undefined | null,
  subcategory: string | undefined | null
): string | null {
  const cat = categoryLabel(category);
  const sub = subcategoryLabel(subcategory, category);
  if (cat && sub) return `${cat} ${sub}`;
  return cat ?? sub;
}
