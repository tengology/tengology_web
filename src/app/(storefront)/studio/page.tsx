import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/storefront/Reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Studio",
  description:
    "Inside the Oxford studio — cutting mats, dye pots, half-made blooms and the market stalls they end up on.",
};

/**
 * The photo wall.
 *
 * Everything here is a picture of work rather than a product: offcuts, wet
 * dye, a bench mid-job, a stall at seven in the morning. Deliberately not
 * shoppable — no prices, no links to listings — because the point is what the
 * making looks like, not what it costs.
 *
 * Laid out in CSS columns so portrait and landscape sit at their own heights.
 * `break-inside-avoid` is what stops a frame being sliced across a column.
 */

type Shot = { src: string; alt: string; caption?: string };

const SHOTS: Shot[] = [
  {
    src: "/studio/maker-at-the-bench.jpg",
    alt: "The maker threading felt beads at the studio bench over a blue cutting mat",
    caption: "Threading berries, one at a time",
  },
  {
    src: "/studio/turmeric-dye-pot.jpg",
    alt: "Wool yarn simmering in a pan of yellow turmeric dye",
    caption: "Turmeric, straight from the kitchen",
  },
  {
    src: "/studio/felt-roses-rolled.jpg",
    alt: "Dozens of hand-rolled wool felt roses in every colour packed together",
    caption: "A morning of roses",
  },
  {
    src: "/studio/felt-offcuts.jpg",
    alt: "Cut wool felt petals and offcuts scattered across a cutting mat",
  },
  {
    src: "/studio/market-stall-bunting.jpg",
    alt: "The Tengology market stall dressed with bunting at a craft fair",
    caption: "Set up by eight",
  },
  {
    src: "/studio/felt-flowers-spread.jpg",
    alt: "Hundreds of finished felt flowers in spring colours spread across the work table",
  },
  {
    src: "/studio/liberty-fabric-pile.jpg",
    alt: "A pile of Liberty-style floral and gingham cotton offcuts",
    caption: "What is left of last month's prints",
  },
  {
    src: "/studio/felt-daffodils.jpg",
    alt: "A drift of hand-cut felt daffodils in yellow and cream on a cutting mat",
  },
  {
    src: "/studio/maker-threading-beads.jpg",
    alt: "Close view of the maker's hands knotting a strand of felt beads",
  },
  {
    src: "/studio/felt-roses-in-progress.jpg",
    alt: "Half-rolled felt roses beside a rotary cutter and strips of wool felt",
  },
  {
    src: "/studio/lion-dance-making.jpg",
    alt: "Assembling a pink lion dance charm from chenille stems at the cutting mat",
    caption: "An evening each",
  },
  {
    src: "/studio/market-stall-pegboard.jpg",
    alt: "A pegboard of felt flower hair clips and headbands on the market stall",
  },
  {
    src: "/studio/felt-pumpkins-tray.jpg",
    alt: "Small felt pumpkins in autumn colours arranged on a carved wooden leaf tray",
  },
  {
    src: "/studio/knot-brooches-bench.jpg",
    alt: "Chinese knot brooches and tassels laid out with pliers on the workbench",
  },
  {
    src: "/studio/deer-headband-flatlay.jpg",
    alt: "A felt deer antler headband with toadstools and daisies on a green background",
  },
  {
    src: "/studio/market-stall-hall.jpg",
    alt: "The Tengology stall set up in a village hall craft fair",
  },
  {
    src: "/studio/felt-blueberries.jpg",
    alt: "A cluster of hand-stitched felt blueberries held in the palm of a hand",
  },
  {
    src: "/studio/unicorn-headband-flatlay.jpg",
    alt: "A felt unicorn headband with a flower crown on a pink background scattered with pearls",
  },
  {
    src: "/studio/spaghetti-charm-making.jpg",
    alt: "Felt meatball and spaghetti charms being assembled by hand",
  },
  {
    src: "/studio/bunny-ear-headbands.jpg",
    alt: "Felt bunny ear headbands dressed with spring flowers, hung on a wall",
  },
  {
    src: "/studio/market-stall-spread.jpg",
    alt: "The full spread of felt flowers and hair accessories on the market stall table",
  },
  {
    src: "/studio/felt-sushi-basket.jpg",
    alt: "A basket of handmade felt nigiri sushi in salmon, tuna and prawn",
  },
  {
    src: "/studio/felt-flower-headband-hand.jpg",
    alt: "A finished felt flower headband held up in one hand",
  },
  {
    src: "/studio/market-stall-portrait.jpg",
    alt: "The maker behind the Tengology stall at an indoor craft market",
    caption: "Come and say hello",
  },
];

export default function StudioPage() {
  return (
    <div>
      {/* Opening */}
      <section className="border-b">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="eyebrow mb-4">The Studio</p>
          <h1 className="mb-6 font-heading text-4xl leading-[0.95] lg:text-6xl">
            Where it all
            <br />
            actually happens
          </h1>
          <p className="max-w-xl leading-relaxed text-muted-foreground">
            A cutting mat that has seen better days, a dye pot borrowed from the
            kitchen, and more half-finished flowers than anyone needs. This is the
            part that does not make it into the product photographs — the offcuts,
            the trays of parts, and the six-in-the-morning stall set-ups.
          </p>
        </div>
      </section>

      {/* The wall */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4 lg:gap-4">
          {SHOTS.map((shot, i) => (
            // The column item is this wrapper, not the figure inside it, so
            // break-inside-avoid has to live here or the browser slices a
            // photo across two columns.
            <Reveal
              key={shot.src}
              delay={(i % 4) * 60}
              className="mb-3 break-inside-avoid lg:mb-4"
            >
              <figure>
                <div className="overflow-hidden bg-muted">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={800}
                    height={1000}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
                    className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                  />
                </div>
                {shot.caption && (
                  <figcaption className="mt-2 text-xs text-muted-foreground">
                    {shot.caption}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
          <h2 className="mb-6 font-heading text-3xl leading-[0.95] lg:text-4xl">
            The finished things
            <br />
            are <em>this way</em>
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="eyebrow inline-flex border border-foreground px-8 py-4 !text-foreground transition-colors hover:bg-foreground hover:!text-background"
            >
              Shop everything
            </Link>
            <Link
              href="/pages/about"
              className="eyebrow inline-flex border px-8 py-4 transition-colors hover:border-foreground hover:!text-foreground"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
