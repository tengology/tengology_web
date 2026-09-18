import { Reveal } from "@/components/storefront/Reveal";
import {
  CONTACT_EMAIL,
  PROPRIETOR,
  TRADING_ADDRESS,
  TRADING_NAME,
  hasLegalIdentity,
} from "@/lib/legal";

/**
 * Shared chrome for the policy pages.
 *
 * These pages are read when something has gone wrong — a parcel is late, a
 * clasp broke, someone wants their money back. They are set wider and plainer
 * than the editorial pages on purpose: the job is to be found and understood,
 * not admired.
 */

export function PolicyPage({
  eyebrow,
  title,
  lead,
  updated,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h1 className="font-heading text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {lead && (
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {lead}
            </p>
          )}
          {updated && (
            <p className="eyebrow mt-10">Last updated {updated}</p>
          )}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="space-y-14">{children}</div>
        </div>
      </section>
    </div>
  );
}

export function PolicySection({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-28 border-t pt-6">
        <h2 className="eyebrow mb-4 !text-foreground">{title}</h2>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </section>
    </Reveal>
  );
}

/** An unordered list in the same voice as the surrounding paragraphs. */
export function PolicyList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-5">
      {items.map((item, i) => (
        <li key={i} className="list-disc marker:text-border">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Who the trader is. Renders the real details once they exist, and until then
 * says plainly that they are missing — so an unfinished page can never be
 * mistaken for a finished one.
 */
export function LegalIdentity() {
  if (!hasLegalIdentity()) {
    return (
      <div className="border border-dashed p-5 text-sm leading-relaxed">
        <p className="eyebrow mb-2 !text-foreground">Before launch</p>
        <p className="text-muted-foreground">
          This page still needs the trader&rsquo;s name and a geographic
          trading address. UK law requires both to be published before selling
          at a distance, and a PO Box on its own is not enough. Set{" "}
          <code className="text-foreground">PROPRIETOR</code> and{" "}
          <code className="text-foreground">TRADING_ADDRESS</code> in{" "}
          <code className="text-foreground">src/lib/legal.ts</code>.
        </p>
      </div>
    );
  }

  return (
    <address className="not-italic">
      <span className="block text-foreground">{PROPRIETOR}</span>
      <span className="block">trading as {TRADING_NAME}</span>
      {TRADING_ADDRESS?.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="link-underline mt-2 inline-block text-foreground"
      >
        {CONTACT_EMAIL}
      </a>
    </address>
  );
}
