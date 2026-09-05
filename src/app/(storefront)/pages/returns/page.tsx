import Link from "next/link";
import type { Metadata } from "next";
import {
  PolicyPage,
  PolicySection,
  PolicyList,
} from "@/components/storefront/PolicyPage";
import {
  CANCEL_NOTICE_DAYS,
  CANCEL_RETURN_DAYS,
  CONTACT_EMAIL,
  POLICIES_UPDATED,
  REFUND_DAYS,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Returns & Cancellations",
  description:
    "Fourteen days to change your mind, and fourteen more to post it back. How to return something to Tengology, what it costs, and what happens if a piece arrives faulty.",
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
      lead="Everything here is made by hand, so I would rather you had the piece you actually wanted. You have fourteen days from delivery to tell me you have changed your mind, and fourteen more to post it back."
      updated={POLICIES_UPDATED}
    >
      <PolicySection title="Changing your mind">
        <p>
          You have {CANCEL_NOTICE_DAYS} days from the day your parcel arrives to
          tell me you want to cancel. You do not need a reason. Once you have
          told me, you have a further {CANCEL_RETURN_DAYS} days to get the item
          back to me.
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
          way you would in a shop; a piece that has been worn out for an evening
          is a different matter, and I may reduce the refund to reflect its
          condition.
        </p>
      </PolicySection>

      <PolicySection title="Pieces that cannot be returned">
        <p>
          Two things are excluded, because they are made to your specification
          and cannot be sold to anyone else:
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
          ]}
        />
        <p>
          This is the personalised-goods exception in the Consumer Contracts
          Regulations 2013, and it is why it is written here rather than sprung
          on you afterwards. Everything else in the shop can be returned.
        </p>
        <p>
          It does not touch your rights if something arrives faulty. A
          personalised piece that is broken, wrong, or not as described is
          still my problem to fix.
        </p>
      </PolicySection>

      <PolicySection title="If something is faulty">
        <p>
          Tell me within 30 days of delivery and you can reject the piece
          outright for a full refund. After that, I will repair or replace it.
          These are your rights under the Consumer Rights Act 2015 and nothing
          on this page reduces them.
        </p>
        <p>
          Handmade work varies &mdash; a bead sits slightly differently, a felt
          petal curls its own way, natural stone is never twice the same colour.
          That is the nature of the thing rather than a fault. A clasp that
          fails or a hook that bends is a fault, and I want to know.
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
