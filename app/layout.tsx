import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
