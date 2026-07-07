import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AddressBook } from "./address-book";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/account/addresses");

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

  try {
    addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { label: "asc" }],
    });
  } catch {
    // DB not connected
  }

  return <AddressBook initialAddresses={addresses} />;
}
