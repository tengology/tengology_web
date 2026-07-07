import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendShippingNotificationEmail } from "@/lib/email";

const VALID_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "FULFILLING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "PAYMENT_FAILED",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: {
    status?: unknown;
    shippingCarrier?: unknown;
    trackingNumber?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = body.status;
  if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const shippingCarrier =
    typeof body.shippingCarrier === "string"
      ? body.shippingCarrier.trim()
      : undefined;
  const trackingNumber =
    typeof body.trackingNumber === "string"
      ? body.trackingNumber.trim()
      : undefined;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const data: {
    status: string;
    shippingCarrier?: string | null;
    trackingNumber?: string | null;
    shippedAt?: Date;
    deliveredAt?: Date;
  } = { status };

  const becameShipped = status === "SHIPPED" && order.status !== "SHIPPED";
  const becameDelivered =
    status === "DELIVERED" && order.status !== "DELIVERED";

  if (status === "SHIPPED") {
    if (shippingCarrier !== undefined) {
      data.shippingCarrier = shippingCarrier || null;
    }
    if (trackingNumber !== undefined) {
      data.trackingNumber = trackingNumber || null;
    }
    if (becameShipped) {
      data.shippedAt = new Date();
    }
  }

  if (becameDelivered) {
    data.deliveredAt = new Date();
  }

  const updated = await prisma.order.update({ where: { id }, data });

  if (becameShipped) {
    const recipientEmail = order.user?.email ?? order.guestEmail;
    if (recipientEmail) {
      const baseUrl = process.env.AUTH_URL ?? "http://localhost:3001";
      const lookupUrl = `${baseUrl}/orders/lookup?order=${updated.orderNumber}&email=${encodeURIComponent(recipientEmail)}`;
      after(() =>
        sendShippingNotificationEmail({
          to: recipientEmail,
          orderNumber: updated.orderNumber,
          carrier: updated.shippingCarrier,
          trackingNumber: updated.trackingNumber,
          lookupUrl,
        })
      );
    }
  }

  return NextResponse.json({
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    shippingCarrier: updated.shippingCarrier,
    trackingNumber: updated.trackingNumber,
    shippedAt: updated.shippedAt,
    deliveredAt: updated.deliveredAt,
  });
}
