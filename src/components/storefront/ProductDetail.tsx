"use client";

import { useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductGallery } from "./ProductGallery";
import { AddToCartButton } from "./AddToCartButton";
import { StickyAddToCart } from "./StickyAddToCart";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
}

interface ProductVariant {
  id: string;
  name: string;
  sortOrder: number;
  stockCount: number;
  imageUrl: string | null;
}

interface ProductTag {
  tagId: string;
  tag: { name: string };
}

interface ShippingInfo {
  baseRate: number;
  freeThreshold: number | null;
}

interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    shortDescription: string | null;
    fullDescription: string | null;
    materials: string;
    stockCount: number;
    lowStockThreshold: number;
    category: string;
    collection: string | null;
    images: ProductImage[];
    variants: ProductVariant[];
    tags: ProductTag[];
  };
  shipping?: ShippingInfo;
}

export function ProductDetail({ product, shipping }: ProductDetailProps) {
  const hasVariants = product.variants.length > 0;

  // Default: no variant pre-selected (user must choose) when product has variants
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const addToCartSentinelRef = useRef<HTMLDivElement>(null);
  const variantSectionRef = useRef<HTMLDivElement>(null);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId],
  );

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    if (variant.imageUrl) {
      const idx = product.images.findIndex((img) => img.url === variant.imageUrl);
      if (idx >= 0) setActiveImageIndex(idx);
    }
  };

  const totalStock = hasVariants
    ? product.variants.reduce((sum, v) => sum + v.stockCount, 0)
    : product.stockCount;

  const selectedVariantInStock = selectedVariant
    ? selectedVariant.stockCount > 0
    : !hasVariants && product.stockCount > 0;

  const inStockForButton = hasVariants ? selectedVariantInStock : totalStock > 0;

  const cartTitle = selectedVariant
    ? `${product.title} — ${selectedVariant.name}`
    : product.title;
  const cartImage =
    selectedVariant?.imageUrl ?? product.images[0]?.url ?? undefined;

  const trustLines = [
    "Handmade in Oxford",
    shipping?.freeThreshold != null
      ? `Free UK shipping over £${shipping.freeThreshold}`
      : shipping
        ? `UK shipping from £${shipping.baseRate}`
        : "Free UK shipping over £50",
    "Secure checkout via Square",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <ProductGallery
            images={product.images}
            title={product.title}
            activeIndex={activeImageIndex}
            onActiveIndexChange={setActiveImageIndex}
          />
        </div>

        <div className="self-start lg:sticky lg:top-[calc(var(--header-h,5rem)+1.5rem)]">
          <div className="space-y-7">
            <div>
              <p className="eyebrow mb-3">
                {product.collection || product.category.replace(/_/g, " ")}
              </p>
              <h1 className="font-heading text-4xl leading-[0.95] lg:text-5xl">
                {product.title}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span
                className={cn(
                  "text-xl",
                  product.compareAtPrice && "text-moss-dark",
                )}
              >
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p className="leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
            )}

            {hasVariants && (
              <div ref={variantSectionRef} className="scroll-mt-24">
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="eyebrow text-foreground">Choose</h3>
                  {selectedVariant && (
                    <span className="text-sm text-muted-foreground">
                      {selectedVariant.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;
                    const isSoldOut = variant.stockCount <= 0;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleVariantSelect(variant)}
                        disabled={isSoldOut}
                        className={cn(
                          "border px-4 py-2 text-xs uppercase tracking-[0.1em] transition-colors duration-150",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:border-foreground",
                          isSoldOut &&
                            "cursor-not-allowed line-through opacity-50 hover:border-border",
                        )}
                      >
                        {variant.name}
                        {isSoldOut && (
                          <span className="ml-2 text-[10px] normal-case">
                            sold out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              {selectedVariant ? (
                selectedVariant.stockCount > 0 ? (
                  selectedVariant.stockCount === 1 ? (
                    <span className="eyebrow inline-block bg-moss-light px-2 py-1 text-moss-dark">
                      Only 1 left — one of a kind
                    </span>
                  ) : (
                    <span className="eyebrow text-moss-dark">In stock</span>
                  )
                ) : (
                  <span className="eyebrow text-destructive">Sold out</span>
                )
              ) : hasVariants ? (
                <span className="eyebrow">
                  Select an option to see availability
                </span>
              ) : totalStock > 0 ? (
                totalStock <= product.lowStockThreshold ? (
                  <span className="eyebrow inline-block bg-moss-light px-2 py-1 text-moss-dark">
                    Only {totalStock} left
                  </span>
                ) : (
                  <span className="eyebrow text-moss-dark">In stock</span>
                )
              ) : (
                <span className="eyebrow text-destructive">Sold out</span>
              )}
            </div>

            <div ref={addToCartSentinelRef}>
              <AddToCartButton
                productId={product.id}
                title={cartTitle}
                price={product.price}
                image={cartImage}
                inStock={inStockForButton}
                variantName={selectedVariant?.name}
                needsVariantSelection={hasVariants && !selectedVariant}
              />
            </div>

            {/* Trust strip */}
            <ul className="border-t">
              {trustLines.map((line) => (
                <li key={line} className="eyebrow border-b py-2.5">
                  {line}
                </li>
              ))}
            </ul>

            {/* Exhibit caption table */}
            <dl>
              {product.materials && product.materials.length > 0 && (
                <div className="grid grid-cols-[7rem_1fr] gap-4 border-t py-3">
                  <dt className="eyebrow pt-0.5">Materials</dt>
                  <dd className="text-sm leading-relaxed">
                    {product.materials
                      .split(",")
                      .map((mat) => mat.trim())
                      .join(", ")}
                  </dd>
                </div>
              )}
              <div className="grid grid-cols-[7rem_1fr] gap-4 border-t border-b py-3">
                <dt className="eyebrow pt-0.5">Category</dt>
                <dd className="text-sm capitalize leading-relaxed">
                  {product.category.replace(/_/g, " ").toLowerCase()}
                </dd>
              </div>
            </dl>

            {product.fullDescription && (
              <div className="border-t pt-6">
                <h3 className="eyebrow mb-3 text-foreground">Description</h3>
                <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.fullDescription}
                </div>
              </div>
            )}

            {product.tags.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {product.tags.map((pt) => (
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

      <StickyAddToCart
        productId={product.id}
        title={cartTitle}
        price={product.price}
        image={cartImage}
        inStock={inStockForButton}
        variantName={selectedVariant?.name}
        needsVariantSelection={hasVariants && !selectedVariant}
        sentinelRef={addToCartSentinelRef}
        variantSectionRef={variantSectionRef}
      />
    </div>
  );
}
