import type { Metadata } from "next";
import {
  PolicyPage,
  PolicySection,
  PolicyList,
  LegalIdentity,
} from "@/components/storefront/PolicyPage";
import { CONTACT_EMAIL, POLICIES_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Tengology does with your details: what is collected, why, who it is shared with, how long it is kept, and how to get it deleted.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title={
        <>
          Your details, <em>plainly</em>
        </>
      }
      lead="A one-person studio does not need much about you, and does not want much. This says exactly what is collected, why, and how to get rid of it."
      updated={POLICIES_UPDATED}
    >
      <PolicySection title="Who holds your data">
        <LegalIdentity />
        <p>
          I am the data controller for everything described here, under the UK
          GDPR and the Data Protection Act 2018.
        </p>
      </PolicySection>

      <PolicySection title="What is collected">
        <PolicyList
          items={[
            <>
              <strong className="font-normal text-foreground">To send you an order:</strong>{" "}
              your name, delivery and billing address, email, and phone number
              if you give one.
            </>,
            <>
              <strong className="font-normal text-foreground">Your order history</strong>{" "}
              — what you bought, when, and what you paid.
            </>,
            <>
              <strong className="font-normal text-foreground">If you make an account:</strong>{" "}
              your email and a password, which is stored scrambled and cannot be
              read back, by me or anyone else.
            </>,
            <>
              <strong className="font-normal text-foreground">If you write a review or save a wishlist:</strong>{" "}
              the name you choose to show and what you wrote.
            </>,
          ]}
        />
        <p>
          Your card number is never collected. Payment happens inside
          Square&rsquo;s own form; all this site ever receives is a one-time
          token and, afterwards, the last four digits so you can recognise the
          payment.
        </p>
      </PolicySection>

      <PolicySection title="Why, and on what basis">
        <PolicyList
          items={[
            <>
              <strong className="font-normal text-foreground">To perform our contract</strong>{" "}
              — taking payment, making the piece, posting it, handling a return.
            </>,
            <>
              <strong className="font-normal text-foreground">Legal obligation</strong>{" "}
              — keeping sales records for HMRC.
            </>,
            <>
              <strong className="font-normal text-foreground">Legitimate interests</strong>{" "}
              — keeping the shop secure and preventing fraudulent orders.
            </>,
            <>
              <strong className="font-normal text-foreground">Consent</strong>{" "}
              — marketing email, and only if you ticked the box. Every one has
              an unsubscribe link, and unsubscribing does not affect your
              orders.
            </>,
          ]}
        />
      </PolicySection>

      <PolicySection title="Who else sees it">
        <p>
          Only the services needed to actually get a parcel to you. Each sees
          the minimum required, and none of them is allowed to use your details
          for their own marketing.
        </p>
        <PolicyList
          items={[
            <>
              <strong className="font-normal text-foreground">Square</strong> —
              payment processing. They receive your card details directly and
              the order total.
            </>,
            <>
              <strong className="font-normal text-foreground">Resend</strong> —
              sends order confirmations and dispatch notices. Receives your
              email address and order details.
            </>,
            <>
              <strong className="font-normal text-foreground">Royal Mail</strong>{" "}
              — receives your name and delivery address, printed on the label.
            </>,
            <>
              <strong className="font-normal text-foreground">Neon</strong> —
              hosts the database the shop runs on.
            </>,
          ]}
        />
        <p>
          Your details are not sold, rented, or shared with anyone else. If I am
          ever legally required to disclose something, I will, and I will tell
          you unless the law forbids it.
        </p>
      </PolicySection>

      <PolicySection title="How long it is kept">
        <p>
          Order and payment records are kept for six years after the end of the
          tax year they fall in, which is what HMRC requires. Account details
          are kept until you ask me to close the account. Marketing consent is
          kept until you withdraw it.
        </p>
      </PolicySection>

      <PolicySection title="Cookies">
        <p>
          Only the ones the shop cannot work without: what is in your basket,
          whether you are signed in, and the security token that stops someone
          submitting a form on your behalf. There is no advertising tracking and
          no third-party analytics on this site, which is why there is no cookie
          banner to dismiss.
        </p>
        <p>
          Your basket is also stored in your own browser so it survives a
          reload. Clearing your browser data clears it.
        </p>
      </PolicySection>

      <PolicySection title="What you can ask for">
        <p>
          You have the right to see the data I hold about you, correct it, have
          it deleted, restrict or object to how it is used, and receive it in a
          portable form. Where I rely on consent, you can withdraw it at any
          time.
        </p>
        <p>
          Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline text-foreground">
            {CONTACT_EMAIL}
          </a>{" "}
          and I will deal with it within one month. There is no charge. The one
          thing I cannot delete on request is a completed order record, because
          HMRC requires me to keep it &mdash; everything around it can go.
        </p>
      </PolicySection>

      <PolicySection title="If you are not happy with the answer">
        <p>
          Please tell me first and give me a chance to fix it. You also have the
          right to complain to the Information Commissioner&rsquo;s Office at
          ico.org.uk, or on 0303 123 1113.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
