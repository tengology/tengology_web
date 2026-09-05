import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/storefront/PolicyPage";
import { CONTACT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Hallmarking",
  description:
    "The UK Dealer's Notice, and why Tengology's sterling silver ear hooks are below the weight at which a hallmark is required.",
};

/**
 * The Dealer's Notice, at the virtual point of sale.
 *
 * The Hallmarking Act 1973 requires anyone dealing in precious metal to
 * display a notice explaining the approved hallmarks. The British Hallmarking
 * Council's position is that this extends to selling online, and it publishes
 * Dealer's Notice B for exactly that. It is free from any of the four assay
 * offices.
 *
 * Set this to the notice image once it has been downloaded; until then the
 * page says plainly that it is outstanding rather than looking complete.
 */
const DEALERS_NOTICE_IMAGE: string | null = null;

export default function HallmarkingPage() {
  return (
    <PolicyPage
      eyebrow="Hallmarking"
      title={
        <>
          Silver, and the <em>marks</em> on it
        </>
      }
      lead="UK law protects you when you buy precious metal. This page explains the marks to look for, and is honest about why the pieces here do not carry one."
    >
      <PolicySection title="What a hallmark is">
        <p>
          A hallmark is struck by an independent UK assay office after the metal
          has been tested. It is not a maker&rsquo;s claim about their own work
          &mdash; it is a third party confirming the metal is what it is sold
          as. A full hallmark carries three compulsory marks: the
          sponsor&rsquo;s mark identifying who submitted it, the assay office
          mark, and the fineness mark giving the metal&rsquo;s purity in parts
          per thousand.
        </p>
      </PolicySection>

      <PolicySection title="Why these pieces are not hallmarked">
        <p>
          The Hallmarking Act 1973 sets a weight below which an article does not
          need to be hallmarked. For silver that threshold is{" "}
          <strong className="font-normal text-foreground">7.78 grams</strong>{" "}
          &mdash; and for gold 1 gram, palladium 1 gram, platinum 0.5 grams.
        </p>
        <p>
          The sterling silver in these earrings is the ear hooks. A pair weighs
          a fraction of a gram, far below the threshold, so they are exempt from
          hallmarking by law rather than by omission. That exemption is also
          what allows them to be described as sterling silver without a mark.
        </p>
      </PolicySection>

      <PolicySection title="What is actually used">
        <p>
          Ear hooks are sterling silver &mdash; 925 parts silver per thousand
          &mdash; or gold-plated sterling silver where the pair is gold. The
          smaller findings above them, the jump rings and wrapping wire, are
          plated alloy, and every listing says so in its own materials list
          rather than leaving you to guess.
        </p>
        <p>
          Where a piece is plated, it is described as plated. Plating is a
          surface, and it wears; the{" "}
          <Link href="/pages/faq" className="link-underline text-foreground">
            FAQ
          </Link>{" "}
          says how to make it last.
        </p>
      </PolicySection>

      <PolicySection title="The Dealer's Notice">
        <p>
          Anyone dealing in precious metal in the UK must display a notice
          explaining the approved hallmarks, whether they sell from a shop or
          online. This is that notice.
        </p>
        {DEALERS_NOTICE_IMAGE ? (
          <div className="border p-4">
            <Image
              src={DEALERS_NOTICE_IMAGE}
              alt="The British Hallmarking Council Dealer's Notice, showing the approved UK hallmarks and what each mark means"
              width={1200}
              height={1697}
              className="h-auto w-full"
            />
          </div>
        ) : (
          <div className="border border-dashed p-5">
            <p className="eyebrow mb-2 !text-foreground">Before launch</p>
            <p>
              The Dealer&rsquo;s Notice image still needs to be added. Download
              Dealer&rsquo;s Notice B &mdash; the version published for online
              sellers &mdash; free from any UK assay office, save it under{" "}
              <code className="text-foreground">public/legal/</code>, and set{" "}
              <code className="text-foreground">DEALERS_NOTICE_IMAGE</code> in
              this page to its path.
            </p>
          </div>
        )}
        <p>
          The notice is issued by the British Hallmarking Council and is
          available from the assay offices at Birmingham, Edinburgh, London and
          Sheffield.
        </p>
      </PolicySection>

      <PolicySection title="Questions about the metal">
        <p>
          If you would like to know exactly what is in a particular piece before
          you buy it, ask. Write to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="link-underline text-foreground"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          and I will tell you.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
