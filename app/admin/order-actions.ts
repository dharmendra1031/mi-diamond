"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/local-data/server";

export async function updateOrderStatusAction(id: string, formData: FormData) {
  const dataClient = await createClient();
  const status = String(formData.get("status") ?? "new");
  const admin_note = String(formData.get("admin_note") ?? "").trim() || null;

  const { error } = await dataClient
    .from("orders")
    .update({ status, admin_note })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
