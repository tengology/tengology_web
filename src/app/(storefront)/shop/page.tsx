import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Reveal } from "@/components/storefront/Reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our collection of handcrafted hair accessories, jewellery, and ornaments.",
};

const categoryLabels: Record<string, string> = {
  HAIR_ACCESSORIES: "Hair Accessories",
  JEWELLERY: "Jewellery",
  CHRISTMAS_ORNAMENTS: "Christmas Ornaments",
  BROOCHES: "Brooches",
  OTHER: "Other",
};

const categoryIntros: Record<string, { heading: string; body: string }> = {
  JEWELLERY: {
    heading: "Grounded Luxury",
    body: "Tengology is a boutique jewellery brand that bridges the gap between the raw power of the earth and the refined elegance of modern life. We create ritual jewellery for the intentional wearer: pieces that don’t just look beautiful, but provide a physical point of connection to nature.",
  },
};

const categoryIntroImages: Record<string, { src: string; alt: string }> = {
  JEWELLERY: {
    src: "/products/comet/clear-quartz-star-cluster-earrings-hero.jpg",
    alt: "Clear quartz star cluster earrings photographed on a neutral surface",
  },
};

const subcategoryLabels: Record<string, Record<string, string>> = {
  JEWELLERY: {
    NECKLACES: "Necklaces",
    BRACELETS: "Bracelets",
    EARRINGS: "Earrings",
    RINGS: "Rings",
  },
};

const intentionOptions: { value: string; label: string }[] = [
  { value: "Connection", label: "Connection" },
  { value: "Focus", label: "Focus" },
  { value: "Protection", label: "Protection" },
  { value: "Clarity", label: "Clarity" },
  { value: "Stillness", label: "Stillness" },
  { value: "Energy", label: "Energy" },
  { value: "Shielding", label: "Shielding" },
  { value: "Uniqueness", label: "Uniqueness" },
  { value: "Softness", label: "Softness" },
  { value: "Optimism", label: "Optimism" },
  { value: "Alignment", label: "Alignment" },
];

const collectionShowcases: Record<
  string,
  { name: string; slug: string; tagline: string; detail: string; tags: string[] }[]
> = {
  JEWELLERY: [
    {
      name: "Moon and Sun",
      slug: "Moon and Sun",
      tagline: "Layer your intention",
      detail:
        "Delicate 4mm crystal beads paired with Argentium Silver and Gold-filled accents. Designed for stacking — wear one for a whisper, or three for a statement. Also available as a Micro Crystal Necklace.",
      tags: ["4mm crystals", "Argentium Silver", "Gold-filled", "Stackable", "Bracelets", "Necklaces"],
    },
    {
      name: "The Horizon",
      slug: "The Horizon",
      tagline: "The foundation of every look",
      detail:
        "A refined Gold-filled chain with a 10mm polished disc pendant — understated enough to wear daily, elegant enough to anchor any stack.",
      tags: ["Gold-filled chain", "10mm disc pendant", "Necklaces"],
    },
    {
      name: "Orbit",
      slug: "Orbit",
      tagline: "Your foundation, your way",
      detail:
        "7–8mm crystal bases in Black Obsidian, Clear Quartz, Lychee Jelly Agate, or Hematoid Clear Quartz, accented with Gold-filled and Argentium beads. Add a charm to make it yours.",
      tags: ["7–8mm crystals", "Customisable charms", "Argentium Silver", "Gold-filled", "Bracelets"],
    },
    {
      name: "Meridian",
      slug: "Meridian",
      tagline: "Find your centre",
      detail:
        "10mm crystal bracelets anchored by a striking 12–13mm focal crystal, flanked by Sterling Silver and Gold-filled spacer discs. A piece that draws the eye inward.",
      tags: ["10mm crystals", "Focal crystal", "Sterling Silver", "Gold-filled", "Bracelets"],
    },
    {
      name: "Satellite",
      slug: "Satellite",
      tagline: "The finishing touch",
      detail:
        "4mm bead studs with a 7–8mm crystal drop attached by hand-wrapped wire. Available in Argentium Silver and Gold-filled to match your stack.",
      tags: ["4mm stud", "7–8mm drop", "Wire wrap", "Argentium Silver", "Gold-filled", "Earrings"],
    },
    {
      name: "Titan",
      slug: "Titan",
      tagline: "Pure crystal, nothing else",
      detail:
        "Statement pieces featuring rare 13–16mm crystals with no metal parts. Each bead is chosen for its natural beauty — the crystal is the entire design.",
      tags: ["13–16mm crystals", "No metal", "Rare stones", "Bracelets"],
    },
    {
      name: "Planets",
      slug: "Planets",
      tagline: "Worlds on your wrist",
      detail:
        "Spherical crystal charms in two sizes — 12mm Planet and 7–8mm Mini Planet. Clip onto your Orbit base to build your own constellation.",
      tags: ["12mm charms", "7–8mm mini charms", "For Orbit base"],
    },
    {
      name: "Comet",
      slug: "Comet",
      tagline: "A trail of light",
      detail:
        "Statement drop earrings — a hand-wired cluster of crystal, pearl, and faceted stone trailing into a single polished drop. Natural crystal on Sterling Silver (S925) hooks, most finished in 14k gold plating.",
      tags: ["Natural crystal", "Cluster drops", "S925 hooks", "14k gold-plated", "Earrings"],
    },
    {
      name: "Asteroid",
      slug: "Asteroid",
      tagline: "Beautifully irregular",
      detail:
        "One-of-a-kind charms crafted from raw, irregular-shaped crystals. No two are alike — nature’s own design, ready to clip onto your Orbit.",
      tags: ["Irregular crystals", "Raw shapes", "For Orbit base"],
    },
  ],
};

