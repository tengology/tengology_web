import { ProductGallery } from "@/components/storefront/ProductGallery";
import { ProductFocusProvider } from "@/components/storefront/ProductFocusContext";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { auth } from "@/lib/auth";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { InitialLetterPicker } from "@/components/storefront/InitialLetterPicker";
import { ProductChoicePicker } from "@/components/storefront/ProductChoicePicker";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { bucketLabel } from "@/lib/taxonomy";
import { hasInitialLetterOption, isFunctionalTag } from "@/lib/personalisation";
import { productChoiceFor } from "@/lib/productOptions";
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
        tags: { include: { tag: true } },
      },
    });
  } catch {
    notFound();
  }

  if (!product) notFound();

  const price = product.price;
  const visibleTags = product.tags.filter((pt) => !isFunctionalTag(pt.tag.slug));
  /** A single made-to-order choice, for listings that merged several pieces. */
  const choice = productChoiceFor(product.slug);

  const session = await auth();
  const isSaved = session?.user?.id
    ? Boolean(
        await prisma.wishlistItem.findUnique({
          where: { userId_productId: { userId: session.user.id, productId: product.id } },
          select: { id: true },
        })
      )
    : false;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* The provider spans both columns so the options can drive the gallery. */}
      <ProductFocusProvider>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Details */}
        <div className="lg:sticky lg:top-[calc(var(--header-h,5rem)+1.5rem)] lg:self-start lg:py-8">
          <div className="space-y-6">
            <div className="border-t pt-6">
              <p className="eyebrow mb-4">
                {product.collection ||
                  bucketLabel(product.category, product.subcategory) ||
                  product.category.replace(/_/g, " ")}
              </p>
              <h1 className="font-heading text-4xl leading-[0.95] lg:text-5xl">
                {product.title}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-xl tabular-nums">{formatPrice(price)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Stock status */}
            <div className="text-sm">
              {product.stockCount > 0 ? (
                product.stockCount <= product.lowStockThreshold ? (
                  <span className="eyebrow bg-moss-light px-2 py-1 !text-moss-dark">
                    Only {product.stockCount} left
                  </span>
                ) : (
                  <span className="eyebrow !text-moss">In stock</span>
                )
              ) : (
                <span className="eyebrow !text-destructive">Sold out</span>
              )}
            </div>

            <div className="space-y-2">
              {hasInitialLetterOption(product.tags) ? (
                <InitialLetterPicker
                  productId={product.id}
                  title={product.title}
                  price={price}
                  inStock={product.stockCount > 0}
                />
              ) : choice ? (
                <ProductChoicePicker
                  productId={product.id}
                  title={product.title}
                  price={price}
                  inStock={product.stockCount > 0}
                  choice={choice}
                />
              ) : (
                <AddToCartButton
                  productId={product.id}
                  title={product.title}
                  price={price}
                  image={product.images[0]?.url}
                  inStock={product.stockCount > 0}
                />
              )}
              <WishlistButton
                productId={product.id}
                productSlug={product.slug}
                initiallySaved={isSaved}
                isSignedIn={Boolean(session?.user?.id)}
              />
            </div>

            {/* Materials */}
            {product.materials && product.materials.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="eyebrow mb-3">
                  Materials
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.split(",").map((mat) => (
                    <span
                      key={mat.trim()}
                      className="eyebrow bg-muted px-2 py-1"
                    >
                      {mat.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.fullDescription && (
              <div className="border-t pt-6">
                <h3 className="eyebrow mb-4">
                  Description
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.fullDescription}
                </div>
              </div>
            )}

            {/* Tags */}
            {visibleTags.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex flex-wrap gap-2">
                  {visibleTags.map((pt) => (
                    <span
                      key={pt.tagId}
                      className="text-xs text-muted-foreground"
                    >
                      #{pt.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </ProductFocusProvider>
    </div>
  );
}
