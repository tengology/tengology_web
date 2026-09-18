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
    "Common questions about Tengology — materials, hallmarking, made-to-order times, care, repairs, gifts, and sensitive ears.",
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
          Every listing names its own materials in full, so the answer for the
          piece you are actually looking at is on its own page. What I will say
          here is that I buy the best materials I can get, and I do not swap in
          something cheaper on the quiet because it would not be noticed.
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

      <PolicySection title="What does gold-filled mean?">
        <p>
          It is not plating. A thick layer of real gold is bonded under heat and
          pressure to a brass core &mdash; by the usual standard at least a
          twentieth of the item&rsquo;s weight, which is many times what plating
          lays down. It wears far better and lasts years longer.
        </p>
        <p>
          Where a piece is gold-filled, the findings come from Cooksongold, the
          Birmingham bullion dealer, so the stock is traceable and consistent
          batch to batch. Every listing says plainly which it is: gold-filled,
          gold-plated and solid gold are three different things at three
          different prices, and I will not blur them.
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

      <PolicySection title="Can I return a personalised piece?">
        <p>
          No, and this is the one exception worth knowing before you order. A
          birthstone choker strung with your initial, or a strand you laid out
          yourself in the designer, is made to you and cannot be sold to anyone
          else. Once it is made, it is yours.
        </p>
        <p>
          Everything else in the shop can be returned within 14 days. And if a
          personalised piece arrives faulty, damaged or not what you asked for,
          that is still mine to put right &mdash; personalisation does not
          change that. The{" "}
          <Link href="/pages/returns" className="link-underline text-foreground">
            returns page
          </Link>{" "}
          sets it out in full.
        </p>
      </PolicySection>

      <PolicySection title="How do I choose a bracelet size?">
        <p>
          Measure at the wrist bone. For a snug fit, match your wrist; for a
          slightly looser fit, add about 1 cm. Listings use 內圍 sizes from 15
          to 19 cm (20 when needed). The full note is on the{" "}
          <Link href="/pages/sizing" className="link-underline text-foreground">
            size guide
          </Link>
          .
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

      <PolicySection id="repair" title="If something needs a stitch">
        <p>
          Handmade pieces are made to be worn. If a clasp loosens or a cord
          gives way under ordinary use, write to me &mdash; most of the time I
          can put it right.
        </p>
      </PolicySection>

      <PolicySection title="Do you repair pieces?">
        <p>
          Yes, for work I have made. Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline text-foreground">
            {CONTACT_EMAIL}
          </a>{" "}
          with your order number (if you have it), a photo of the piece, and
          what happened. I will tell you honestly whether it is a free
          craftsmanship repair, a paid repair, or something I cannot take on.
        </p>
        <p>
          There is no lifetime free-repair promise. What follows is the fair
          way I look after pieces that leave this studio.
        </p>
      </PolicySection>

      <PolicySection title="What is free in the first 30 days?">
        <p>
          Within <strong>30 days of purchase</strong>, repairs for{" "}
          <strong>craftsmanship</strong> are free. That covers things like a
          cord that breaks in normal wear, a clasp that comes loose, or an
          assembly mistake on my side.
        </p>
        <p>
          It does <strong>not</strong> cover accidental damage, a piece that
          has been altered, or wear and tear beyond ordinary use &mdash; those
          sit under paid repair below.
        </p>
        <p>
          Your Consumer Rights Act rights for faulty goods are separate and
          unchanged; see the{" "}
          <Link href="/pages/returns" className="link-underline text-foreground">
            returns page
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="Who pays for postage on a free repair?">
        <p>
          You pay the postage to send the piece back to the studio &mdash;
          please use a tracked service and keep the receipt.
        </p>
        <p>
          Once it is repaired, I send it home again by{" "}
          <strong>UK Standard (tracked)</strong> at my cost. If you are outside
          the UK, or you want a faster service, write to me and we will sort
          the return postage before I post.
        </p>
      </PolicySection>

      <PolicySection title="What about after 30 days, or if I broke it?">
        <p>
          After 30 days &mdash; or sooner, if the break is accidental, from
          alteration, or from heavy wear &mdash; I still often repair the
          piece, as a <strong>paid</strong> job.
        </p>
        <p>
          Labour is <strong>£20 per hour</strong>, charged in short blocks
          (about <strong>15 minutes minimum, roughly £5</strong>), plus any
          materials. Postage both ways is yours to pay.
        </p>
        <p>I will quote before I start, so there are no surprises.</p>
      </PolicySection>

      <PolicySection title="Will you repair everything?">
        <p>
          Not always. Pieces that are pure resale, or that are not built as
          handmade structures from this studio, may be declined &mdash; I can
          only stand behind what I know how to remake properly.
        </p>
        <p>
          If I cannot take it on, I will say so plainly and still try to point
          you somewhere useful.
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
          . For returns and faulty goods, see the{" "}
          <Link href="/pages/returns" className="link-underline text-foreground">
            returns page
          </Link>
          . For craftsmanship repairs, see{" "}
          <Link href="/pages/faq#repair" className="link-underline text-foreground">
            repair
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
