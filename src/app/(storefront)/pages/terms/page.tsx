import Link from "next/link";
import type { Metadata } from "next";
import {
  PolicyPage,
  PolicySection,
  PolicyList,
  LegalIdentity,
} from "@/components/storefront/PolicyPage";
import {
  CONTACT_EMAIL,
  POLICIES_UPDATED,
  TRADING_NAME,
  VAT_REGISTERED,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms you buy under at Tengology — who you are buying from, when the contract is made, how prices and stock work, and what happens if something goes wrong.",
};

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Terms"
      title={
        <>
          The <em>small print</em>
        </>
      }
      lead="Written to be read. These are the terms you buy under; nothing here takes away a right the law gives you, and where the two disagree, the law wins."
      updated={POLICIES_UPDATED}
    >
      <PolicySection title="Who you are buying from">
        <LegalIdentity />
      </PolicySection>

      <PolicySection title="When the contract is made">
        <p>
          Placing an order is an offer to buy, not yet a sale. The confirmation
          email that arrives straight afterwards is an acknowledgement that I
          have your order &mdash; it is not acceptance of it.
        </p>
        <p>
          The contract is made when I email to say your order has been
          dispatched. If I cannot fulfil an order &mdash; the last one sold
          moments earlier, or a piece turns out not to be up to standard &mdash;
          I will tell you and refund you in full. Nothing more is owed either
          way.
        </p>
      </PolicySection>

      <PolicySection title="Prices and payment">
        <p>
          Prices are in pounds sterling and include{" "}
          {VAT_REGISTERED ? "VAT" : "all taxes"}.{" "}
          {!VAT_REGISTERED &&
            "Tengology is not VAT registered, so no VAT is charged and none can be reclaimed on an order."}{" "}
          Delivery is added at checkout and shown before you pay.
        </p>
        <p>
          Card payments are handled by Square. Card details are entered into
          Square&rsquo;s own form and never reach this site&rsquo;s servers.
        </p>
        <p>
          Prices can change, but never after you have ordered. If a price is
          obviously wrong &mdash; a decimal point in the wrong place &mdash; I
          will contact you before dispatching rather than either charging the
          error or quietly cancelling.
        </p>
      </PolicySection>

      <PolicySection title="Stock, and pieces there is only one of">
        <p>
          Much of what is here exists once. The stones were bought as a single
          parcel, and when a piece sells it is gone; it will not be restocked
          and the design cannot be strung again in the same materials.
        </p>
        <p>
          Where a piece is one of one, the listing says so and the stock count
          shows it. Adding it to your basket does not reserve it &mdash; it is
          held for whoever completes checkout first.
        </p>
      </PolicySection>

      <PolicySection title="Handmade means variation">
        <p>
          Every piece is cut, stitched or strung by hand in Oxford. Natural
          stone varies in colour, clarity and marking; felt takes dye
          unevenly; a printed cotton cut twice will not give the same
          arrangement of flowers. Photographs are taken in daylight and are as
          close as I can get them, but screens differ.
        </p>
        <p>
          This variation is what you are buying, not a defect. Where a piece
          would be noticeably different from its photograph, the listing says
          so.
        </p>
      </PolicySection>

      <PolicySection title="Delivery and risk">
        <p>
          Delivery times, rates and lost-parcel procedure are on the{" "}
          <Link href="/pages/shipping" className="link-underline text-foreground">
            delivery page
          </Link>
          . Goods are at my risk until they are delivered to the address you
          gave.
        </p>
      </PolicySection>

      <PolicySection title="Returns and cancellation">
        <p>
          You have fourteen days from delivery to cancel, and fourteen more to
          send the item back. Personalised and bespoke pieces are excluded, and
          which ones and why is set out in full on the{" "}
          <Link href="/pages/returns" className="link-underline text-foreground">
            returns page
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="If something is wrong with a piece">
        <p>
          Under the Consumer Rights Act 2015 goods must be of satisfactory
          quality, fit for purpose, and as described. If they are not, you can
          reject them within 30 days for a full refund, and after that ask for a
          repair or replacement. Those rights sit alongside everything on this
          page.
        </p>
      </PolicySection>

      <PolicySection title="Care, and what jewellery cannot survive">
        <p>
          These are hand-strung pieces, not machine-made ones. To keep them
          well:
        </p>
        <PolicyList
          items={[
            "Take jewellery off before swimming, bathing or sleeping.",
            "Keep it away from perfume, hairspray and hand cream — plating dislikes all three.",
            "Store pieces apart, so faceted beads cannot scratch softer stones.",
            "Felt is spot-clean only. It will not survive a washing machine.",
          ]}
        />
        <p>
          Damage from ordinary wear and tear, or from any of the above, is not a
          fault. Ask me before you throw something away, though &mdash; a
          restring is often possible and usually cheap.
        </p>
      </PolicySection>

      <PolicySection title="Age">
        <p>
          Please be 18 or over to order. Several pieces contain small beads and
          are not toys; those intended for children are marked as such and
          should still be worn with an adult nearby.
        </p>
      </PolicySection>

      <PolicySection title="What I am not liable for">
        <p>
          I am responsible for loss you suffer that is a foreseeable result of
          my breaking these terms or failing to use reasonable care. I am not
          responsible for loss that was not foreseeable, or for business losses.
        </p>
        <p>
          Nothing here limits liability for death or personal injury caused by
          negligence, for fraud, or for anything else the law does not permit to
          be limited.
        </p>
      </PolicySection>

      <PolicySection title="Crystal traditions">
        <p>
          Where a listing describes a stone as grounding, calming or clarifying,
          it is repeating a traditional association because people enjoy them
          and because they often shape the choice of a gift. None of it is
          medical advice, and no piece sold here treats, cures or prevents
          anything. Please see a doctor for that.
        </p>
      </PolicySection>

      <PolicySection title="Complaints, and the law that applies">
        <p>
          If something has gone wrong, write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline text-foreground">
            {CONTACT_EMAIL}
          </a>{" "}
          and give me the chance to put it right. I answer every message
          myself, usually within a couple of days.
        </p>
        <p>
          These terms are governed by the law of England and Wales, and disputes
          may be brought in the courts of England and Wales. If you live in
          Scotland or Northern Ireland, you may also bring proceedings in your
          own courts.
        </p>
        <p>
          {TRADING_NAME} may update these terms; the version that applies to
          your order is the one published when you placed it.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
