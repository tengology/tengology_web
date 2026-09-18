import Link from "next/link";
import type { Metadata } from "next";
import {
  PolicyPage,
  PolicySection,
  PolicyList,
} from "@/components/storefront/PolicyPage";
import {
  CANCEL_NOTICE_DAYS,
  CONTACT_EMAIL,
  POLICIES_UPDATED,
  REFUND_DAYS,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Returns & Cancellations",
  description:
    "Fourteen days from delivery to tell me you have changed your mind, then please post the piece back promptly. How to return something to Tengology, what it costs, and what happens if a piece arrives faulty.",
};

export default function ReturnsPage() {
  return (
    <PolicyPage
      eyebrow="Returns"
      title={
        <>
          If it isn&rsquo;t <em>right</em>
        </>
      }
      lead="Everything here is made by hand, so I would rather you had the piece you actually wanted. You have fourteen days from delivery to tell me you have changed your mind, and then please post the piece back promptly."
      updated={POLICIES_UPDATED}
    >
      <PolicySection title="Changing your mind">
        <p>
          You have {CANCEL_NOTICE_DAYS} days from the day your parcel arrives to
          tell me you have changed your mind. You do not need a reason. Once you
          have told me, please post the piece back as soon as you can.
        </p>
        <p>
          Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline text-foreground">
            {CONTACT_EMAIL}
          </a>{" "}
          with your order number and what you would like to send back. A message
          is enough &mdash; there is no form to fill in.
        </p>
      </PolicySection>

      <PolicySection title="What it costs">
        <p>
          Return postage for a change of mind is yours to pay. Please use a
          tracked service and keep the receipt: until the parcel reaches me it
          is still your responsibility, and without tracking neither of us can
          prove where it went.
        </p>
        <p>
          If a piece is faulty, damaged in transit, or simply not what you
          ordered, the postage is mine. Do not pay to send it back &mdash; tell
          me first and I will cover it.
        </p>
      </PolicySection>

      <PolicySection title="The condition it comes back in">
        <p>
          Please return pieces unworn and in their original packaging, with any
          card or tag still attached. You are welcome to try something on the
          way you would in a shop &mdash; that is enough to see if it suits you.
        </p>
        <p>
          If a piece has already been worn, or taken out for an evening, it is
          no longer in new condition. I cannot accept it for a change-of-mind
          refund, and I will decline the return.
        </p>
        <p>
          This applies only when you are changing your mind. If something is
          faulty, damaged in transit, or not what you ordered, your rights are
          unchanged &mdash; see{" "}
          <strong className="font-normal text-foreground">If something is faulty</strong>{" "}
          below.
        </p>
      </PolicySection>

      <PolicySection title="Pieces that cannot be returned">
        <p>
          A few pieces cannot come back for a change of mind:
        </p>
        <PolicyList
          items={[
            <>
              The <strong className="font-normal text-foreground">Birthstone &amp; Initial Choker</strong>,
              once strung with the letter you chose.
            </>,
            <>
              <strong className="font-normal text-foreground">Bespoke designs</strong>{" "}
              made in the online designer to a strand you laid out yourself.
            </>,
            <>
              <strong className="font-normal text-foreground">Earrings</strong>{" "}
              &mdash; for hygiene reasons, earrings cannot be returned. Please
              choose carefully before you order.
            </>,
          ]}
        />
        <p>
          The first two are the personalised-goods exception in the Consumer
          Contracts Regulations 2013 &mdash; made to your specification and
          cannot be sold to anyone else. Earrings are held back for hygiene.
          Everything else in the shop can be returned unused and as new.
        </p>
        <p>
          It does not touch your rights if something arrives faulty. A
          personalised piece or a pair of earrings that is broken, wrong, or
          not as described is still my problem to fix.
        </p>
      </PolicySection>

      <PolicySection title="If something is faulty">
        <p>
          If something is wrong within{" "}
          <strong className="font-normal text-foreground">30 days of purchase</strong>{" "}
          &mdash; a craftsmanship fault, damage in transit, or not what you
          ordered &mdash; write to me with a photo and your order number if you
          have it.
        </p>
        <p>
          I will usually offer to{" "}
          <strong className="font-normal text-foreground">repair</strong> it
          first. If I cannot put it right, you can have a{" "}
          <strong className="font-normal text-foreground">refund</strong>. We
          agree{" "}
          <strong className="font-normal text-foreground">one fair remedy</strong>{" "}
          for the same issue: you will not receive a full refund and a repair or
          replacement together.
        </p>
        <p>
          If you would rather return an{" "}
          <strong className="font-normal text-foreground">unused</strong> faulty
          piece for a refund in those first 30 days, your short-term right to
          reject still applies &mdash; tell me, and we will sort it that way
          instead.
        </p>
        <p>
          Damage from accident, alteration or misuse after delivery is not
          treated as a fault &mdash; I can still quote a paid repair if you want.
        </p>
        <p>
          Handmade work varies &mdash; a bead sits slightly differently, a felt
          petal curls its own way, natural stone is never twice the same colour.
          That is the nature of the thing rather than a fault. A clasp that
          fails or a hook that bends is a fault, and I want to know.
        </p>
        <p>
          These are your rights under the Consumer Rights Act 2015, and nothing
          on this page reduces them. For how studio repairs work after purchase
          &mdash; what is free in the first 30 days, paid repairs, and postage
          &mdash; see the{" "}
          <Link href="/pages/faq#repair" className="link-underline text-foreground">
            repair section of the FAQ
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="Getting your money back">
        <p>
          Refunds go back to the card or account you paid with, within{" "}
          {REFUND_DAYS} days of the item reaching me. I refund what you paid for
          the piece plus the standard delivery charge; if you chose express
          delivery, I refund the standard rate rather than the upgrade.
        </p>
        <p>
          Bank clearing usually adds a couple of days at the far end, which is
          out of my hands.
        </p>
      </PolicySection>

      <PolicySection title="Anything else">
        <p>
          If a parcel has not arrived, start on the{" "}
          <Link href="/pages/shipping" className="link-underline text-foreground">
            delivery page
          </Link>{" "}
          &mdash; it explains how long to wait before a parcel counts as lost.
          For anything not covered here, just{" "}
          <Link href="/pages/contact" className="link-underline text-foreground">
            write to me
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
