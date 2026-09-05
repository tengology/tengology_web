import Link from "next/link";
import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/storefront/PolicyPage";
import {
  CONTACT_EMAIL,
  DISPATCH_DAYS_IN_STOCK,
  DISPATCH_DAYS_MADE_TO_ORDER,
  POLICIES_UPDATED,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about Tengology — materials, hallmarking, made-to-order times, care, gifts, and sensitive ears.",
};

export default function FaqPage() {
  return (
    <PolicyPage
      eyebrow="Questions"
      title={
        <>
          Things people <em>ask</em>
        </>
      }
      lead="If yours is not here, write to me — I answer every message myself."
      updated={POLICIES_UPDATED}
    >
      <PolicySection title="What is everything made of?">
        <p>
          Felt pieces use a mixture of 40% wool blend felt and 100% wool felt.
          Fabric pieces use Liberty cotton. Jewellery uses natural semi-precious
          stone and freshwater pearl, on sterling silver or gold-plated sterling
          silver ear hooks. Every listing names its own materials in full.
        </p>
      </PolicySection>

      <PolicySection title="Is the silver real, and why is there no hallmark?">
        <p>
          The ear hooks are sterling silver &mdash; gold-plated sterling silver
          where the pair is gold. They are far below the weight at which UK law
          requires a hallmark, which is 7.78 grams for silver, so they are
          legitimately exempt. The{" "}
          <Link href="/pages/hallmarking" className="link-underline text-foreground">
            hallmarking page
          </Link>{" "}
          explains this properly.
        </p>
      </PolicySection>

      <PolicySection title="I have sensitive ears.">
        <p>
          The hooks themselves are sterling silver or gold-plated sterling
          silver, which most people wear comfortably. The small findings above
          them &mdash; jump rings and wire &mdash; are plated alloy, and each
          listing says so. If you react to anything but surgical steel, write to
          me before ordering rather than after.
        </p>
      </PolicySection>

      <PolicySection title="How long until my order is posted?">
        <p>
          In-stock pieces leave within {DISPATCH_DAYS_IN_STOCK}. Made-to-order
          pieces take {DISPATCH_DAYS_MADE_TO_ORDER}, since they are strung after
          you choose. Delivery time is on top &mdash; see the{" "}
          <Link href="/pages/shipping" className="link-underline text-foreground">
            delivery page
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="Will I get the exact piece in the photograph?">
        <p>
          Where a piece is one of one, yes &mdash; that is the pair you will
          receive. Where several are made to the same design, yours will be very
          close but not identical: stone colour, felt dye and the cut of a
          printed fabric all vary. That is the point of handmade, and it is why
          nothing here looks machine-stamped.
        </p>
      </PolicySection>

      <PolicySection title="Can I order a piece that has sold out?">
        <p>
          Sometimes. Felt and fabric pieces can usually be made again, though a
          printed cotton cut a second time will fall differently, so the flowers
          will not land in the same places. One-of-a-kind jewellery cannot be
          remade &mdash; those stones were a single parcel and it is finished.
          Ask, and I will tell you honestly which it is.
        </p>
      </PolicySection>

      <PolicySection title="Can I have something made specially?">
        <p>
          Yes. The{" "}
          <Link href="/designer/bracelet" className="link-underline text-foreground">
            designer
          </Link>{" "}
          lets you lay out a strand yourself, and for anything beyond it just
          write to me. Bridal parties and matching sets are very welcome, and
          worth asking about early.
        </p>
      </PolicySection>

      <PolicySection title="How should I look after it?">
        <p>
          Take jewellery off before swimming, bathing and sleeping, and keep it
          away from perfume, hairspray and hand cream &mdash; plating dislikes
          all three. Store pieces apart so faceted beads cannot scratch softer
          stones. Felt is spot-clean only and will not survive a machine.
        </p>
      </PolicySection>

      <PolicySection title="Is it wrapped for a gift?">
        <p>
          Everything arrives already wrapped well enough to give as it is. Add a
          note at checkout and I will include a handwritten card, and leave the
          price out of the parcel.
        </p>
      </PolicySection>

      <PolicySection title="Can I buy in person?">
        <p>
          Some pieces are carried by independent shops around Oxfordshire and
          beyond &mdash; see{" "}
          <Link href="/pages/stockists" className="link-underline text-foreground">
            stockists
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="Something else">
        <p>
          Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline text-foreground">
            {CONTACT_EMAIL}
          </a>
          . For returns, see the{" "}
          <Link href="/pages/returns" className="link-underline text-foreground">
            returns page
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
