import { redirect } from "next/navigation";

export const metadata = { title: "Cart" };

export default function CartPage() {
  redirect("/products");
}
