import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getShippingZone } from "@/lib/shipping";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  const shippingZone = await getShippingZone();

  let addresses: Array<{
    id: string;
    label: string;
    firstName: string;
    lastName: string;
    line1: string;
    line2: string | null;
    city: string;
    county: string | null;
    postcode: string;
    country: string;
    isDefault: boolean;
  }> = [];

  let defaults = { name: "", email: "" };

  if (session?.user?.id) {
    defaults = {
      name: session.user.name ?? "",
      email: session.user.email ?? "",
    };
    try {
      addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }],
      });
    } catch {
      // DB not connected
    }
  }

  return (
    <CheckoutClient
      isSignedIn={Boolean(session?.user)}
      defaults={defaults}
      savedAddresses={addresses}
      shipping={shippingZone}
    />
  );
}
