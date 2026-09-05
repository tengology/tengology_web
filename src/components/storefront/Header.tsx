"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, Package, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart";
import { useHydrated } from "@/lib/use-hydrated";
import { CartDrawer } from "./CartDrawer";
import { cn } from "@/lib/utils";
import { CATEGORY_LIST } from "@/lib/taxonomy";

const navigation = [
  { name: "Shop", href: "/shop" },
  // Every material family, in taxonomy order.
  ...CATEGORY_LIST.map((c) => ({ name: c.label, href: `/shop?category=${c.key}` })),
  { name: "Design Your Own", href: "/designer/bracelet" },
  { name: "Crystal Guide", href: "/encyclopedia" },
];

/**
 * Destinations that are not a place to buy from. They ride in the mobile sheet
 * and the footer; the desktop row is already carrying every material family and
 * has no width left to spare.
 */
const secondaryNavigation = [{ name: "The Studio", href: "/studio" }];

/**
 * Scroll thresholds for the compact header. The gap between them must exceed
 * the height the nav row gives up (lg:h-20 -> h-16, i.e. 16px), otherwise
 * collapsing scrolls the page back under the threshold and the header
 * oscillates.
 */
const COLLAPSE_BELOW = 72;
const EXPAND_ABOVE = 24;

const tickerItems = [
  "Handmade in Oxford",
  "Small batch",
  "Wool felt & crystal",
  "Free UK delivery over £50",
  "Worldwide shipping",
];

/** One half of the marquee; two of them scroll seamlessly end to end. */
function TickerHalf({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex w-max shrink-0 items-center"
    >
      {Array.from({ length: 3 }).flatMap((_, round) =>
        tickerItems.map((text, i) => (
          <span
            key={`${round}-${i}`}
            className="eyebrow flex items-center whitespace-nowrap py-2.5"
          >
            {text}
            <span aria-hidden className="mx-8">
              &mdash;
            </span>
          </span>
        ))
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.totalItems());
  const isOpen = useCartStore((s) => s.isOpen);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);

  // The cart is restored from localStorage after hydration, so the badge stays
  // hidden on the first paint to keep server and client markup identical.
  const mounted = useHydrated();

  useEffect(() => {
    let frame = 0;
    const apply = () => {
      frame = 0;
      const y = window.scrollY;
      // Hysteresis. The header is in flow, so collapsing it makes the document
      // shorter and nudges the scroll position back up; with a single
      // threshold that lands under it again and the header flips every frame.
      // Separate thresholds, both clear of the 16px the row loses, give the
      // state somewhere stable to sit.
      setScrolled((was) => (was ? y > EXPAND_ABOVE : y > COLLAPSE_BELOW));
    };
    const onScroll = () => {
      // Coalesce to one update per frame — scroll fires far more often.
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Checkout drops the nav and ticker to keep the payment path distraction-free.
  const isCheckout = pathname.startsWith("/checkout");

  const bagButton = (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open bag${mounted && itemCount > 0 ? `, ${itemCount} items` : ""}`}
      className="relative inline-flex h-9 w-9 items-center justify-center transition-colors hover:text-moss"
    >
      <ShoppingBag className="h-5 w-5" />
      {mounted && itemCount > 0 && (
        <span
          key={itemCount}
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-foreground px-1 text-[10px] font-medium tabular-nums text-background motion-safe:animate-[badge-pop_300ms_var(--ease-snap)]"
        >
          {itemCount}
        </span>
      )}
    </button>
  );

  return (
    <header
      data-scrolled={scrolled ? "true" : undefined}
      style={
        { "--header-h": scrolled ? "4rem" : "5rem" } as React.CSSProperties
      }
      className={cn(
        "sticky top-0 z-50 bg-background/95 backdrop-blur transition-shadow supports-[backdrop-filter]:bg-background/85",
        scrolled && "shadow-[var(--shadow-soft)]"
      )}
    >
      {!isCheckout && (
        <div className="overflow-hidden border-b">
          <div className="flex w-max motion-safe:animate-[marquee_38s_linear_infinite] hover:[animation-play-state:paused]">
            <TickerHalf />
            <TickerHalf ariaHidden />
          </div>
        </div>
      )}

      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "flex items-center justify-between transition-[height] duration-300",
              scrolled ? "h-16" : "h-16 lg:h-20"
            )}
            style={{ transitionTimingFunction: "var(--ease-soft)" }}
          >
            {/* Mobile menu */}
            {!isCheckout ? (
              <div className="xl:hidden">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                  className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:text-moss"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="xl:hidden" />
            )}

            <Link href="/" className="flex-shrink-0" aria-label="Tengology — home">
              {/* The mark is black-on-transparent, so it reads on the warm white
                  header and on any light ground it might sit over later. Height
                  is fixed and width follows, which keeps the script from being
                  squashed when the row shrinks on scroll. */}
              <Image
                src="/tengology-logo.png"
                alt="Tengology"
                width={744}
                height={300}
                priority
                className={cn(
                  "w-auto transition-[height] duration-300",
                  scrolled ? "h-9" : "h-9 lg:h-14"
                )}
                style={{ transitionTimingFunction: "var(--ease-soft)" }}
              />
            </Link>

            {!isCheckout ? (
              <nav className="hidden items-center gap-5 xl:flex">
                {navigation.map((item) => {
                  const active =
                    item.href === "/shop"
                      ? pathname === "/shop"
                      : pathname.startsWith(item.href.split("?")[0]) &&
                        item.href.split("?")[0] !== "/shop";
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "link-underline eyebrow transition-colors hover:text-foreground",
                        active && "text-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            ) : (
              <span className="eyebrow hidden xl:block">Secure checkout</span>
            )}

            <div className="flex items-center gap-3">
              {!isCheckout && (
                <>
                  <Link
                    href="/orders/lookup"
                    aria-label="Track an order"
                    className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:text-moss"
                  >
                    <Package className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/account"
                    aria-label="My account"
                    className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:text-moss"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                </>
              )}
              {bagButton}
            </div>
          </div>
        </div>
      </div>

      {/* Cart drawer — opened from anywhere via the store */}
      {mounted && (
        <Sheet open={isOpen} onOpenChange={(o) => (o ? openCart() : closeCart())}>
          <SheetContent className="w-full data-[side=right]:sm:max-w-lg">
            <SheetTitle className="sr-only">Your bag</SheetTitle>
            <CartDrawer />
          </SheetContent>
        </Sheet>
      )}

      {/* Mobile navigation */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-full px-5 pb-6 sm:max-w-sm sm:px-6">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <nav className="flex flex-col gap-1 pt-4">
            {[...navigation, ...secondaryNavigation].map((item, i) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{ transitionDelay: `${i * 40}ms` }}
                className="border-t py-4 font-heading text-3xl leading-none transition-colors hover:text-moss"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3 border-t pt-5">
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="link-underline eyebrow text-foreground"
            >
              My account
            </Link>
            <Link
              href="/orders/lookup"
              onClick={() => setMobileOpen(false)}
              className="link-underline eyebrow text-foreground"
            >
              Track an order
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
