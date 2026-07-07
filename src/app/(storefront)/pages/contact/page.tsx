import Link from "next/link";
import { Reveal } from "@/components/storefront/Reveal";
import type { Metadata } from "next";

// TODO: replace with the studio's real contact address
const EMAIL = "hello@tengology.com";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Tengology — a small handmade studio in Oxford. Questions, custom requests, or just a hello, every message is read and answered personally.",
};

export default function ContactPage() {
  return (
    <div>
      {/* Header */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <p className="eyebrow mb-5">Get in touch</p>
          <h1 className="font-heading text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
            Say <em>hello</em>
          </h1>
        </div>
      </section>

      {/* Copy */}
      <section className="border-t">
        <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <Reveal>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Tengology is a small handmade studio in Oxford &mdash; every
              piece is designed, made, and packed by one pair of hands. If
              you have a question about a piece, an idea for something
              custom, or simply want to say hello, I&rsquo;d love to hear
              from you. I read and answer every message personally, usually
              within a couple of days.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact cards */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            <Reveal>
              <div className="border-t pt-5">
                <h2 className="eyebrow mb-3 !text-foreground">
                  Email the studio
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  For questions about a piece, materials, gifting, or custom
                  requests &mdash; write to me directly and I&rsquo;ll get
                  back to you within a couple of days.
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="link-underline eyebrow pb-1 text-foreground transition-colors hover:text-moss"
                >
                  {EMAIL}
                </a>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="border-t pt-5">
                <h2 className="eyebrow mb-3 !text-foreground">
                  Where is my order?
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  Already placed an order? Look it up with your order number
                  and email address for the latest update on where it is.
                </p>
                <Link
                  href="/orders/lookup"
                  className="link-underline eyebrow pb-1 text-foreground transition-colors hover:text-moss"
                >
                  Track your order
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
