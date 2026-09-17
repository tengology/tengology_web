import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Mail, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAccessibleOrder } from "@/lib/order-access";
import { formatMoney } from "@/lib/money";
import { formatAddress, parseAddress } from "@/lib/orders";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Order status | Tengology",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const params = await searchParams;

  if (!params.order) notFound();

  const access = await getAccessibleOrder(params.order, params.token);

  // A shopper who lands here without access still deserves a thank-you,
  // just without any order detail.
  if (!access) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <LockNotice />
        <h1 className="mb-3 font-heading text-3xl font-light">Check your order</h1>
        <p className="mb-8 leading-relaxed text-muted-foreground">
          Use your private order link, or look up your order using the email address you entered at checkout. We can&apos;t confirm a payment from this link alone.
        </p>
        <Button asChild>
          <Link href="/orders/lookup">Look up your order</Link>
        </Button>
      </div>
    );
  }

  const { order } = access;
  const address = parseAddress(order.shippingAddress);
  const isPaid = order.paymentStatus === "PAID";
  const confirmationEmail = await prisma.emailLog.findFirst({
    where: { orderId: order.id, template: "order-confirmation" },
    orderBy: { createdAt: "desc" },
    select: { status: true },
  });
  const emailSent = confirmationEmail?.status === "SENT";

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="mb-10 text-center">
        {isPaid ? <CheckCircle2 className="mx-auto mb-5 h-12 w-12 text-emerald-600" /> : <Clock className="mx-auto mb-5 h-12 w-12 text-amber-600" />}
        <h1 className="mb-2 font-heading text-3xl font-light">Thank you, {address?.firstName ?? "friend"}</h1>
        <p className="text-muted-foreground">
          Your order <span className="font-mono text-foreground">{order.orderNumber}</span> is
          {isPaid ? "paid and confirmed." : "not confirmed as paid."}
        </p>
      </div>

      {!isPaid && (
        <div className="mb-6 flex items-start gap-3 rounded-sm border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Payment status: {order.paymentStatus.toLowerCase().replaceAll("_", " ")}</p>
            <p>Check the order status below. If your bank shows a charge, contact us before paying again.</p>
          </div>
        </div>
      )}

      <div className="rounded-sm border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Status</p>
            <p className="text-sm font-medium">{ORDER_STATUS_LABELS[order.status] ?? order.status}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Total</p>
            <p className="text-sm font-medium">{formatMoney(order.total, order.currency)}</p>
          </div>
        </div>

        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-muted">
                {item.productImageSnapshot ? (
                  <Image
                    src={item.productImageSnapshot}
                    alt={item.productTitleSnapshot}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{item.productTitleSnapshot}</p>
                <p className="text-xs text-muted-foreground">Quantity {item.quantity}</p>
              </div>
              <p className="text-sm">{formatMoney(item.totalPrice, order.currency)}</p>
            </div>
          ))}
        </div>

        <dl className="space-y-2 border-t p-5 text-sm">
          <Row label="Subtotal" value={formatMoney(order.subtotal, order.currency)} />
          {order.discountAmount > 0 && (
            <Row
              label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`}
              value={`−${formatMoney(order.discountAmount, order.currency)}`}
            />
          )}
          <Row
            label={`Delivery${order.shippingMethodName ? ` — ${order.shippingMethodName}` : ""}`}
            value={order.shippingCost === 0 ? "Free" : formatMoney(order.shippingCost, order.currency)}
          />
          {order.taxAmount > 0 && <Row label="VAT" value={formatMoney(order.taxAmount, order.currency)} />}
          <div className="flex justify-between border-t pt-2 font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(order.total, order.currency)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm border p-5">
          <h2 className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            Delivering to
          </h2>
          <address className="text-sm not-italic leading-relaxed text-muted-foreground">
            {formatAddress(address).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>

        <div className="rounded-sm border p-5">
          <h2 className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {emailSent ? "Confirmation email submitted" : "Order contact email"}
          </h2>
          <p className="text-sm text-muted-foreground">{order.email}</p>
          <p className="mt-2 text-xs text-muted-foreground">{emailSent ? "Your confirmation has been sent to our email provider. Check your inbox and junk folder." : "We haven't confirmed that your email was sent. Keep this page and use the order tracking link below."}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Everything is handmade, so please allow a few days before dispatch. We&apos;ll email you
            tracking as soon as it ships.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link
            href={
              access.isOwner
                ? `/account/orders/${order.orderNumber}`
                : `/orders/${order.orderNumber}?token=${order.guestToken ?? ""}`
            }
          >
            Track this order
          </Link>
        </Button>
      </div>

      {!access.isOwner && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Bookmark this page or keep your confirmation email — it&apos;s how you&apos;ll check on
          this order without an account.
        </p>
      )}
    </div>
  );
}

function LockNotice() {
  return <Package className="mx-auto mb-6 h-12 w-12 text-muted-foreground" />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
