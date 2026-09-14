export function formatPrice(amount: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function discountPercent(price: number, oldPrice: number | null) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function slugify(input: string) {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return input
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (m) => map[m] ?? m)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const stockLabel: Record<string, string> = {
  available: "In Stock",
  sold_out: "Sold Out",
  on_request: "Made to Order",
};

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Mi Diamond",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905551234567",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "midiamond",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+90 555 123 45 67",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "info@midiamond.com.tr",
  address: process.env.NEXT_PUBLIC_ADDRESS ?? "Istanbul, Turkey",
};

export function whatsappUrl(message?: string) {
  const number = siteConfig.whatsapp.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}
