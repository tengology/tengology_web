import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { Package, MapPin, User as UserIcon, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

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

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/account");

  let orderCount = 0;
  let addressCount = 0;
  let latestOrder: {
    orderNumber: string;
    total: number;
    status: string;
    createdAt: Date;
  } | null = null;

  try {
    [orderCount, addressCount, latestOrder] = await Promise.all([
      prisma.order.count({ where: { userId: session.user.id } }),
      prisma.address.count({ where: { userId: session.user.id } }),
      prisma.order.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: {
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);
  } catch {
    // DB not connected
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <header className="border-t pt-6">
        <p className="eyebrow mb-4">Account</p>
        <h1 className="font-heading text-4xl leading-[0.95] sm:text-5xl">
          My Account
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {session.user.email}
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/profile"
          className="block border p-5 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
        >
          <UserIcon className="mb-3 h-5 w-5 text-muted-foreground" />
          <p className="font-heading text-xl">Profile</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Name, phone, password
          </p>
        </Link>

        <Link
          href="/account/orders"
          className="block border p-5 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
        >
          <Package className="mb-3 h-5 w-5 text-muted-foreground" />
          <p className="font-heading text-xl">Orders</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {orderCount} {orderCount === 1 ? "order" : "orders"}
          </p>
        </Link>

        <Link
          href="/account/addresses"
          className="block border p-5 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
        >
          <MapPin className="mb-3 h-5 w-5 text-muted-foreground" />
          <p className="font-heading text-xl">Addresses</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {addressCount}{" "}
            {addressCount === 1 ? "saved address" : "saved addresses"}
          </p>
        </Link>
      </div>

      {latestOrder && (
        <div className="mt-10 border p-5">
          <p className="eyebrow mb-4">Latest order</p>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-sm">{latestOrder.orderNumber}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {latestOrder.createdAt.toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {formatPrice(latestOrder.total)}
              </p>
              <span
                className={cn(
                  "mt-1 inline-block rounded-none px-2.5 py-1 text-[11px] uppercase tracking-[0.1em]",
                  statusClasses[latestOrder.status] ??
                    "bg-muted text-muted-foreground"
                )}
              >
                {latestOrder.status}
              </span>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-4 text-xs uppercase tracking-[0.15em]"
          >
            <Link href={`/account/orders/${latestOrder.orderNumber}`}>
              View order
            </Link>
          </Button>
        </div>
      )}

      <div className="mt-10 border-t pt-8">
        <form
          action={async () => {
            "use server";
            const { signOut } = await import("@/lib/auth");
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button
            variant="outline"
            type="submit"
            className="text-xs uppercase tracking-[0.15em]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
