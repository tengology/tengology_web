"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { Minus, Plus, X } from "lucide-react";

interface Props {
  shipping: { baseRate: number; freeThreshold: number | null };
}

export function CartClient({ shipping }: Props) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalItems = useCartStore((s) => s.totalItems());

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center animate-in fade-in duration-500 sm:px-6 lg:px-8 lg:py-32">
        <p className="eyebrow mb-4">Your bag</p>
        <h1 className="font-heading text-5xl leading-[0.95] sm:text-6xl">
          Nothing here <em>yet</em>
        </h1>
        <p className="mt-6 text-muted-foreground">
          Discover something special.
        </p>
        <div className="mt-10 flex items-center justify-center gap-10">
          <Link
            href="/shop?category=JEWELLERY"
            className="link-underline eyebrow pb-1 text-foreground transition-colors hover:text-moss"
          >
            Jewellery
          </Link>
          <Link
            href="/shop?category=HAIR_ACCESSORIES"
            className="link-underline eyebrow pb-1 text-foreground transition-colors hover:text-moss"
          >
            Hair Accessories
          </Link>
        </div>
      </div>
    );
  }

  const threshold = shipping.freeThreshold;
  const remaining = threshold != null ? threshold - totalPrice : 0;
  const progress =
    threshold != null ? Math.min(100, (totalPrice / threshold) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <header className="border-t pt-6">
        <p className="eyebrow mb-4">Your bag</p>
        <h1 className="font-heading text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </h1>
      </header>

      <div className="mt-10 border-t">
        {items.map((item) => (
          <div
            key={`${item.productId}::${item.variantName ?? ""}`}
            className="flex gap-5 border-b py-6"
          >
            {item.image && (
              <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-lg leading-snug">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                &pound;{item.price.toFixed(2)}
              </p>
              <div className="mt-3 inline-flex items-center border">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1, item.variantName)
                  }
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-muted"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-sm tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1, item.variantName)
                  }
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-muted"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => removeItem(item.productId, item.variantName)}
                aria-label="Remove item"
                className="p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="text-sm">
                &pound;{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {threshold != null && (
        <div className="mt-8">
          <div className="h-0.5 w-full bg-muted">
            <div
              className="h-full bg-moss transition-[width] duration-500 ease-[var(--ease-soft)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          {remaining > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              &pound;{remaining.toFixed(2)} away from free shipping
            </p>
          ) : (
            <p className="mt-2 text-xs text-moss">Free shipping unlocked</p>
          )}
        </div>
      )}

      <div className="mt-8 flex items-baseline justify-between border-t pt-6">
        <span className="eyebrow">Subtotal</span>
        <span className="font-heading text-2xl">
          &pound;{totalPrice.toFixed(2)}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Shipping calculated at checkout
      </p>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <Button
          asChild
          className="h-12 w-full text-xs uppercase tracking-[0.2em]"
        >
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="link-underline eyebrow pb-1 text-foreground transition-colors hover:text-moss"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
