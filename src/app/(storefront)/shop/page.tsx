import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/storefront/Reveal";
import { SectionHeading } from "@/components/storefront/SectionHeading";
import { CategoryStory } from "@/components/storefront/CategoryStory";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import {
  CATEGORY_LIST,
  INTENTIONS,
  SUBCATEGORY_LABELS,
  bucketLabel,
  getCategory,
  isSubcategoryKey,
  type SubcategoryKey,
} from "@/lib/taxonomy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse handmade crystal jewellery, wool felt accessories, and Indonesian batik pieces.",
};

const ALL_PREVIEW_COUNT = 8;

/** Wide still behind the hero when no family is selected. */
const DEFAULT_BANNER = {
  src: "/products/sunflower/sunflower-maker-table-wide-v2.jpeg",
  alt: "Handmade felt sunflower headbands, brooches and clips laid out on the studio cutting mat",
  // Portrait source in a short wide band: bias the crop low so the sunflower
  // spread fills the strip instead of the blurred desk behind it.
  position: "50% 72%",
};

type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  category: string;
  images: { url: string }[];
};

function ProductGrid({ products }: { products: ShopProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {products.map((product, i) => (
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
  );
}

/** Shared look for every filter pill, so the rows stay visually level. */
function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`eyebrow border px-4 py-2 transition-colors ${
        active
          ? "bg-foreground !text-background"
          : "hover:border-foreground hover:!text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sub?: string;
    collection?: string;
    sort?: string;
    q?: string;
    intention?: string;
  }>;
}) {
  const params = await searchParams;

  // Validate both levels against the taxonomy so a stale bookmark falls back to
  // a wider view instead of querying for a key that can never match.
  const family = getCategory(params.category);
  const subcategory = isSubcategoryKey(params.sub) ? params.sub : undefined;
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

  let products: ShopProduct[] = [];
  // Which types this family actually stocks right now — pills for empty ones
  // would be dead ends, so they are never rendered.
  let stockedTypes: SubcategoryKey[] = [];

  try {
    const where = {
      isPublished: true,
      ...(family ? { category: family.key } : {}),
      ...(subcategory ? { subcategory } : {}),
      ...(collection ? { collection } : {}),
      ...(intention ? { intention } : {}),
      ...(query
        ? {
            // Postgres `LIKE` is case-sensitive, so shopper searches need
            // an explicit insensitive mode to behave the way people expect.
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { shortDescription: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    if (family) {
      // Counted across the whole family, not the current filter, so narrowing to
      // one type never hides the others.
      const [rows, grouped] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { images: { where: { isPrimary: true }, take: 1 } },
          orderBy,
        }),
        prisma.product.groupBy({
          by: ["subcategory"],
          where: { isPublished: true, category: family.key },
        }),
      ]);
      products = rows;
      const present = new Set(grouped.map((g) => g.subcategory));
      stockedTypes = family.subcategories.filter((type) => present.has(type));
    } else {
      products = await prisma.product.findMany({
        where,
        include: { images: { where: { isPrimary: true }, take: 1 } },
        orderBy,
      });
    }
  } catch {
    // DB not connected yet
  }

  const isAllView = !family && !collection && !intention && !query;
  const sections = isAllView
    ? CATEGORY_LIST.map((entry) => ({
        key: entry.key,
        label: entry.label,
        blurb: entry.blurb,
        items: products.filter((product) => product.category === entry.key),
      }))
        .filter((section) => section.items.length > 0)
        .map((section, i) => ({ ...section, index: String(i + 1).padStart(2, "0") }))
    : [];

  const title = intention
    ? `Intention: ${intention}`
    : collection
      ? collection
      : (bucketLabel(family?.key, subcategory) ?? "All Products");

  /** The collection being viewed, when the URL names one this family defines. */
  const openCollection = collection
    ? family?.collections?.find((col) => col.name === collection)
    : undefined;

  const banner = family?.banner ?? DEFAULT_BANNER;
  /** Only the default banner carries a crop hint; family banners are already wide. */
  const bannerPosition =
    "position" in banner ? (banner.position as string) : undefined;

  /** The family, when it has nothing published at all — as opposed to a filter
   *  that happens to exclude everything. */
  const emptyFamily =
    family && stockedTypes.length === 0 && !collection && !intention && !query
      ? family
      : null;

  /** Keeps the intention row from dropping the family, type, or collection. */
  const intentionHref = (value?: string) => {
    const q = new URLSearchParams();
    if (family) q.set("category", family.key);
    if (subcategory) q.set("sub", subcategory);
    if (collection) q.set("collection", collection);
    if (value) q.set("intention", value);
    return `/shop?${q.toString()}`;
  };

  return (
    <div>
      {/* Shop Hero */}
      <div className="relative h-44 overflow-hidden bg-muted lg:h-60">
        <Image
          src={banner.src}
          alt={banner.alt}
          fill
          priority
          sizes="100vw"
          style={bannerPosition ? { objectPosition: bannerPosition } : undefined}
          className="object-cover opacity-40"
        />
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 lg:px-8">
          <div>
            <p className="eyebrow mb-3">{family ? family.blurb : "The catalogue"}</p>
            <h1 className="font-heading text-5xl leading-[0.95] lg:text-6xl">
              {family ? family.label : "Shop"}
            </h1>
          </div>
        </div>
      </div>

      {/* Family story — the craft, and for Batik the clip of it being made */}
      {family && !collection && !subcategory && !intention && (
        <CategoryStory category={family} />
      )}

      {/* Collection Showcase */}
      {family?.collections && !collection && !subcategory && (
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
          <h3 className="mb-8 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Our Collections
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {family.collections.map((col) => (
              <Link
                key={col.name}
                href={`/shop?category=${family.key}&collection=${encodeURIComponent(col.name)}`}
                className="group rounded-sm border px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <h4 className="font-heading text-lg font-light transition-colors lg:text-xl">
                  {col.name}
                </h4>
                <p className="mt-0.5 text-sm italic leading-snug text-muted-foreground">
                  {col.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Collection back link, and the copy the showcase tile is too small for */}
      {family && collection && (
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <Link
            href={`/shop?category=${family.key}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; All {family.label}
          </Link>
          {openCollection?.image && (
            <div className="relative mt-6 aspect-[2/1] w-full overflow-hidden bg-muted">
              <Image
                src={openCollection.image.src}
                alt={openCollection.image.alt}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          )}
          {openCollection && (
            <div className="mt-6 max-w-2xl">
              <p className="text-sm italic text-muted-foreground">
                {openCollection.tagline}
              </p>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {openCollection.detail}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {openCollection.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-light lg:text-4xl">{title}</h2>
            {!isAllView && (
              <p className="mt-1 text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>
            )}
          </div>

          {/* Material family — the top level */}
          <div className="flex flex-wrap gap-2">
            <FilterPill href="/shop" active={!family}>
              All
            </FilterPill>
            {CATEGORY_LIST.map((entry) => (
              <FilterPill
                key={entry.key}
                href={`/shop?category=${entry.key}`}
                active={family?.key === entry.key}
              >
                {entry.label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Product type — the second level, within the chosen family */}
        {family && stockedTypes.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <FilterPill href={`/shop?category=${family.key}`} active={!subcategory}>
              All {family.label}
            </FilterPill>
            {stockedTypes.map((type) => (
              <FilterPill
                key={type}
                href={`/shop?category=${family.key}&sub=${type}`}
                active={subcategory === type}
              >
                {SUBCATEGORY_LABELS[type]}
              </FilterPill>
            ))}
          </div>
        )}

        {/* Intention filter */}
        {family?.hasIntentions && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Intention
            </span>
            <FilterPill href={intentionHref()} active={!intention}>
              All
            </FilterPill>
            {INTENTIONS.map((value) => (
              <FilterPill
                key={value}
                href={intentionHref(value)}
                active={intention === value}
              >
                {value}
              </FilterPill>
            ))}
          </div>
        )}

        {/* Products */}
        {products.length === 0 || (isAllView && sections.length === 0) ? (
          <div className="border-t py-24 text-center">
            <p className="eyebrow mb-4">Nothing here yet</p>
            <p className="mb-8 font-heading text-3xl leading-[0.95]">
              {/* A whole family with nothing in it is not a failed filter —
                  it is a shelf still being stocked. */}
              {emptyFamily ? (
                <>
                  New {emptyFamily.label} pieces are <em>on the way</em>
                </>
              ) : (
                <>
                  No pieces match this <em>filter</em>
                </>
              )}
            </p>
            <Link
              href="/shop"
              className="eyebrow inline-flex border border-foreground px-8 py-4 !text-foreground transition-colors hover:bg-foreground hover:!text-background"
            >
              Browse all
            </Link>
          </div>
        ) : isAllView ? (
          <div className="space-y-20 lg:space-y-32">
            {sections.map((section) => {
              const preview = section.items.slice(0, ALL_PREVIEW_COUNT);
              return (
                <section key={section.key}>
                  <SectionHeading
                    index={section.index}
                    eyebrow={`${section.items.length} ${section.items.length === 1 ? "piece" : "pieces"}`}
                    title={section.label}
                  />
                  <div className="mt-12">
                    <ProductGrid products={preview} />
                  </div>
                  <div className="mt-10">
                    <Link
                      href={`/shop?category=${section.key}`}
                      className="eyebrow inline-flex border border-foreground px-8 py-4 !text-foreground transition-colors hover:bg-foreground hover:!text-background"
                    >
                      See more
                    </Link>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
