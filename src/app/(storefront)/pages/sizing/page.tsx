import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PolicyPage, PolicySection, PolicyList } from "@/components/storefront/PolicyPage";
import { CONTACT_EMAIL, POLICIES_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Size guide",
  description:
    "How to measure your wrist for Tengology bracelets — 內圍 sizes from 15 to 19 cm, with a snug or looser fit.",
};

export default function SizingPage() {
  return (
    <PolicyPage
      eyebrow="Fit"
      title={
        <>
          Bracelet <em>size</em> guide
        </>
      }
      lead="A short note on measuring your wrist so the bracelet sits the way you want it."
      updated={POLICIES_UPDATED}
    >
      <PolicySection title="How to measure your wrist">
        <p>
          Measure around your wrist at the wrist bone &mdash; the narrow point
          just above where your hand begins. Use a soft tape, or a strip of
          paper you can mark and then measure against a ruler.
        </p>
        <p>
          Keep the tape snug but not digging in. That number is your wrist
          measurement.
        </p>
        <figure className="pt-2">
          <a
            href="/guides/wrist-measurement-en.png"
            target="_blank"
            rel="noopener noreferrer"
            className="block outline-none focus-visible:ring-2 focus-visible:ring-rose"
          >
            <Image
              src="/guides/wrist-measurement-en.png"
              width={1086}
              height={1449}
              sizes="(min-width: 768px) 420px, 100vw"
              alt="Two ways to measure your wrist: wrap a tape snugly around the narrowest part and read it, or wrap string or paper, mark where it meets and measure with a ruler."
              className="h-auto w-full max-w-md rounded-md border"
            />
          </a>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            Measure at the wrist bone. Open the full-size guide if the diagram helps.
          </figcaption>
        </figure>
      </PolicySection>

      <PolicySection title="Choosing a fit">
        <p>
          For a <strong className="font-normal text-foreground">snug</strong>{" "}
          fit, choose a bracelet whose inner circumference (內圍) matches your
          wrist measurement.
        </p>
        <p>
          For a slightly{" "}
          <strong className="font-normal text-foreground">looser</strong> fit,
          add about 1 cm to your wrist measurement and pick the nearest size.
        </p>
      </PolicySection>

      <PolicySection title="Listing sizes (內圍)">
        <p>
          Bracelet listings are sized by inner circumference &mdash; 內圍 &mdash;
          in centimetres:
        </p>
        <PolicyList
          items={[
            "15 cm",
            "16 cm",
            "17 cm",
            "18 cm",
            "19 cm",
            "20 cm when needed for a larger wrist",
          ]}
        />
        <p>
          If a listing shows a fixed size, that is the 內圍 of the finished
          piece. If you are between sizes, write to me and I will help you
          choose.
        </p>
      </PolicySection>

      <PolicySection title="Design your own">
        <p>
          In the{" "}
          <Link href="/designer/bracelet" className="link-underline text-foreground">
            bracelet designer
          </Link>
          , you enter your wrist measurement and the strand is built to fit.
          The same measure-at-the-bone rule applies.
        </p>
      </PolicySection>

      <PolicySection title="Something else">
        <p>
          Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline text-foreground">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
