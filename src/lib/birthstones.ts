/**
 * The twelve birthstone chokers.
 *
 * A necklace is two choices: the strand (a month's stone) and the initial that
 * hangs from it. This is the strand half — the months, the stone each one is
 * strung from, and the pair of words the studio photographs it with.
 *
 * Stones are the studio's own list, not the traditional birthstone table:
 * April is clear quartz rather than diamond, May amazonite rather than emerald,
 * October rainbow tourmaline. Do not "correct" them against a jeweller's chart.
 */

export interface Birthstone {
  /** 1–12. Also the sort order and the image prefix. */
  month: number;
  monthName: string;
  /** The stone as the studio names it on the product card. */
  stone: string;
  /** The two words photographed with it, e.g. "Wisdom & Truth". */
  meaning: string;
  /** Photograph of that strand, from the birthstone set. */
  image: string;
  /** Rough bead colour, shown behind the photo while it loads. */
  swatch: string;
  /**
   * A photograph of this strand wearing one particular initial, where the
   * studio has shot one. January has no such photo yet, so that month simply
   * keeps showing the strand on its own.
   */
  finished?: { letter: string; image: string };
}

export const BIRTHSTONES: Birthstone[] = [
  { month: 1,  monthName: "January",   stone: "Garnet",             meaning: "Passion & Protection", image: "/products/initial/birthstones/01-january-garnet.jpg",              swatch: "#7d2233" },
  { month: 2,  monthName: "February",  stone: "Amethyst",           meaning: "Calm & Clarity",       image: "/products/initial/birthstones/02-february-amethyst.jpg",           swatch: "#8b6bb1" , finished: { letter: "F", image: "/products/initial/finished/02-february-amethyst-f.jpg" } },
  { month: 3,  monthName: "March",     stone: "Aquamarine",         meaning: "Serenity & Courage",   image: "/products/initial/birthstones/03-march-aquamarine.jpg",            swatch: "#8fc0d8" , finished: { letter: "K", image: "/products/initial/finished/03-march-aquamarine-k.jpg" } },
  { month: 4,  monthName: "April",     stone: "Clear Quartz",       meaning: "Purity & Focus",       image: "/products/initial/birthstones/04-april-clear-quartz.jpg",          swatch: "#e2e2e0" , finished: { letter: "A", image: "/products/initial/finished/04-april-clear-quartz-a.jpg" } },
  { month: 5,  monthName: "May",       stone: "Amazonite",          meaning: "Hope & Harmony",       image: "/products/initial/birthstones/05-may-amazonite.jpg",               swatch: "#5fc9c9" , finished: { letter: "M", image: "/products/initial/finished/05-may-amazonite-m.jpg" } },
  { month: 6,  monthName: "June",      stone: "Moonstone",          meaning: "Intuition & Balance",  image: "/products/initial/birthstones/06-june-moonstone.jpg",              swatch: "#eae7e1" , finished: { letter: "E", image: "/products/initial/finished/06-june-moonstone-e.jpg" } },
  { month: 7,  monthName: "July",      stone: "Ruby",               meaning: "Confidence & Love",    image: "/products/initial/birthstones/07-july-ruby.jpg",                   swatch: "#b52a63" , finished: { letter: "R", image: "/products/initial/finished/07-july-ruby-r.jpg" } },
  { month: 8,  monthName: "August",    stone: "Peridot",            meaning: "Joy & Good Vibes",     image: "/products/initial/birthstones/08-august-peridot.jpg",              swatch: "#b3cf7a" , finished: { letter: "B", image: "/products/initial/finished/08-august-peridot-b.jpg" } },
  { month: 9,  monthName: "September", stone: "Lapis Lazuli",       meaning: "Wisdom & Truth",       image: "/products/initial/birthstones/09-september-lapis-lazuli.jpg",      swatch: "#28417e" , finished: { letter: "S", image: "/products/initial/finished/09-september-lapis-lazuli-s.jpg" } },
  { month: 10, monthName: "October",   stone: "Rainbow Tourmaline", meaning: "Creativity & Balance", image: "/products/initial/birthstones/10-october-rainbow-tourmaline.jpg",  swatch: "#c98fa6" , finished: { letter: "O", image: "/products/initial/finished/10-october-rainbow-tourmaline-o.jpg" } },
  { month: 11, monthName: "November",  stone: "Citrine",            meaning: "Warmth & Abundance",   image: "/products/initial/birthstones/11-november-citrine.jpg",            swatch: "#e0bf7a" , finished: { letter: "N", image: "/products/initial/finished/11-november-citrine-n.jpg" } },
  { month: 12, monthName: "December",  stone: "Turquoise",          meaning: "Friendship & Peace",   image: "/products/initial/birthstones/12-december-turquoise.jpg",          swatch: "#3fb8bd" , finished: { letter: "D", image: "/products/initial/finished/12-december-turquoise-d.jpg" } },
];

/**
 * The best photograph for a chosen strand, and initial where one is chosen:
 * the finished piece when we have shot that exact pairing, otherwise the
 * strand on its own.
 */
export function birthstoneImageFor(b: Birthstone, letter: string | null): string {
  if (letter && b.finished?.letter === letter) return b.finished.image;
  return b.image;
}

/** How a chosen strand is written on the bag line and the packing slip. */
export function birthstoneLabel(b: Birthstone): string {
  return `${b.monthName} · ${b.stone}`;
}

/**
 * Which month a product photograph belongs to, or null for a shot that is not
 * about one particular stone.
 *
 * The birthstone, finished and pairing sets are all filed under a numbered
 * prefix, so those answer for themselves. The lifestyle photographs predate
 * that convention and are listed by hand — each one is a real strand, so the
 * month is a fact about the picture, not a guess.
 */
const LIFESTYLE_MONTH: Record<string, number> = {
  "initial-letter-necklace-hero.jpg": 4,                    // clear quartz, initial A
  "initial-letter-necklace-bridesmaids-trio.jpg": 4,        // clear quartz, E A O
  "initial-letter-necklace-navy-mother-daughter.jpg": 9,    // lapis lazuli, S and K
  "initial-letter-necklace-lilac-amethyst.jpg": 2,          // amethyst, initial F
  "initial-letter-necklace-burgundy-garnet.jpg": 1,         // garnet, initial J
  "initial-letter-necklace-rose-pink.jpg": 7,               // ruby, initial R
  "initial-letter-necklace-flower-girl-blue.jpg": 3,        // aquamarine
  "initial-letter-necklace-teal-gift-box.jpg": 5,           // amazonite, boxed
  "initial-letter-necklace-pink-gift-box.jpg": 7,           // ruby, boxed
  "initial-letter-necklace-pink-lace-gift-box.jpg": 7,      // ruby, boxed on lace
};

export function birthstoneMonthForImage(url: string): number | null {
  const file = url.split("/").pop() ?? "";
  if (/\/(birthstones|finished|pairings)\//.test(url)) {
    const n = Number(file.slice(0, 2));
    return Number.isInteger(n) && n >= 1 && n <= 12 ? n : null;
  }
  return LIFESTYLE_MONTH[file] ?? null;
}
