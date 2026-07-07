import type { Metadata } from "next";
import { getShippingZone } from "@/lib/shipping";
import { CartClient } from "./cart-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Bag",
};

export default async function CartPage() {
  const shipping = await getShippingZone();
  return <CartClient shipping={shipping} />;
}
