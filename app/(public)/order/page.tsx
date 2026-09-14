import { redirect } from "next/navigation";

export const metadata = { title: "Order" };

export default function OrderPage() {
  redirect("/products");
}
