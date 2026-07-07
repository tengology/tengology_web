import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Reveal } from "@/components/storefront/Reveal";
import { SectionHeading } from "@/components/storefront/SectionHeading";

// Revalidate via ISR: home shows DB-driven featured products + layout ticker.
export const revalidate = 60;

const collections = [
  {
    name: "Hair Accessories",
    href: "/shop?category=HAIR_ACCESSORIES",
    description: "Felt flowers, strawberries, clips & headbands",
    image: "/products/dahlia/dahlia-collection.jpg",
    alt: "Handmade felt flower headbands photographed on a pale blue surface",
  },
  {
    name: "Jewellery",
    href: "/shop?category=JEWELLERY",
    description: "Crystal bracelets, charms & intentional pieces",
    image: "/products/comet/clear-quartz-star-cluster-earrings-hero.jpg",
    alt: "Clear quartz star cluster earrings photographed on a neutral surface",
  },
  {
    name: "Christmas",
    href: "/shop?category=CHRISTMAS_ORNAMENTS",
    description: "Seasonal felt pieces for gifting",
    image: "/products/festive/reindeer-antler-headband-hero.jpg",
    alt: "Festive handmade reindeer antler headband photographed on a tabletop",
  },
  {
    name: "Brooches",
    href: "/shop?category=BROOCHES",
    description: "Statement brooches & pins",
    image: "/products/sunflower/sunflower-brooch-front-v2.jpeg",
    alt: "Sunflower felt brooch photographed on ivory fabric",
  },
];

const materialNotes = [
  "Wool felt shaped petal by petal",
  "Crystals chosen for colour and intention",
  "Small batch pieces made by hand",
];

/** On-load hero entrance: tw-animate-css stagger, ~90ms steps. */
const heroEnter =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both motion-safe:duration-700";

export default async function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let featuredProducts: any[] = [];

  try {
    featuredProducts = await prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // DB not connected yet — show empty state
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-muted">
        <Image
          src="/products/statement-blooms/blooms-pair-hero.jpg"
          alt="Two handmade felt flower headbands photographed outdoors on wooden rounds"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center motion-safe:animate-[hero-zoom_14s_var(--ease-soft)_forwards]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-background/10" />
        <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:min-h-[680px] lg:px-8">
          <div className="max-w-2xl">
            <p
              className={`eyebrow mb-5 ${heroEnter}`}
              style={{ animationDelay: "0ms" }}
            >
              Tengology — Designed &amp; made in Oxford
            </p>
            <h1
              className={`font-heading text-6xl leading-[0.92] sm:text-7xl lg:text-8xl ${heroEnter}`}
              style={{ animationDelay: "90ms" }}
            >
              Handcrafted,
              <br />
              with <em>patience</em>
            </h1>
            <p
              className={`mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg ${heroEnter}`}
              style={{ animationDelay: "180ms" }}
            >
              Handcrafted accessories and crystal jewellery made with wool felt,
              natural materials, and a careful eye for texture.
            </p>
            <div
              className={`mt-9 flex flex-wrap gap-3 ${heroEnter}`}
              style={{ animationDelay: "270ms" }}
            >
              <Link
                href="/shop"
                className="eyebrow inline-flex items-center border border-foreground bg-foreground px-7 py-3.5 !text-background transition-colors hover:bg-transparent hover:!text-foreground"
              >
                Shop handmade pieces
              </Link>
              <Link
                href="/pages/about"
                className="eyebrow inline-flex items-center border px-7 py-3.5 !text-foreground transition-colors hover:border-foreground hover:bg-background/70"
              >
                The studio story
              </Link>
            </div>
            <div
              className={`mt-12 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 ${heroEnter}`}
              style={{ animationDelay: "360ms" }}
            >
              {materialNotes.map((note) => (
                <p key={note} className="border-t pt-3 leading-snug">
                  {note}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <SectionHeading
          index="01"
          eyebrow="Shop by craft"
          title="Collections"
          className="mb-12 lg:mb-16"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {collections.map((col, i) => (
            <Reveal key={col.name} delay={i * 80}>
              <Link
                href={col.href}
                className="group relative flex aspect-[3/4] items-end overflow-hidden rounded-none bg-muted p-5 sm:p-6"
              >
                {col.image && (
                  <Image
                    src={col.image}
                    alt={col.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <span className="eyebrow absolute left-5 top-5 z-10 !text-foreground sm:left-6 sm:top-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
                <div className="relative z-10 max-w-[14rem]">
                  <h3 className="mb-1 font-heading text-2xl lg:text-3xl">
                    {col.name}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {col.description}
                  </p>
                  <span className="eyebrow mt-3 inline-flex items-center gap-2 !text-foreground">
                    View
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Studio */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <SectionHeading
          index="02"
          eyebrow="The studio table"
          title={
            <>
              In the <em>studio</em>
            </>
          }
          className="mb-12 lg:mb-16"
        />
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <Reveal variant="left">
            <div className="relative aspect-[4/3] overflow-hidden rounded-none bg-muted">
              <Image
                src="/products/strawberries/flat-lay-top.jpg"
                alt="Strawberry felt accessories photographed together on a white surface"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <blockquote className="font-heading text-3xl leading-[1.05] sm:text-4xl lg:text-5xl">
              Felt flowers, berry clusters, crystal beads, and the{" "}
              <em>patience</em> to make each one feel personal.
            </blockquote>
            <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
              Tengology pieces are small-batch, tactile, and intentionally
              imperfect in the best handmade way. Each detail is selected,
              stitched, shaped, or threaded in the Oxford studio.
            </p>
            <Link
              href="/pages/about"
              className="eyebrow mt-8 inline-flex border border-foreground px-8 py-3.5 !text-foreground transition-colors hover:bg-foreground hover:!text-background"
            >
              Read the story
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <SectionHeading
            index="03"
            eyebrow="From the studio"
            title="Featured pieces"
            action={{ href: "/shop", label: "View all" }}
            className="mb-12 lg:mb-16"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featuredProducts.map((product: { id: string; slug: string; title: string; price: number; compareAtPrice?: number | null; images: { url: string }[] }, i: number) => (
              <Reveal key={product.id} delay={(i % 4) * 70}>
                <ProductCard
                  slug={product.slug}
                  title={product.title}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  image={product.images[0]?.url}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Story teaser */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <SectionHeading
          index="04"
          eyebrow="The maker"
          title={
            <>
              Every piece tells a <em>story</em>
            </>
          }
          className="mb-12 lg:mb-16"
        />
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal variant="left">
            <div className="relative aspect-[4/3] overflow-hidden rounded-none bg-muted">
              <Image
                src="/products/cottage-garden/daffodil-clip-group.jpg"
                alt="Handmade daffodil felt clips photographed together on a tabletop"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-lg font-heading text-2xl leading-[1.15] sm:text-3xl">
              From carefully chosen materials to the finishing touches, each
              Tengology creation is made by hand with attention to every
              detail.
            </p>
            <Link
              href="/pages/about"
              className="eyebrow mt-8 inline-flex border border-foreground bg-foreground px-8 py-3.5 !text-background transition-colors hover:bg-transparent hover:!text-foreground"
            >
              Our story
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
