"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/local-data/server";

export async function signOutAction() {
  const dataClient = await createClient();
  await dataClient.auth.signOut();
  redirect("/");
}

export async function updateProfileAction(formData: FormData) {
  const dataClient = await createClient();
  const {
    data: { user },
  } = await dataClient.auth.getUser();
  if (!user) return { error: "Session not found." };

  const full_name = String(formData.get("full_name") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;

  const { error } = await dataClient
    .from("profiles")
    .update({ full_name, phone })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account");
  revalidatePath("/account/details");
  return { ok: true };
}
