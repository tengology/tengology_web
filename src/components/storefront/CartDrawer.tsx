"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart";

export interface ShippingConfig {
  baseRate: number;
  freeThreshold: number | null;
}

export function CartDrawer({ shipping }: { shipping: ShippingConfig }) {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.totalPrice());
  const itemCount = useCartStore((s) => s.totalItems());

  const { freeThreshold } = shipping;
  const remaining = freeThreshold != null ? freeThreshold - subtotal : 0;
  const progress =
    freeThreshold != null && freeThreshold > 0
      ? Math.min(100, (subtotal / freeThreshold) * 100)
      : 0;

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? openCart() : closeCart())}>
      <SheetContent
        className="gap-0 bg-background p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        aria-label="Shopping bag"
      >
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="eyebrow">Your bag</p>
            <SheetTitle className="font-heading text-3xl font-normal leading-[0.95] sm:text-4xl">
              Your bag is <em>empty</em>
            </SheetTitle>
            <Link
              href="/shop"
              onClick={closeCart}
              className="eyebrow link-underline mt-2 text-foreground"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            {/* Heading */}
            <div className="border-b px-6 py-5 pr-14">
              <p className="eyebrow">Your bag</p>
              <SheetTitle className="mt-1 font-heading text-2xl font-normal leading-[0.95]">
                {itemCount} {itemCount === 1 ? "piece" : "pieces"}
              </SheetTitle>
            </div>

            {/* Line items */}
            <ul className="flex-1 divide-y overflow-y-auto">
              {items.map((item) => (
                <li
                  key={`${item.productId}:${item.variantName ?? ""}`}
                  className="flex gap-4 px-6 py-5"
                >
                  {item.image && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-heading text-lg leading-tight">
                          {item.title}
                        </p>
                        {item.variantName && (
                          <p className="eyebrow mt-1">{item.variantName}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.variantName)}
                        aria-label={`Remove ${item.title}`}
                        className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <div className="flex items-center border">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantName,
                            )
                          }
                          aria-label={`Decrease quantity of ${item.title}`}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variantName,
                            )
                          }
                          aria-label={`Increase quantity of ${item.title}`}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm tabular-nums">
                        &pound;{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Free shipping progress */}
            {freeThreshold != null && (
              <div className="border-t px-6 py-4">
                {remaining > 0 ? (
                  <>
                    <p className="eyebrow">
                      &pound;{remaining.toFixed(2)} away from free shipping
                    </p>
                    <div className="mt-3 h-px w-full bg-muted">
                      <div
                        className="h-px bg-moss transition-[width] duration-500 ease-[var(--ease-soft)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="eyebrow text-moss">Free shipping unlocked</p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="border-t px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Subtotal</span>
                <span className="font-heading text-xl tabular-nums">
                  &pound;{subtotal.toFixed(2)}
                </span>
              </div>
              <Button asChild className="mt-4 h-12 w-full text-[11px] uppercase tracking-[0.2em]">
                <Link href="/checkout" onClick={closeCart}>
                  Checkout
                </Link>
              </Button>
              <div className="mt-4 text-center">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="eyebrow link-underline text-foreground"
                >
                  View bag
                </Link>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
