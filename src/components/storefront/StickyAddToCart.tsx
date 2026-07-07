"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

interface StickyAddToCartProps {
  productId: string;
  title: string;
  price: number;
  image?: string;
  inStock: boolean;
  variantName?: string;
  needsVariantSelection?: boolean;
  /** Sentinel wrapping the primary AddToCartButton — the bar shows once it scrolls above the viewport. */
  sentinelRef: React.RefObject<HTMLElement | null>;
  /** Scrolled to when variants are required but none is selected. */
  variantSectionRef?: React.RefObject<HTMLElement | null>;
}

export function StickyAddToCart({
  productId,
  title,
  price,
  image,
  inStock,
  variantName,
  needsVariantSelection = false,
  sentinelRef,
  variantSectionRef,
}: StickyAddToCartProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only show once the primary button has scrolled ABOVE the viewport,
        // not while it is still below the fold.
        setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleClick = () => {
    if (needsVariantSelection) {
      variantSectionRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    if (!inStock) return;
    addItem({ productId, title, price, image, variantName });
    openCart();
    setAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur",
        "pb-[env(safe-area-inset-bottom)]",
        "transition-transform duration-300 [transition-timing-function:var(--ease-soft)]",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="relative size-12 shrink-0 overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={title}
              width={48}
              height={48}
              className="size-12 object-cover"
            />
          ) : (
            <span className="flex size-12 items-center justify-center font-heading text-lg text-muted-foreground/30">
              T
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base leading-tight">
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{formatPrice(price)}</p>
        </div>
        <Button
          onClick={handleClick}
          disabled={!inStock && !needsVariantSelection}
          className="h-10 rounded-none px-5 text-[11px] uppercase tracking-[0.2em]"
        >
          {!inStock && !needsVariantSelection ? (
            "Sold Out"
          ) : needsVariantSelection ? (
            "Choose an option"
          ) : added ? (
            <span className="animate-in zoom-in-95 duration-200">Added ✓</span>
          ) : (
            "Add to Bag"
          )}
        </Button>
      </div>
    </div>
  );
}
