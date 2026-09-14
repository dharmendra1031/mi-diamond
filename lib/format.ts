export function formatPrice(amount: number, currency = "KWD") {
  return new Intl.NumberFormat("en-KW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
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
  available: "Available",
  sold_out: "Sold Out",
  on_request: "On Request",
};

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Michael Jewellery",
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE ?? "Fine Jewellery · Kuwait",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96597850983",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "michael.jewellerykwt",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+965 2266 1269",
  mobile: process.env.NEXT_PUBLIC_MOBILE ?? "+965 9785 0983",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "",
  address:
    process.env.NEXT_PUBLIC_ADDRESS ??
    "Hawalli, Ibn Khaldoon St., Al-Haddad Complex, Shop 3, Kuwait",
};

export function whatsappUrl(message?: string) {
  const number = siteConfig.whatsapp.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}
