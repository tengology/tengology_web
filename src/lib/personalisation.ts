/**
 * Made-to-order options on catalogue products.
 *
 * A product opts in by carrying a tag rather than by its slug, so the studio
 * can add a second letter pendant — a bracelet, a longer chain — from the admin
 * without anyone touching the product page.
 */

/** Products tagged with this offer an A–Z initial choice before add-to-bag. */
export const INITIAL_LETTER_TAG = "initial-letter";

/** Whether a product's tag list opts it into the initial picker. */
export function hasInitialLetterOption(
  tags: { tag: { slug: string } }[]
): boolean {
  return tags.some((t) => t.tag.slug === INITIAL_LETTER_TAG);
}

/**
 * Tags that switch a feature on rather than describe the piece. They are real
 * tags so the admin can set them, but a shopper has no use for "#initial-letter"
 * sitting among "#bridesmaid gift", so the product page filters them out.
 */
const FUNCTIONAL_TAGS = new Set<string>([INITIAL_LETTER_TAG]);

export function isFunctionalTag(slug: string): boolean {
  return FUNCTIONAL_TAGS.has(slug);
}

/**
 * The strand an initial charm hangs from.
 *
 * Shoppers call this "the chain" even though it is a hand-strung bead strand,
 * so the picker uses their word. Each entry names a real colourway the studio
 * stocks and points at the photo of it, so the swatch and the listing can never
 * drift apart.
 */
export interface ChainOption {
  id: string;
  name: string;
  /** Approximates the strand in a swatch, for when the photo has not loaded. */
  hex: string;
  /** The listing photo showing this strand. */
  image: string;
}

export const INITIAL_LETTER_CHAINS: ChainOption[] = [
  {
    id: "pearl-white",
    name: "Pearl White",
    hex: "#EFE9E1",
    image: "/products/initial/initial-letter-necklace-hero.jpg",
  },
  {
    id: "rose-pink",
    name: "Rose Pink",
    hex: "#D9A6AA",
    image: "/products/initial/initial-letter-necklace-rose-pink.jpg",
  },
  {
    id: "burgundy-garnet",
    name: "Burgundy Garnet",
    hex: "#7B1E2B",
    image: "/products/initial/initial-letter-necklace-burgundy-garnet.jpg",
  },
  {
    id: "lilac-amethyst",
    name: "Lilac Amethyst",
    hex: "#B49AC8",
    image: "/products/initial/initial-letter-necklace-lilac-amethyst.jpg",
  },
  {
    id: "cornflower-blue",
    name: "Cornflower Blue",
    hex: "#8FB0D4",
    image: "/products/initial/initial-letter-necklace-flower-girl-blue.jpg",
  },
  {
    id: "navy",
    name: "Navy",
    hex: "#2B3A5C",
    image: "/products/initial/initial-letter-necklace-navy-mother-daughter.jpg",
  },
  {
    id: "teal",
    name: "Teal",
    hex: "#2E7D82",
    image: "/products/initial/initial-letter-necklace-teal-gift-box.jpg",
  },
];

/**
 * How a personalised line reads in the bag, on the packing slip, and in the
 * confirmation email. Kept in one place so those three can never disagree.
 * The order side stores personalisation as a plain string capped at 40
 * characters, which this comfortably fits.
 */
export function describePersonalisation(letter: string, chainName: string): string {
  return `${letter} · ${chainName}`;
}
