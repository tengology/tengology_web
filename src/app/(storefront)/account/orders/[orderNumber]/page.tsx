import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

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

const statusClasses: Record<string, string> = {
  PAID: "bg-moss-light text-moss-dark",
  DELIVERED: "bg-moss-light text-moss-dark",
  SHIPPED: "bg-muted text-foreground",
  FULFILLING: "bg-muted text-foreground",
  PROCESSING: "bg-muted text-foreground",
  CANCELLED: "bg-clay/10 text-clay",
  REFUNDED: "bg-clay/10 text-clay",
  PAYMENT_FAILED: "bg-clay/10 text-clay",
  PENDING: "bg-muted text-muted-foreground",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const session = await auth();
  const { orderNumber } = await params;

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/account/orders/${orderNumber}`);
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: session.user.id,
    },
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
    },
  });

  if (!order) notFound();

  const address = parseAddress(order.shippingAddress);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <Link
        href="/account/orders"
        className="eyebrow transition-colors hover:text-foreground"
      >
        &larr; All orders
      </Link>
      <header className="mt-4 mb-10 border-t pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-4">Order</p>
            <h1 className="font-heading text-3xl leading-[0.95] sm:text-4xl">
              {order.orderNumber}
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Placed {order.createdAt.toLocaleDateString("en-GB")}
            </p>
          </div>
          <span
            className={cn(
              "inline-block rounded-none px-3 py-1 text-[11px] uppercase tracking-[0.1em]",
              statusClasses[order.status] ?? "bg-muted text-muted-foreground"
            )}
          >
            {statusLabels[order.status] ?? order.status}
          </span>
        </div>
      </header>

      <section className="mb-6 border divide-y">
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
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base leading-snug">
                {item.productTitleSnapshot}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Qty {item.quantity} &middot; {formatPrice(item.unitPrice)}
              </p>
            </div>
            <p className="text-sm">{formatPrice(item.totalPrice)}</p>
          </div>
        ))}
      </section>

      <section className="mb-6 border p-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className={cn(order.shippingCost === 0 && "text-moss")}>
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
        <div className="flex justify-between border-t pt-2 font-medium">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </section>

      {address && (
        <section className="mb-6 border p-4">
          <h2 className="eyebrow mb-3 text-foreground">Shipping to</h2>
          <p className="text-sm">
            {address.firstName} {address.lastName}
          </p>
          <p className="text-sm text-muted-foreground">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {address.city}
            {address.county ? `, ${address.county}` : ""} {address.postcode}
          </p>
          <p className="text-sm text-muted-foreground">{address.country}</p>
        </section>
      )}

      {(order.trackingNumber || order.shippingCarrier) && (
        <section className="mb-6 border p-4">
          <h2 className="eyebrow mb-3 text-foreground">Tracking</h2>
          {order.shippingCarrier && (
            <p className="text-sm">{order.shippingCarrier}</p>
          )}
          {order.trackingNumber && (
            <p className="font-mono text-sm">{order.trackingNumber}</p>
          )}
        </section>
      )}
    </div>
  );
}
