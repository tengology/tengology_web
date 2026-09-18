import Link from "next/link";
import { CATEGORY_LIST } from "@/lib/taxonomy";

const footerLinks = {
  Shop: [
    { name: "All Products", href: "/shop" },
    ...CATEGORY_LIST.map((c) => ({
      name: c.label,
      href: `/shop?category=${c.key}`,
    })),
    { name: "Design Your Own", href: "/designer/bracelet" },
  ],
  Help: [
    { name: "Track Your Order", href: "/orders/lookup" },
    { name: "My Account", href: "/account" },
    { name: "Shipping", href: "/pages/shipping" },
    { name: "Returns", href: "/pages/returns" },
    { name: "Size guide", href: "/pages/sizing" },
    { name: "FAQ", href: "/pages/faq" },
    { name: "Repair", href: "/pages/faq#repair" },
    { name: "Contact", href: "/pages/contact" },
  ],
  About: [
    { name: "My Story", href: "/pages/about" },
    { name: "The Studio", href: "/studio" },
    { name: "Crystal Guide", href: "/encyclopedia" },
    { name: "Stockists", href: "/pages/stockists" },
  ],
};

/**
 * Policy pages, in the bottom bar rather than the link grid. They are looked
 * for deliberately when something has gone wrong, so they need to be findable
 * from every page — but they are not what the shop is for, and a fourth column
 * would crowd the three that are.
 */
const legalLinks = [
  { name: "Terms", href: "/pages/terms" },
  { name: "Privacy", href: "/pages/privacy" },
  { name: "Returns", href: "/pages/returns" },
  { name: "Delivery", href: "/pages/shipping" },
  { name: "Hallmarking", href: "/pages/hallmarking" },
];

const social = [
  { name: "Instagram", href: "https://instagram.com" },
  { name: "Facebook", href: "https://facebook.com" },
  { name: "TikTok", href: "https://tiktok.com" },
];

export function Footer() {
  return (
    <footer className="storefront-footer mt-auto border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand statement */}
          <div className="lg:col-span-6">
            <p className="eyebrow mb-5">Tengology</p>
            <h2 className="font-heading text-5xl leading-[1.1] sm:text-6xl">
              Made slowly, <em>in Oxford.</em>
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
              Handcrafted accessories and crystal jewellery. Every piece is cut,
              stitched, or threaded by hand — so no two are quite the same.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="eyebrow mb-5 text-foreground">{title}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="link-underline inline-flex min-h-9 items-center text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t pt-8">
          <nav className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-start">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="eyebrow inline-flex min-h-11 items-center transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="eyebrow">
            &copy; {new Date().getFullYear()} Tengology
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {social.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline inline-flex min-h-11 items-center text-sm font-medium text-foreground transition-colors hover:text-moss-dark"
              >
                {s.name}
              </a>
            ))}
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