const pillBase =
  "eyebrow whitespace-nowrap rounded-none border px-3.5 py-2 transition-colors";
const pillIdle = "hover:border-foreground/40 hover:!text-foreground";
const pillActive = "border-foreground bg-foreground !text-background";
const intentionPillActive = "border-moss bg-moss-light !text-moss-dark";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sub?: string; collection?: string; sort?: string; q?: string; intention?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const subcategory = params.sub;
  const collection = params.collection;
  const intention = params.intention;
  const sortBy = params.sort || "newest";
  const query = params.q;

  const orderBy =
    sortBy === "price-asc"
      ? { price: "asc" as const }
      : sortBy === "price-desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = [];

  try {
    products = await prisma.product.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
        ...(subcategory ? { subcategory } : {}),
        ...(collection ? { collection } : {}),
        ...(intention ? { intention } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query } },
                { shortDescription: { contains: query } },
              ],
            }
          : {}),
      },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy,
    });
  } catch {
    // DB not connected yet
  }

  const subcatLabel = category && subcategory && subcategoryLabels[category]?.[subcategory];
  const title = intention
    ? `Intention: ${intention}`
    : collection
      ? collection
      : subcatLabel
        ? subcatLabel
        : category
          ? categoryLabels[category] || "Shop"
          : "All Products";
  const categoryIntro = category ? categoryIntros[category] : undefined;
  const categoryIntroImage = category ? categoryIntroImages[category] : undefined;

  return (
    <div>
      {/* Compact editorial header */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="border-t pt-6 pb-10 lg:pb-14">
          <p className="eyebrow mb-4">The catalogue</p>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h1 className="font-heading text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="eyebrow pb-1.5">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-[var(--header-h,4rem)] z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 sm:px-6 lg:px-8">
          {/* Category filter pills */}
          <div className="-mx-4 flex flex-nowrap gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <Link
              scroll={false}
              href="/shop"
              className={`${pillBase} ${!category ? pillActive : pillIdle}`}
            >
              All
            </Link>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Link
                scroll={false}
                key={key}
                href={`/shop?category=${key}`}
                className={`${pillBase} ${category === key ? pillActive : pillIdle}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Subcategory filter pills */}
          {category && subcategoryLabels[category] && (
            <div className="-mx-4 flex flex-nowrap gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              <Link
                scroll={false}
                href={`/shop?category=${category}`}
                className={`${pillBase} ${!subcategory ? pillActive : pillIdle}`}
              >
                All {categoryLabels[category]}
              </Link>
              {Object.entries(subcategoryLabels[category]).map(([key, label]) => (
                <Link
                  scroll={false}
                  key={key}
                  href={`/shop?category=${category}&sub=${key}`}
                  className={`${pillBase} ${subcategory === key ? pillActive : pillIdle}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Intention filter */}
          {category === "JEWELLERY" && (
            <div className="-mx-4 flex flex-nowrap items-center gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              <span className="eyebrow mr-1 whitespace-nowrap">Intention</span>
              <Link
                scroll={false}
                href={`/shop?category=JEWELLERY${subcategory ? `&sub=${subcategory}` : ""}${collection ? `&collection=${encodeURIComponent(collection)}` : ""}`}
                className={`${pillBase} ${!intention ? intentionPillActive : pillIdle}`}
              >
                All
              </Link>
              {intentionOptions.map((opt) => (
                <Link
                  scroll={false}
                  key={opt.value}
                  href={`/shop?category=JEWELLERY${subcategory ? `&sub=${subcategory}` : ""}${collection ? `&collection=${encodeURIComponent(collection)}` : ""}&intention=${encodeURIComponent(opt.value)}`}
                  className={`${pillBase} ${intention === opt.value ? intentionPillActive : pillIdle}`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Introduction */}
      {categoryIntro && !collection && (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div
            className={`grid gap-8 ${
              categoryIntroImage ? "items-center lg:grid-cols-[0.9fr_1.1fr]" : ""
            }`}
          >
            {categoryIntroImage && (
              <Reveal variant="left">
                <div className="relative aspect-[4/3] overflow-hidden rounded-none bg-muted">
                  <Image
                    src={categoryIntroImage.src}
                    alt={categoryIntroImage.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            )}
            <Reveal delay={120} className={categoryIntroImage ? "" : "mx-auto max-w-3xl text-center"}>
              <h2 className="mb-4 font-heading text-3xl leading-[1.05] lg:text-4xl">
                {categoryIntro.heading}
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {categoryIntro.body}
              </p>
            </Reveal>
          </div>
        </div>
      )}

      {/* Collection Showcase */}
      {category && collectionShowcases[category] && !collection && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-8">
          <p className="eyebrow mb-8 text-center">Our collections</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {collectionShowcases[category].map((col, i) => (
              <Reveal key={col.slug} delay={(i % 4) * 70} className="h-full">
                <Link
                  scroll={false}
                  href={`/shop?category=${category}&collection=${encodeURIComponent(col.slug)}`}
                  className="group flex h-full flex-col rounded-none border p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] lg:p-8"
                >
                  <h4 className="mb-1 font-heading text-2xl lg:text-3xl">
                    {col.name}
                  </h4>
                  <p className="mb-4 text-sm italic text-muted-foreground">
                    {col.tagline}
                  </p>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    {col.detail}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {col.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-none border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="eyebrow mt-auto inline-flex items-center gap-2 pt-5 transition-colors group-hover:text-moss">
                    View collection
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* Collection back link */}
      {category && collection && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
          <Link
            scroll={false}
            href={`/shop?category=${category}`}
            className="link-underline eyebrow transition-colors hover:text-moss"
          >
            &larr; All {categoryLabels[category]}
          </Link>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product: { id: string; slug: string; title: string; price: number; compareAtPrice?: number | null; category: string; images: { url: string }[] }, i: number) => (
              <Reveal key={product.id} delay={(i % 4) * 70}>
                <ProductCard
                  slug={product.slug}
                  title={product.title}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  image={product.images[0]?.url}
                  category={product.category}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="border-t py-24 text-center lg:py-32">
            <p className="font-heading text-3xl leading-[1.05] sm:text-4xl">
              Nothing here <em>yet</em>
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Check back soon — new pieces are always in the works.
            </p>
            <Link
              scroll={false}
              href="/shop"
              className="eyebrow mt-8 inline-flex border border-foreground bg-foreground px-8 py-3.5 !text-background transition-colors hover:bg-transparent hover:!text-foreground"
            >
              Browse all
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
