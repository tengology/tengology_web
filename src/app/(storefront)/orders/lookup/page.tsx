import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
}

function parseAddress(raw: string | null): ShippingAddress | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ShippingAddress;
  } catch {
    return null;
  }
}

const statusLabels: Record<string, string> = {
  PENDING: "Awaiting payment",
  PROCESSING: "Processing",
  PAID: "Paid",
  PAYMENT_FAILED: "Payment failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

function LookupForm({
  order,
  email,
}: {
  order?: string;
  email?: string;
}) {
  return (
    <form method="GET" action="/orders/lookup" className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="order">Order number</Label>
        <Input
          id="order"
          name="order"
          placeholder="e.g. TNG-20260101-ABCD"
          defaultValue={order ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="The email used at checkout"
          defaultValue={email ?? ""}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Find my order
      </Button>
    </form>
  );
}

export default async function OrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const { order: orderParam, email: emailParam } = await searchParams;
  const orderNumber = orderParam?.trim();
  const email = emailParam?.trim();

  let attempted = false;

  if (orderNumber && email) {
    attempted = true;

    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "local";
    const candidate = email.toLowerCase();

    // The IP limit alone is spoofable via X-Forwarded-For, so a per-email
    // limit and a global cap must all pass too. Any failure falls through to
    // the same generic not-found state below.
    const allowed =
      rateLimit(`lookup:${ip}`, 10, 15 * 60_000) &&
      rateLimit(`lookup:email:${candidate}`, 20, 15 * 60_000) &&
      rateLimit("lookup:global", 300, 15 * 60_000);

    if (allowed) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          user: true,
        },
      });

      const matches =
        order &&
        (order.guestEmail?.toLowerCase() === candidate ||
          order.user?.email?.toLowerCase() === candidate);

      if (order && matches) {
        const address = parseAddress(order.shippingAddress);

        return (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <Link
              href="/orders/lookup"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Look up another order
            </Link>
            <div className="mt-2 flex justify-between items-start mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Order
                </p>
                <h1 className="font-heading text-2xl font-light font-mono">
                  {order.orderNumber}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Placed {order.createdAt.toLocaleDateString("en-GB")}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-muted">
                {statusLabels[order.status] ?? order.status}
              </span>
            </div>

            <section className="border rounded-md divide-y mb-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4">
                  {item.product?.images?.[0]?.url && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={item.product.images[0].url}
                        alt={item.productTitleSnapshot}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {item.productTitleSnapshot}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity} &middot; {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </section>

            <section className="border rounded-md p-4 space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? "Free"
                    : formatPrice(order.shippingCost)}
                </span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </section>

            {address && (
              <section className="border rounded-md p-4 mb-6">
                <h2 className="text-xs tracking-[0.15em] uppercase font-medium mb-3">
                  Shipping to
                </h2>
                <p className="text-sm">
                  {address.firstName} {address.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.city}
                  {address.county ? `, ${address.county}` : ""}{" "}
                  {address.postcode}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.country}
                </p>
              </section>
            )}

            {(order.trackingNumber || order.shippingCarrier) && (
              <section className="border rounded-md p-4 mb-6">
                <h2 className="text-xs tracking-[0.15em] uppercase font-medium mb-3">
                  Tracking
                </h2>
                {order.shippingCarrier && (
                  <p className="text-sm">{order.shippingCarrier}</p>
                )}
                {order.trackingNumber && (
                  <p className="text-sm font-mono">{order.trackingNumber}</p>
                )}
              </section>
            )}
          </div>
        );
      }
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        Order lookup
      </p>
      <h1 className="font-heading text-2xl font-light mt-1 mb-3">
        Track your order
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        Enter your order number and the email address you used at checkout
        to see the status of your order. You&apos;ll find your order number
        in your confirmation email.
      </p>

      {attempted && (
        <div className="border rounded-md p-4 mb-6 text-sm text-muted-foreground">
          We couldn&apos;t find that order. Please double-check your order
          number and email address, then try again.
        </div>
      )}

      <LookupForm order={orderNumber} email={email} />
    </div>
  );
}
