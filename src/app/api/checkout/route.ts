import { NextResponse } from "next/server";
import { after } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/format";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getShippingZone, computeShipping } from "@/lib/shipping";
import {
  isSquareConfigured,
  getSquareClient,
  SQUARE_LOCATION_ID,
  SQUARE_CURRENCY,
  poundsToMinorUnits,
} from "@/lib/square";
import { SquareError } from "square";

interface CheckoutItem {
  productId: string;
  variantName?: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country?: string;
}

class OutOfStockError extends Error {}

export async function POST(request: Request) {
  if (!isSquareConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const session = await auth();
  const body = (await request.json()) as {
    items: CheckoutItem[];
    shippingAddress?: ShippingAddress;
    email?: string;
    sourceId?: string;
    verificationToken?: string;
    saveAddress?: boolean;
    /** Total the customer saw — mismatch means cart prices are stale. */
    expectedTotal?: number;
  };

  const {
    items,
    shippingAddress,
    email,
    sourceId,
    verificationToken,
    saveAddress,
    expectedTotal,
  } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if (!sourceId) {
    return NextResponse.json(
      { error: "Payment token is missing" },
      { status: 400 }
    );
  }

  const buyerEmail = session?.user?.email ?? email;
  if (!buyerEmail) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  if (!shippingAddress) {
    return NextResponse.json(
      { error: "Shipping address required" },
      { status: 400 }
    );
  }

  // Validate availability and calculate totals from current DB prices.
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isPublished: true, isArchived: false },
    include: { variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Same product can appear on multiple lines (different variants) — stock
  // must be validated against the summed quantity.
  const quantityByProduct = new Map<string, number>();
  for (const item of items) {
    quantityByProduct.set(
      item.productId,
      (quantityByProduct.get(item.productId) ?? 0) + item.quantity
    );
  }

  let subtotal = 0;
  const orderItems: Array<{
    productId: string;
    variantId: string | null;
    productTitleSnapshot: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }> = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: "An item in your bag is no longer available. Please remove it and try again." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return NextResponse.json(
        { error: `Invalid quantity for ${product.title}` },
        { status: 400 }
      );
    }

    let variantId: string | null = null;
    let snapshot = product.title;
    if (item.variantName) {
      const variant = product.variants.find((v) => v.name === item.variantName);
      if (!variant) {
        return NextResponse.json(
          { error: `Option "${item.variantName}" is no longer available for ${product.title}` },
          { status: 400 }
        );
      }
      if (variant.stockCount < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.title} — ${variant.name}` },
          { status: 400 }
        );
      }
      variantId = variant.id;
      snapshot = `${product.title} — ${variant.name}`;
    }

    if (product.stockCount < (quantityByProduct.get(item.productId) ?? 0)) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.title}` },
        { status: 400 }
      );
    }

    const unitPrice = Number(product.price);
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      productId: product.id,
      variantId,
      productTitleSnapshot: snapshot,
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotal,
    });
  }

  const shippingZone = await getShippingZone();
  const shippingCost = computeShipping(subtotal, shippingZone);
  const total = Number((subtotal + shippingCost).toFixed(2));

  // Persisted carts can hold stale prices — never charge an amount the
  // customer hasn't seen.
  if (expectedTotal != null && Math.abs(expectedTotal - total) > 0.005) {
    return NextResponse.json(
      {
        error: "Prices have changed since you added these items. Please review your order.",
        total,
        items: orderItems.map((i) => ({
          productId: i.productId,
          unitPrice: i.unitPrice,
        })),
      },
      { status: 409 }
    );
  }

  const idempotencyKey = randomUUID();
  const triggeredBy = session?.user?.id || "guest";

  // Create a PENDING order with conditional stock decrements — the gte
  // guard makes concurrent checkouts for the last unit fail cleanly
  // instead of overselling. Inventory logs are written here too (the
  // single place stock changes), not re-applied afterwards.
  let order: { id: string; orderNumber: string } | null = null;
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    const orderNumber = generateOrderNumber();
    try {
      order = await prisma.$transaction(async (tx) => {
        for (const [productId, quantity] of quantityByProduct) {
          const before = await tx.product.findUniqueOrThrow({
            where: { id: productId },
            select: { stockCount: true, title: true },
          });
          const updated = await tx.product.updateMany({
            where: { id: productId, stockCount: { gte: quantity } },
            data: { stockCount: { decrement: quantity } },
          });
          if (updated.count === 0) {
            throw new OutOfStockError(`Insufficient stock for ${before.title}`);
          }
          await tx.inventoryLog.create({
            data: {
              productId,
              changeType: "SALE",
              quantityBefore: before.stockCount,
              quantityAfter: before.stockCount - quantity,
              delta: -quantity,
              note: `Order ${orderNumber}`,
              triggeredBy,
            },
          });
        }

        for (const item of orderItems) {
          if (!item.variantId) continue;
          const updated = await tx.productVariant.updateMany({
            where: { id: item.variantId, stockCount: { gte: item.quantity } },
            data: { stockCount: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            throw new OutOfStockError(
              `Insufficient stock for ${item.productTitleSnapshot}`
            );
          }
        }

        return tx.order.create({
          data: {
            orderNumber,
            userId: session?.user?.id || null,
            guestEmail: session?.user?.email ? null : buyerEmail,
            status: "PENDING",
            subtotal,
            shippingCost,
            taxAmount: 0,
            total,
            shippingAddress: JSON.stringify(shippingAddress),
            items: {
              create: orderItems.map((i) => ({
                productId: i.productId,
                productTitleSnapshot: i.productTitleSnapshot,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
              })),
            },
          },
        });
      });
    } catch (err) {
      if (err instanceof OutOfStockError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      const isUniqueCollision =
        typeof err === "object" &&
        err !== null &&
        (err as { code?: string }).code === "P2002";
      if (!isUniqueCollision || attempt === 2) throw err;
    }
  }
  if (!order) {
    return NextResponse.json(
      { error: "Could not create order, please try again" },
      { status: 500 }
    );
  }
  const createdOrder = order;

  async function restoreStock(reason: string) {
    await prisma.$transaction(async (tx) => {
      for (const [productId, quantity] of quantityByProduct) {
        const before = await tx.product.findUniqueOrThrow({
          where: { id: productId },
          select: { stockCount: true },
        });
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
            note: `Order ${createdOrder.orderNumber}: ${reason}`,
            triggeredBy,
          },
        });
      }
      for (const item of orderItems) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockCount: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id: createdOrder.id },
        data: { status: "PAYMENT_FAILED" },
      });
    });
  }

  // Charge via Square. ONLY a failed/declined payment rolls the order
  // back — errors after a successful charge must never restore stock or
  // mark the order failed (the customer has paid).
  let payment: { id: string; status?: string };
  try {
    if (!SQUARE_LOCATION_ID) {
      throw new Error("SQUARE_LOCATION_ID is not configured");
    }

    const paymentResponse = await getSquareClient().payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: poundsToMinorUnits(total),
        currency: SQUARE_CURRENCY,
      },
      autocomplete: true,
      locationId: SQUARE_LOCATION_ID,
      referenceId: createdOrder.orderNumber,
      buyerEmailAddress: buyerEmail,
      note: `Tengology order ${createdOrder.orderNumber}`,
      verificationToken: verificationToken || undefined,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        addressLine1: shippingAddress.line1,
        addressLine2: shippingAddress.line2 || undefined,
        locality: shippingAddress.city,
        administrativeDistrictLevel1: shippingAddress.county || undefined,
        postalCode: shippingAddress.postcode,
        country: (shippingAddress.country as "GB" | undefined) ?? "GB",
      },
    });

    const result = paymentResponse.payment;
    if (!result?.id || result.status === "FAILED") {
      throw new Error("Payment was declined");
    }
    payment = { id: result.id, status: result.status };
  } catch (err) {
    try {
      await restoreStock("payment failed");
    } catch (restoreErr) {
      console.error("Failed to restore stock after payment failure:", restoreErr);
    }

    let message = "Payment failed";
    if (err instanceof SquareError) {
      message = err.errors?.[0]?.detail ?? err.message ?? message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    console.error("Square payment error:", err);
    return NextResponse.json({ error: message }, { status: 402 });
  }

  // Post-payment bookkeeping — the charge succeeded, so failures here are
  // logged but never surfaced as a payment error. The webhook reconciles
  // the order via referenceId if the status update is lost.
  try {
    await prisma.order.update({
      where: { id: createdOrder.id },
      data: {
        status: payment.status === "COMPLETED" ? "PAID" : "PROCESSING",
        squarePaymentId: payment.id,
      },
    });
  } catch (err) {
    console.error(
      `Order ${createdOrder.orderNumber} charged (payment ${payment.id}) but status update failed:`,
      err
    );
  }

  if (saveAddress && session?.user?.id) {
    prisma.address
      .create({
        data: {
          userId: session.user.id,
          label: "Shipping",
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || null,
          city: shippingAddress.city,
          county: shippingAddress.county || null,
          postcode: shippingAddress.postcode,
          country: shippingAddress.country || "GB",
        },
      })
      .catch(console.error);
  }

  // Confirmation email after the response is sent — never blocks payment.
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3001";
  const lookupUrl = `${baseUrl}/orders/lookup?order=${createdOrder.orderNumber}&email=${encodeURIComponent(buyerEmail)}`;
  after(() =>
    sendOrderConfirmationEmail({
      to: buyerEmail,
      orderNumber: createdOrder.orderNumber,
      items: orderItems.map((i) => ({
        title: i.productTitleSnapshot,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
      })),
      subtotal,
      shippingCost,
      total,
      shippingAddress,
      lookupUrl,
    })
  );

  return NextResponse.json({
    orderNumber: createdOrder.orderNumber,
    orderId: createdOrder.id,
    paymentId: payment.id,
  });
}
