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

export const CATEGORY_KEYS = ["CRYSTAL", "FELT", "BATIK"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const SUBCATEGORY_KEYS = [
  "JEWELLERY",
  "HAIR_ACCESSORIES",
  "BROOCHES",
  "ORNAMENTS",
] as const;
export type SubcategoryKey = (typeof SUBCATEGORY_KEYS)[number];

export const SUBCATEGORY_LABELS: Record<SubcategoryKey, string> = {
  JEWELLERY: "Jewellery",
  HAIR_ACCESSORIES: "Hair Accessories",
  BROOCHES: "Brooches",
  ORNAMENTS: "Ornaments",
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
  image?: { src: string; alt: string };
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
  /** Crystals are chosen by intention; felt and batik are not. */
  hasIntentions?: boolean;
  collections?: CategoryCollection[];
};

export const CATEGORIES: Record<CategoryKey, Category> = {
  CRYSTAL: {
    key: "CRYSTAL",
    label: "Crystal",
    blurb: "Ritual jewellery, one stone at a time",
    intro: {
      heading: "Grounded Luxury",
      body: "Tengology bridges the gap between the raw power of the earth and the refined elegance of modern life. We create ritual jewellery for the intentional wearer: pieces that don’t just look beautiful, but provide a physical point of connection to nature.",
    },
    banner: {
      src: "/Gemini_Generated_Image_ukw8ilukw8ilukw8.png",
      alt: "An amethyst and rose quartz bracelet and matching drop earrings laid on linen beside a raw amethyst cluster",
    },
    card: {
      src: "/Gemini_Generated_Image_ukw8ilukw8ilukw8.png",
      alt: "An amethyst and rose quartz bracelet laid on linen beside a raw amethyst cluster",
    },
    media: {
      kind: "image",
      src: "/Gemini_Generated_Image_6rl2h86rl2h86rl2.png",
      alt: "Amethyst geode with deep purple crystal formations and scattered crystal beads on linen",
      aspect: "4/5",
    },
    subcategories: ["JEWELLERY"],
    hasIntentions: true,
    collections: [
      {
        name: "Moon and Sun",
        tagline: "Layer your intention",
        detail:
          "Delicate 4mm crystal beads paired with Argentium Silver and Gold-filled accents. Designed for stacking — wear one for a whisper, or three for a statement. Also available as a Micro Crystal Necklace.",
        tags: ["4mm crystals", "Argentium Silver", "Gold-filled", "Stackable", "Bracelets", "Necklaces"],
      },
      {
        name: "The Horizon",
        tagline: "The foundation of every look",
        detail:
          "A refined Gold-filled chain with a 10mm polished disc pendant — understated enough to wear daily, elegant enough to anchor any stack.",
        tags: ["Gold-filled chain", "10mm disc pendant", "Necklaces"],
      },
      {
        name: "Orbit",
        tagline: "Your foundation, your way",
        detail:
          "7–8mm crystal bases in Black Obsidian, Clear Quartz, Lychee Jelly Agate, or Hematoid Clear Quartz, accented with Gold-filled and Argentium beads. Add a charm to make it yours.",
        tags: ["7–8mm crystals", "Customisable charms", "Argentium Silver", "Gold-filled", "Bracelets"],
      },
      {
        name: "Meridian",
        tagline: "Find your centre",
        detail:
          "10mm crystal bracelets anchored by a striking 12–13mm focal crystal, flanked by Sterling Silver and Gold-filled spacer discs. A piece that draws the eye inward.",
        tags: ["10mm crystals", "Focal crystal", "Sterling Silver", "Gold-filled", "Bracelets"],
      },
      {
        name: "Satellite",
        tagline: "The finishing touch",
        detail:
          "4mm bead studs with a 7–8mm crystal drop attached by hand-wrapped wire. Available in Argentium Silver and Gold-filled to match your stack.",
        tags: ["4mm stud", "7–8mm drop", "Wire wrap", "Argentium Silver", "Gold-filled", "Earrings"],
      },
      {
        name: "Titan",
        tagline: "Pure crystal, nothing else",
        detail:
          "Statement pieces featuring rare 13–16mm crystals with no metal parts. Each bead is chosen for its natural beauty — the crystal is the entire design.",
        tags: ["13–16mm crystals", "No metal", "Rare stones", "Bracelets"],
      },
      {
        name: "Planets",
        tagline: "Worlds on your wrist",
        detail:
          "Spherical crystal charms in two sizes — 12mm Planet and 7–8mm Mini Planet. Clip onto your Orbit base to build your own constellation.",
        tags: ["12mm charms", "7–8mm mini charms", "For Orbit base"],
      },
      {
        name: "Asteroid",
        tagline: "Beautifully irregular",
        detail:
          "One-of-a-kind charms crafted from raw, irregular-shaped crystals. No two are alike — nature’s own design, ready to clip onto your Orbit.",
        tags: ["Irregular crystals", "Raw shapes", "For Orbit base"],
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
      src: "/lookbook/felt-flower-headbands-garden.jpg",
      alt: "Two girls lying in the grass wearing handmade wool felt flower headbands",
    },
    card: {
      src: "/lookbook/felt-flower-headband-portrait.jpg",
      alt: "A wool felt flower headband worn in soft daylight",
    },
    media: {
      kind: "image",
      // Cut circles, stuffing, thread and finished pumpkins in one frame —
      // the story block says "Cut, Shaped, Stitched", and this shows all three.
      src: "/lookbook/felt-pumpkins-in-progress.jpg",
      alt: "A basket of handmade wool felt pumpkins beside cut felt circles, stuffing, thread and scissors on a cutting mat",
      aspect: "4/3",
    },
    subcategories: ["HAIR_ACCESSORIES", "BROOCHES", "JEWELLERY", "ORNAMENTS"],
    collections: [
      {
        name: "Strawberry",
        tagline: "Summer, cut from wool",
        detail:
          "Ripe berries with hand-stitched seeds, paired with cream blossom and sage leaves. The range runs from a single clip to a full crimson headband.",
        tags: ["Headbands", "Hair clips", "Scrunchies", "Brooches"],
      },
      {
        name: "Sunflower",
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
        tagline: "Stripes, wings, and a bit of mischief",
        detail:
          "Hand-stitched bees in black and gold with soft organza wings, made to sit among the blooms in the rest of the range.",
        tags: ["Hair clips", "Brooches", "Gold thread"],
      },
      {
        name: "Poppy",
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
        tagline: "For the Christmas photograph",
        detail:
          "Brown felt antlers and ears on a red band, dressed with roses, holly berries, and pom-pom snowballs. Built for nativities and office parties.",
        tags: ["Headbands", "Christmas", "Statement"],
      },
      {
        name: "Deer Ears",
        tagline: "Antlers, softened in wool",
        detail:
          "The same antler silhouette without the tinsel — bare or wreathed in blush roses and sage leaves, for wearing well past December.",
        tags: ["Headbands", "Woodland", "Statement"],
      },
      {
        name: "Easter Rabbit Ears",
        tagline: "Ears up, blooms on",
        detail:
          "Long felt ears lined in blush, set into a cluster of spring flowers. Made as a headband and a clip so it suits any hair.",
        tags: ["Headbands", "Hair clips", "Easter"],
      },
      {
        name: "Flower Headband",
        tagline: "A whole bouquet, worn",
        detail:
          "Mixed-bloom headbands that aren't any one flower — hydrangea, anemone, dahlia, and full spring bouquets, built on satin-wrapped bands.",
        tags: ["Headbands", "Mixed blooms", "Statement"],
      },
      {
        name: "Flower Hairclip",
        tagline: "One bloom, clipped in",
        detail:
          "Clips, claw clips, barrettes, and scrunchies carrying mixed florals — the pieces to reach for when a headband is too much.",
        tags: ["Hair clips", "Claw clips", "Barrettes", "Scrunchies"],
      },
      {
        name: "Flower Brooch",
        tagline: "A garden on the lapel",
        detail:
          "Mixed-bloom brooches backed with a pin, sized to move between a coat, a blazer, and the strap of a bag.",
        tags: ["Brooches", "Mixed blooms", "Lapel"],
      },
      {
        name: "Forget-me-not",
        tagline: "The quietest blue there is",
        detail:
          "Tiny five-petal blooms in cornflower blue with yellow centres, massed in clusters because one is never enough.",
        tags: ["Hair clips", "Barrettes", "Brooches", "Blue"],
      },
      {
        name: "Daffodil",
        tagline: "The first yellow of the year",
        detail:
          "Trumpet centres set into six-petal stars, in golden yellow and pale cream. The piece that opens the spring range.",
        tags: ["Hair clips", "Brooches", "Lapel pins", "Spring"],
      },
      {
        name: "Unicorn",
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
        tagline: "Hand-rolled, clustered on the branch",
        detail:
          "Beads of felt rolled between the palms until they hold, then wired into clusters with leaves — festive reds through to autumn russets.",
        tags: ["Headbands", "Brooches", "Christmas", "Autumn"],
      },
      {
        name: "Pumpkin",
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
  return isCategoryKey(value) ? CATEGORIES[value] : null;
}

export function categoryLabel(value: string | undefined | null): string | null {
  return getCategory(value)?.label ?? null;
}

export function subcategoryLabel(value: string | undefined | null): string | null {
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
  const sub = subcategoryLabel(subcategory);
  if (cat && sub) return `${cat} ${sub}`;
  return cat ?? sub;
}
