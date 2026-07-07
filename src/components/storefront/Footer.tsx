import Link from "next/link";

const footerLinks = {
  Shop: [
    { name: "All Products", href: "/shop" },
    { name: "Hair Accessories", href: "/shop?category=HAIR_ACCESSORIES" },
    { name: "Jewellery", href: "/shop?category=JEWELLERY" },
    { name: "Christmas", href: "/shop?category=CHRISTMAS_ORNAMENTS" },
    { name: "Brooches", href: "/shop?category=BROOCHES" },
  ],
  Help: [
    { name: "Shipping", href: "/pages/shipping" },
    { name: "Returns", href: "/pages/returns" },
    { name: "FAQ", href: "/pages/faq" },
    { name: "Contact", href: "/pages/contact" },
  ],
  About: [
    { name: "Our Story", href: "/pages/about" },
    { name: "Stockists", href: "/pages/stockists" },
  ],
};

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com" },
  { name: "Facebook", href: "https://facebook.com" },
  { name: "TikTok", href: "https://tiktok.com" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-12">
          {/* Brand statement */}
          <div className="col-span-2 lg:col-span-6">
            <p className="eyebrow mb-6">Tengology</p>
            <h2 className="font-heading text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
              Made slowly, <em>in Oxford.</em>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Handcrafted accessories and jewellery, designed and made in
              Oxford. Each piece is unique and made with care.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-2">
              <h3 className="eyebrow mb-5 text-foreground">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal line */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t pt-8 sm:flex-row sm:items-center lg:mt-24">
          <p className="eyebrow">
            &copy; {new Date().getFullYear()} Tengology &mdash; All rights
            reserved
          </p>
          <div className="flex items-center gap-8">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow link-underline transition-colors hover:text-foreground"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
