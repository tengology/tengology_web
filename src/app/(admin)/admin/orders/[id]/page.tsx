import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { OrderActions } from "./order-actions";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  FULFILLING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-200 text-green-900",
  CANCELLED: "bg-gray-100 text-gray-800",
  REFUNDED: "bg-red-100 text-red-800",
  PAYMENT_FAILED: "bg-red-100 text-red-800",
};

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

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
  });

  if (!order) notFound();

  const address = parseAddress(order.shippingAddress);

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/orders"
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ← All orders
      </Link>

      <div className="mt-2 flex justify-between items-start mb-8">
        <div>
          <h1 className="font-heading text-2xl font-light font-mono">
            {order.orderNumber}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Placed {order.createdAt.toLocaleDateString("en-GB")}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || "bg-muted"}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-6">
        <section className="border rounded-md p-4">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground font-medium mb-3">
            Customer
          </h2>
          {order.user ? (
            <>
              {order.user.name && <p className="text-sm">{order.user.name}</p>}
              <p className="text-sm text-muted-foreground">
                {order.user.email}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm">Guest</p>
              <p className="text-sm text-muted-foreground">
                {order.guestEmail ?? "No email"}
              </p>
            </>
          )}
        </section>

        <section className="border rounded-md p-4">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground font-medium mb-3">
            Shipping address
          </h2>
          {address ? (
            <>
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
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No address on file.</p>
          )}
        </section>

        <section className="border rounded-md p-4">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground font-medium mb-3">
            Payment
          </h2>
          <p className="text-sm text-muted-foreground">Square payment ID</p>
          <p className="text-sm font-mono">{order.squarePaymentId ?? "—"}</p>
        </section>

        <section className="border rounded-md p-4">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground font-medium mb-3">
            Tracking
          </h2>
          {order.shippingCarrier || order.trackingNumber ? (
            <>
              {order.shippingCarrier && (
                <p className="text-sm">{order.shippingCarrier}</p>
              )}
              {order.trackingNumber && (
                <p className="text-sm font-mono">{order.trackingNumber}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tracking details yet.
            </p>
          )}
          {order.shippedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Shipped {order.shippedAt.toLocaleDateString("en-GB")}
            </p>
          )}
          {order.deliveredAt && (
            <p className="text-xs text-muted-foreground">
              Delivered {order.deliveredAt.toLocaleDateString("en-GB")}
            </p>
          )}
        </section>
      </div>

      <div className="border rounded-md overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs tracking-wider uppercase text-muted-foreground">
              <th className="p-3">Item</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="p-3 text-sm">{item.productTitleSnapshot}</td>
                <td className="p-3 text-sm">{item.quantity}</td>
                <td className="p-3 text-sm">{formatPrice(item.unitPrice)}</td>
                <td className="p-3 text-sm text-right">
                  {formatPrice(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="border rounded-md p-4 space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
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

      <OrderActions
        orderId={order.id}
        status={order.status}
        shippingCarrier={order.shippingCarrier}
        trackingNumber={order.trackingNumber}
      />
    </div>
  );
}
