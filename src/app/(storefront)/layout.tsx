import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { getShippingZone } from "@/lib/shipping";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const zone = await getShippingZone();

  return (
    <>
      <Header shipping={zone} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
