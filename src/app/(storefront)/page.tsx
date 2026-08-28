import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Reveal } from "@/components/storefront/Reveal";
import { SectionHeading } from "@/components/storefront/SectionHeading";
import { CATEGORY_LIST } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

// Revalidate via ISR: the home page shows DB-driven featured products.
export const revalidate = 60;

/**
 * The maker photograph, and the shape it was actually taken in.
 *
 * The aspect travels with the picture rather than being fixed by the layout,
 * so a portrait shot from the workbench is shown whole instead of being
 * cropped to a landscape frame it never fitted. Swapping in a landscape photo
 * later needs nothing but a new `aspect`.
 */
const makerPhoto = {
  src: "/lookbook/felt-sunflower-workbench.jpg",
  alt: "The Tengology workbench mid-make — hand-cut wool felt sunflowers and green leaves laid out on a cutting mat, beside pliers, scissors, a glue gun and the cutting machine",
  aspect: "3/4",
};

/** A frame much taller than it is wide would tower over the text beside it. */
const makerPhotoIsTall = (() => {
  const [w, h] = makerPhoto.aspect.split("/").map(Number);
  return h / w > 1.15;
})();

/** One card per material family — the top level of the shop taxonomy. */
const collections = CATEGORY_LIST.map((c) => ({
  name: c.label,
  href: `/shop?category=${c.key}`,
  description: c.blurb,
  image: c.card.src,
  imageAlt: c.card.alt,
}));

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
      {/* Hero — split so the portrait studio shot reads at full height
          instead of being cropped into a letterbox. */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-16 lg:py-20">
            <div className="lg:col-span-6">
              <p
              className="eyebrow mb-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both motion-safe:duration-700"
              style={{ animationDelay: "0ms" }}
            >
              Designed &amp; Made in Oxford
            </p>
            <h1
              className="font-heading text-6xl leading-[0.92] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both motion-safe:duration-700 sm:text-7xl lg:text-8xl"
              style={{ animationDelay: "90ms" }}
            >
              Made with
              <br />
              <em>intention</em>
            </h1>
            <p
              className="mt-8 max-w-md leading-relaxed text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both motion-safe:duration-700"
              style={{ animationDelay: "180ms" }}
            >
              Every piece is designed and handmade in Oxford using wool felt,
              wood, and natural materials. Made to be treasured.
            </p>
            <div
              className="mt-10 flex flex-wrap gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both motion-safe:duration-700"
              style={{ animationDelay: "270ms" }}
            >
              <Link
                href="/shop"
                className="eyebrow inline-flex items-center border border-foreground bg-foreground px-8 py-4 !text-background transition-colors hover:bg-transparent hover:!text-foreground"
              >
                Shop the collection
              </Link>
              <Link
                href="/designer/bracelet"
                className="eyebrow inline-flex items-center border px-8 py-4 !text-foreground transition-colors hover:border-foreground"
              >
                Design your own
              </Link>
              </div>
            </div>

            {/* Portrait studio shot */}
            <div className="lg:col-span-6">
              <figure className="relative aspect-[4/5] overflow-hidden bg-muted lg:aspect-[3/4]">
                <Image
                  src="/products/sunflower/sunflower-maker-table-wide-v2.jpeg"
                  alt="Handmade felt sunflower headbands, brooches and clips laid out on the studio cutting mat"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover motion-safe:animate-[hero-zoom_14s_var(--ease-soft)_forwards]"
                />
              </figure>
              <figcaption className="eyebrow mt-3">
                The studio table &mdash; Oxford
              </figcaption>
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <SectionHeading index="01" eyebrow="Shop by craft" title="Collections" />
        <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:gap-6">
          {collections.map((col, i) => (
            <Reveal key={col.name} delay={i * 80}>
              <Link
                href={col.href}
                className="group relative flex aspect-[3/4] items-end overflow-hidden bg-muted p-6"
              >
                {col.image && (
                  <Image
                    src={col.image}
                    alt={col.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                    style={{ transitionTimingFunction: "var(--ease-soft)" }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <span className="eyebrow absolute right-5 top-5 z-10">
                  0{i + 1}
                </span>
                <div className="relative z-10">
                  <h3 className="font-heading text-xl leading-tight lg:text-2xl">
                    {col.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {col.description}
                  </p>
                  <span className="eyebrow mt-3 inline-flex items-center gap-2 text-foreground">
                    View
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <SectionHeading
            index="02"
            eyebrow="From the studio"
            title="Featured pieces"
            action={{ href: "/shop", label: "View all" }}
          />
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featuredProducts.map(
              (
                product: {
                  id: string;
                  slug: string;
                  title: string;
                  price: number;
                  compareAtPrice?: number | null;
                  images: { url: string }[];
                },
                i: number
              ) => (
                <Reveal key={product.id} delay={(i % 4) * 70}>
                  <ProductCard
                    slug={product.slug}
                    title={product.title}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    image={product.images[0]?.url}
                  />
                </Reveal>
              )
            )}
          </div>
        </section>
      )}

      {/* Story teaser */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <SectionHeading
          index="03"
          eyebrow="The maker"
          title="Every piece tells a story"
        />
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal variant="left">
            <div
              style={{ aspectRatio: makerPhoto.aspect }}
              className={cn(
                "relative overflow-hidden bg-muted",
                makerPhotoIsTall && "mx-auto w-full max-w-sm lg:mx-0"
              )}
            >
              <Image
                src={makerPhoto.src}
                alt={makerPhoto.alt}
                fill
                sizes={
                  makerPhotoIsTall
                    ? "(max-width: 1024px) 100vw, 384px"
                    : "(max-width: 1024px) 100vw, 50vw"
                }
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                From carefully chosen materials to the finishing touches, each
                Tengology creation is made by hand with attention to every
                detail.
              </p>
              <Link
                href="/pages/about"
                className="eyebrow mt-8 inline-flex border border-foreground px-8 py-4 !text-foreground transition-colors hover:bg-foreground hover:!text-background"
              >
                Our story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
