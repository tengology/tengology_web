"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart";
import { CartDrawer, type ShippingConfig } from "@/components/storefront/CartDrawer";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

const navigation = [
  { name: "Shop", href: "/shop" },
  { name: "Hair Accessories", href: "/shop?category=HAIR_ACCESSORIES" },
  { name: "Jewellery", href: "/shop?category=JEWELLERY" },
  { name: "Christmas", href: "/shop?category=CHRISTMAS_ORNAMENTS" },
  { name: "Brooches", href: "/shop?category=BROOCHES" },
];

function TickerHalf({
  items,
  ariaHidden = false,
}: {
  items: string[];
  ariaHidden?: boolean;
}) {
  return (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex w-max shrink-0 items-center"
    >
      {Array.from({ length: 4 }).flatMap((_, r) =>
        items.map((text, i) => (
          <span
            key={`${r}-${i}`}
            className="eyebrow flex items-center whitespace-nowrap py-2.5"
          >
            {text}
            <span aria-hidden className="mx-8">
              &mdash;
            </span>
          </span>
        )),
      )}
    </div>
  );
}

export function Header({ shipping }: { shipping: ShippingConfig }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);

  // false during SSR/hydration, true afterwards — keeps the persisted cart
  // badge from mismatching the server-rendered HTML.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isCheckout = pathname.startsWith("/checkout");

  const tickerItems = [
    "Handmade in Oxford",
    "Small batch",
    "Wool felt & crystal",
    ...(shipping.freeThreshold != null
      ? [`Free UK shipping over £${shipping.freeThreshold}`]
      : []),
  ];

  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    if (query) return false; // category filters share /shop — only the bare Shop link marks active
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const bagButton = (
    <button
      type="button"
      onClick={openCart}
      aria-label="Open bag"
      className="relative inline-flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:text-moss"
    >
      <ShoppingBag className="h-5 w-5" />
      {mounted && itemCount > 0 && (
        <span
          key={itemCount}
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-foreground px-0.5 text-[10px] tabular-nums leading-none text-background motion-safe:animate-[badge-pop_300ms_var(--ease-snap)]"
        >
          {itemCount}
        </span>
      )}
    </button>
  );

  return (
    <header
      data-scrolled={scrolled ? "" : undefined}
      style={{ "--header-h": scrolled ? "4rem" : "5rem" } as React.CSSProperties}
      className={cn(
        "sticky top-0 z-50 border-b bg-background transition-[box-shadow,border-color] duration-300",
        scrolled
          ? "border-border shadow-[var(--shadow-soft)]"
          : "border-border/50",
      )}
    >
      {/* Ticker strip */}
      {!isCheckout && (
        <div className="overflow-hidden border-b bg-background">
          <div className="flex w-max hover:[animation-play-state:paused] motion-safe:animate-[marquee_30s_linear_infinite]">
            <TickerHalf items={tickerItems} />
            <TickerHalf items={tickerItems} ariaHidden />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex h-16 items-center justify-between transition-[height] duration-300 ease-[var(--ease-soft)]",
            scrolled ? "lg:h-16" : "lg:h-20",
          )}
        >
          {/* Mobile menu */}
          {!isCheckout && (
            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                  aria-label="Open menu"
                  className="inline-flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:text-moss"
                >
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="group gap-0 bg-background p-0 data-[side=left]:w-full data-[side=left]:sm:max-w-sm"
                >
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <div className="flex h-full flex-col">
                    <div className="border-b px-6 py-5">
                      <span className="eyebrow">Menu</span>
                    </div>
                    <nav className="flex-1 overflow-y-auto px-6 py-10">
                      <ul className="space-y-6">
                        {navigation.map((item, i) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="block font-heading text-3xl leading-[0.95] transition-[opacity,translate] duration-500 ease-[var(--ease-soft)] group-data-starting-style:translate-y-3 group-data-starting-style:opacity-0"
                              style={{ transitionDelay: `${i * 60}ms` }}
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    <div className="divide-y border-t">
                      <Link
                        href="/auth/signin"
                        onClick={() => setMobileOpen(false)}
                        className="eyebrow flex items-center gap-3 px-6 py-4 text-foreground transition-colors hover:text-moss"
                      >
                        <User className="h-4 w-4" />
                        Account
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          openCart();
                        }}
                        className="eyebrow flex w-full items-center gap-3 px-6 py-4 text-foreground transition-colors hover:text-moss"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Bag{mounted && itemCount > 0 ? ` (${itemCount})` : ""}
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-heading text-xl uppercase tracking-[0.25em] lg:text-2xl">
              Tengology
            </span>
          </Link>

          {/* Desktop nav */}
          {!isCheckout && (
            <nav className="hidden items-center gap-8 lg:flex">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "eyebrow link-underline transition-colors",
                      active ? "text-foreground" : "hover:text-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isCheckout && (
              <Link
                href="/auth/signin"
                aria-label="Account"
                className="inline-flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:text-moss"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
            {bagButton}
          </div>
        </div>
      </div>

      {mounted && <CartDrawer shipping={shipping} />}
    </header>
  );
}
