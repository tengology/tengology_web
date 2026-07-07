import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SectionHeading } from "@/components/storefront/SectionHeading";
import { Reveal } from "@/components/storefront/Reveal";
import { getShippingZone } from "@/lib/shipping";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { seo: true },
    });
    if (!product) return { title: "Not Found" };
    return {
      title: product.seo?.metaTitle || product.title,
      description:
        product.seo?.metaDescription ||
        product.shortDescription ||
        product.fullDescription?.slice(0, 160),
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await prisma.product.findUnique({
      where: { slug, isPublished: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
    });
  } catch {
    notFound();
  }

  if (!product) notFound();

  const shipping = await getShippingZone();

  let related: {
    id: string;
    slug: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    images: { url: string }[];
  }[] = [];
  const relatedQuery = {
    include: {
      images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
    },
    orderBy: { createdAt: "desc" as const },
  };
  try {
    related = await prisma.product.findMany({
      where: {
        isPublished: true,
        isArchived: false,
        category: product.category,
        id: { not: product.id },
      },
      take: 4,
      ...relatedQuery,
    });
  } catch {
    // Fallback for a running Prisma client generated before `isArchived`
    // existed: filter archived products in JS instead.
    try {
      const candidates = await prisma.product.findMany({
        where: {
          isPublished: true,
          category: product.category,
          id: { not: product.id },
        },
        take: 12,
        ...relatedQuery,
      });
      related = candidates.filter((p) => !p.isArchived).slice(0, 4);
    } catch {
      related = [];
    }
  }

  return (
    <>
      <ProductDetail product={product} shipping={shipping} />

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <SectionHeading
            eyebrow="More from the studio"
            title="You may also like"
          />
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard
                  slug={p.slug}
                  title={p.title}
                  price={p.price}
                  compareAtPrice={p.compareAtPrice}
                  image={p.images[0]?.url}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
