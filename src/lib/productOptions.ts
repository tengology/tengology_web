/**
 * A single made-to-order choice on a catalogue product.
 *
 * Where several near-identical pieces were once separate listings — four
 * nigiri, a gold unicorn crown and a silver one — they are now one listing
 * with a choice. The shopper picks, and the pick rides the bag line through to
 * the packing slip, so the studio still knows exactly which one to send.
 *
 * This is the simple case. The birthstone choker needs two linked choices and
 * a gallery that reacts to them, so it keeps its own picker; see
 * `InitialLetterPicker` and lib/birthstones.
 */

export interface ProductChoice {
  /** Shown on the bag line, e.g. "Type" or "Finish". */
  label: string;
  /** Sentence fragment under the heading, e.g. "Four to choose from". */
  hint?: string;
  options: {
    value: string;
    /** Photograph of that option, used as the tile. */
    image: string;
    /** One short line under the name, where the difference needs saying. */
    note?: string;
  }[];
}

/** Keyed by product slug. A slug absent here simply has no choice to make. */
export const PRODUCT_CHOICES: Record<string, ProductChoice> = {
  "nigiri-felt-ornament": {
    label: "Topping",
    hint: "Four to choose from — or collect the set.",
    options: [
      { value: "Salmon", image: "/products/ornaments/nigiri-salmon-hero.jpg" },
      { value: "Tuna", image: "/products/ornaments/nigiri-tuna-hero.jpg" },
      { value: "Tamago", image: "/products/ornaments/nigiri-egg-hero.jpg", note: "Sweet egg" },
      { value: "Prawn", image: "/products/ornaments/nigiri-prawn-hero.jpg" },
    ],
  },
  "unicorn-flower-crown-headband": {
    label: "Horn",
    hint: "The flowers are the same; the horn and ear linings differ.",
    options: [
      { value: "Gold", image: "/products/unicorn/unicorn-crown-gold-hero.jpg" },
      { value: "Silver", image: "/products/unicorn/unicorn-crown-silver-hero.jpg" },
    ],
  },
};

export function productChoiceFor(slug: string): ProductChoice | null {
  return PRODUCT_CHOICES[slug] ?? null;
}
