import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/account/orders");

  let orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
    _count: { items: number };
  }> = [];

  try {
    orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // DB not connected
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <Link
        href="/account"
        className="eyebrow transition-colors hover:text-foreground"
      >
        &larr; Back to account
      </Link>
      <header className="mt-4 border-t pt-6">
        <p className="eyebrow mb-4">Account</p>
        <h1 className="font-heading text-4xl leading-[0.95] sm:text-5xl">
          My Orders
        </h1>
      </header>

      {orders.length > 0 ? (
        <div className="mt-10 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.orderNumber}`}
              className="block border p-4 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString("en-GB")} &middot;{" "}
                    {order._count.items}{" "}
                    {order._count.items === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatPrice(order.total)}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-none px-2.5 py-1 text-[11px] uppercase tracking-[0.1em]",
                      statusClasses[order.status] ??
                        "bg-muted text-muted-foreground"
                    )}
                  >
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 border py-16 text-center">
          <p className="eyebrow mb-4">No orders yet</p>
          <p className="font-heading mb-6 text-2xl">
            Your story starts <em>here</em>
          </p>
          <Link
            href="/shop"
            className="link-underline eyebrow pb-1 text-foreground transition-colors hover:text-moss"
          >
            Start shopping
          </Link>
        </div>
      )}
    </div>
  );
}
