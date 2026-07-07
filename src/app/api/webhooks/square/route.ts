import { NextResponse } from "next/server";
import { WebhooksHelper } from "square";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Square webhook payloads are snake_case JSON; tolerate camelCase too in
// case the SDK shape is ever used in tests.
interface SquareEvent {
  type: string;
  data?: {
    object?: {
      payment?: {
        id?: string;
        status?: string;
        reference_id?: string;
        referenceId?: string;
      };
      refund?: {
        id?: string;
        payment_id?: string;
        paymentId?: string;
        status?: string;
      };
    };
  };
}

/**
 * Flips a paid-path order to a terminal failure status and restores the
 * stock it had reserved. Idempotent: the status guard inside the
 * transaction means duplicate webhook deliveries restore at most once.
 */
async function failOrderAndRestoreStock(
  orderId: string,
  newStatus: "PAYMENT_FAILED" | "CANCELLED",
  allowedFrom: string[]
) {
  await prisma.$transaction(async (tx) => {
    const transitioned = await tx.order.updateMany({
      where: { id: orderId, status: { in: allowedFrom } },
      data: { status: newStatus },
    });
    if (transitioned.count === 0) return; // already handled

    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true },
    });

    const quantityByProduct = new Map<string, number>();
    for (const item of order.items) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) ?? 0) + item.quantity
      );
    }

    for (const [productId, quantity] of quantityByProduct) {
      const before = await tx.product.findUnique({
        where: { id: productId },
        select: { stockCount: true },
      });
      if (!before) continue; // product hard-deleted since
      await tx.product.update({
        where: { id: productId },
        data: { stockCount: { increment: quantity } },
      });
      await tx.inventoryLog.create({
        data: {
          productId,
          changeType: "ADJUSTMENT",
          quantityBefore: before.stockCount,
          quantityAfter: before.stockCount + quantity,
          delta: quantity,
          note: `Order ${order.orderNumber}: payment ${newStatus.toLowerCase()} (webhook)`,
          triggeredBy: "square-webhook",
        },
      });
    }

    // Variant stock: the variant is recorded in the title snapshot
    // ("Product — Variant"); restore best-effort.
    for (const item of order.items) {
      const sep = item.productTitleSnapshot.lastIndexOf(" — ");
      if (sep === -1) continue;
      const variantName = item.productTitleSnapshot.slice(sep + 3);
      await tx.productVariant.updateMany({
        where: { productId: item.productId, name: variantName },
        data: { stockCount: { increment: item.quantity } },
      });
    }
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-square-hmacsha256-signature");
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl =
    process.env.SQUARE_WEBHOOK_URL ||
    `${process.env.AUTH_URL ?? "http://localhost:3001"}/api/webhooks/square`;

  if (!signature || !signatureKey) {
    return NextResponse.json(
      { error: "Webhook signature not configured" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  const valid = await WebhooksHelper.verifySignature({
    requestBody: rawBody,
    signatureHeader: signature,
    signatureKey,
    notificationUrl,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: SquareEvent;
  try {
    event = JSON.parse(rawBody) as SquareEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment.updated": {
        const payment = event.data?.object?.payment;
        if (!payment?.id) break;
        const referenceId = payment.reference_id ?? payment.referenceId;

        // Match on payment id OR order number (carried in reference_id) —
        // the webhook can arrive before checkout stores squarePaymentId.
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { squarePaymentId: payment.id },
              ...(referenceId ? [{ orderNumber: referenceId }] : []),
            ],
          },
          select: { id: true, status: true },
        });
        if (!order) break;

        if (payment.status === "COMPLETED") {
          // Only move forward: PAID can recover a failed payment, but
          // fulfilment states are never touched.
          await prisma.order.updateMany({
            where: {
              id: order.id,
              status: { in: ["PENDING", "PROCESSING", "PAYMENT_FAILED"] },
            },
            data: { status: "PAID", squarePaymentId: payment.id },
          });
        } else if (payment.status === "FAILED") {
          await failOrderAndRestoreStock(order.id, "PAYMENT_FAILED", [
            "PENDING",
            "PROCESSING",
          ]);
        } else if (payment.status === "CANCELED") {
          await failOrderAndRestoreStock(order.id, "CANCELLED", [
            "PENDING",
            "PROCESSING",
          ]);
        }
        break;
      }

      case "refund.created":
      case "refund.updated": {
        const refund = event.data?.object?.refund;
        const paymentId = refund?.payment_id ?? refund?.paymentId;
        if (!paymentId) break;
        if (refund?.status === "COMPLETED") {
          await prisma.order.updateMany({
            where: { squarePaymentId: paymentId },
            data: { status: "REFUNDED" },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("Square webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
