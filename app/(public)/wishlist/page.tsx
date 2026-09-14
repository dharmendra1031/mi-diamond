import { redirect } from "next/navigation";

export const metadata = { title: "Wishlist" };

export default function WishlistPage() {
  redirect("/products");
}
