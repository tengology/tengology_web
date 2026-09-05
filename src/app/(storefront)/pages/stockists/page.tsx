import Link from "next/link";
import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/storefront/PolicyPage";
import { CONTACT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Stockists",
  description:
    "The independent shops carrying Tengology, and how to stock it in yours.",
};

/**
 * Shops carrying the range, named with the studio's say-so.
 *
 * `town` is optional on purpose: a shop listed without one still appears
 * correctly, which is better than guessing a location and printing it wrong.
 */
interface Stockist {
  name: string;
  town?: string;
  /** The shop's own site, where it has one. */
  url?: string;
}

const STOCKISTS: Stockist[] = [
  { name: "The Shop Witney", town: "Witney, Oxfordshire" },
  { name: "Childrey Store", town: "Childrey, Oxfordshire" },
  { name: "Karen's Creation", town: "Caerphilly, near Cardiff" },
];

export default function StockistsPage() {
  return (
    <PolicyPage
      eyebrow="Stockists"
      title={
        <>
          Where to find it <em>in person</em>
        </>
      }
      lead="Photographs only get you so far with felt and stone. These independent shops carry the range, so you can pick a piece up and see how it catches the light."
    >
      <PolicySection title="Shops carrying Tengology">
        <ul className="space-y-4">
          {STOCKISTS.map((shop) => (
            <li key={shop.name} className="border-t pt-4">
              <span className="block text-foreground">
                {shop.url ? (
                  <a
                    href={shop.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline"
                  >
                    {shop.name}
                  </a>
                ) : (
                  shop.name
                )}
              </span>
              {shop.town && <span className="block">{shop.town}</span>}
            </li>
          ))}
        </ul>
        <p>
          What each shop holds varies, and it changes as things sell. The
          one-of-a-kind jewellery stays online, since there is only ever one of
          each. If you are travelling for something particular, ring the shop
          first &mdash; or ask me and I will find out for you.
        </p>
      </PolicySection>

      <PolicySection title="Stocking Tengology">
        <p>
          If you run an independent shop and would like to carry the range,
          I&rsquo;d be glad to hear from you. Wholesale is available on the felt,
          fabric and repeatable jewellery.
        </p>
        <p>
          Write to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="link-underline text-foreground"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          and tell me a little about the shop.
        </p>
      </PolicySection>

      <PolicySection title="Buying online">
        <p>
          Everything is in the{" "}
          <Link href="/shop" className="link-underline text-foreground">
            shop
          </Link>
          , posted from Oxford by tracked Royal Mail.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
