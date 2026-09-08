import type { Metadata } from "next";
import { DM_Sans, Cormorant_Garamond, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const handwrittenFont = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Tengology | Handcrafted Accessories & Jewellery",
    template: "%s | Tengology",
  },
  description:
    "Handcrafted hair accessories, jewellery, and Christmas ornaments. Designed and made in Oxford from wool and wool-blend felt, natural crystal, floral cotton, and hand-cut glass.",
  keywords: [
    "handmade jewellery",
    "hair accessories",
    "wool felt",
    "handcrafted",
    "UK",
    "Tengology",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} ${handwrittenFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
