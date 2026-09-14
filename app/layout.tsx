import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Michael Jewellery Kuwait | Fine Jewellery",
    template: "%s | Michael Jewellery Kuwait",
  },
  description:
    "Michael Jewellery in Hawalli, Kuwait presents refined gold and diamond jewellery with personal in-store consultation.",
  openGraph: {
    type: "website",
    locale: "en_KW",
    siteName: "Michael Jewellery Kuwait",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
