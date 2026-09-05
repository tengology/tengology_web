import Link from "next/link";
import type { Metadata } from "next";
import {
  PolicyPage,
  PolicySection,
} from "@/components/storefront/PolicyPage";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { getNumericSetting } from "@/lib/settings";
import {
  CONTACT_EMAIL,
  DISPATCH_DAYS_IN_STOCK,
  DISPATCH_DAYS_MADE_TO_ORDER,
  POLICIES_UPDATED,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Delivery",
  description:
    "Royal Mail tracked delivery from Oxford, worldwide. Rates, dispatch times, customs charges, and what to do if a parcel doesn't arrive.",
};

/**
 * Rates are read from the same table checkout prices against, so this page and
 * the basket can never quote different numbers. A hardcoded table here would
 * be wrong the first time the studio changed a price in the admin.
 */
async function deliveryRates() {
  const [methods, freeThreshold] = await Promise.all([
    prisma.shippingMethod
      .findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
      })
      .catch(() => []),
    getNumericSetting("freeShippingThreshold"),
  ]);
  return { methods, freeThreshold };
}

function estimate(minDays: number | null, maxDays: number | null): string {
  if (minDays && maxDays && minDays !== maxDays) return `${minDays}–${maxDays} working days`;
  const single = minDays ?? maxDays;
  if (single === 1) return "Next working day";
  if (single) return `${single} working days`;
  return "—";
}

export default async function ShippingPage() {
  const { methods, freeThreshold } = await deliveryRates();
  const domestic = methods.filter((m) => m.countries.split(",").includes("GB"));
  const abroad = methods.filter((m) => !m.countries.split(",").includes("GB"));

  return (
    <PolicyPage
      eyebrow="Delivery"
      title={
        <>
          Posted from <em>Oxford</em>
        </>
      }
      lead="Everything goes by Royal Mail, tracked, in packaging that is plain on the outside and padded on the inside. Orders leave the studio a few days after they are placed, because most of what you see here is made rather than picked off a shelf."
      updated={POLICIES_UPDATED}
    >
      <PolicySection title="How long before it is posted">
        <p>
          Pieces that are in stock leave the studio within{" "}
          {DISPATCH_DAYS_IN_STOCK}. Made-to-order pieces &mdash; the birthstone
          choker, anything from the designer &mdash; take {DISPATCH_DAYS_MADE_TO_ORDER},
          because they are strung once you have chosen.
        </p>
        <p>
          The delivery estimates below start from the day the parcel is handed
          over, not the day you ordered.
        </p>
      </PolicySection>

      <PolicySection title="Rates">
        {methods.length === 0 ? (
          <p>Delivery options are being updated. Please check back shortly.</p>
        ) : (
          <div className="space-y-8">
            <RateTable
              heading="United Kingdom"
              rows={domestic.map((m) => ({
                name: m.name,
                detail: m.description,
                price: formatMoney(m.price),
                estimate: estimate(m.minDays, m.maxDays),
              }))}
            />
            {abroad.length > 0 && (
              <RateTable
                heading="Rest of the world"
                rows={abroad.map((m) => ({
                  name: m.name,
                  detail: m.description,
                  price: formatMoney(m.price),
                  estimate: estimate(m.minDays, m.maxDays),
                }))}
              />
            )}
          </div>
        )}
        {freeThreshold > 0 && (
          <p>
            UK standard delivery is free once your basket reaches{" "}
            {formatMoney(freeThreshold)}. The free rate applies to standard
            delivery only &mdash; express stays chargeable, so an upgrade is
            never given away by accident.
          </p>
        )}
      </PolicySection>

      <PolicySection title="Customs and duties outside the UK">
        <p>
          Orders sent outside the UK may attract import duty, tax, or a
          handling fee on arrival. These are set by the destination country and
          are not included in what you pay here. They are the recipient&rsquo;s
          to settle, and I have no way to calculate or prepay them.
        </p>
        <p>
          A parcel refused at customs and returned to me will be refunded less
          the delivery cost and any charges Royal Mail passes on.
        </p>
      </PolicySection>

      <PolicySection title="If it does not arrive">
        <p>
          Every parcel is tracked, so the first step is the tracking link in
          your dispatch email, or the{" "}
          <Link href="/orders/lookup" className="link-underline text-foreground">
            order lookup
          </Link>{" "}
          if you checked out as a guest.
        </p>
        <p>
          Royal Mail does not treat a parcel as lost straight away: 10 working
          days after the due date for UK post, and 20 for international. Once
          that point is reached, tell me and I will either remake the piece or
          refund you &mdash; you do not have to chase Royal Mail yourself. If a
          one-of-a-kind piece cannot be remade, it is a refund.
        </p>
        <p>
          Do please check the address before you pay. A parcel sent to an
          address you gave me and delivered there is not lost, and I cannot
          refund it.
        </p>
      </PolicySection>

      <PolicySection title="Anything else">
        <p>
          Changed your mind rather than lost the parcel? That is the{" "}
          <Link href="/pages/returns" className="link-underline text-foreground">
            returns page
          </Link>
          . Anything else, write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline text-foreground">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

function RateTable({
  heading,
  rows,
}: {
  heading: string;
  rows: { name: string; detail: string | null; price: string; estimate: string }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="eyebrow mb-3 !text-foreground">{heading}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-md border-collapse text-left">
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t align-top">
                <td className="py-3 pr-4">
                  <span className="block text-foreground">{row.name}</span>
                  {row.detail && <span className="block">{row.detail}</span>}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">{row.estimate}</td>
                <td className="py-3 whitespace-nowrap text-foreground">{row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
