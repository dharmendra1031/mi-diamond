import { createClient } from "./server";
import type { Profile } from "./types";

export async function getCurrentUser() {
  const dataClient = await createClient();
  const {
    data: { user },
  } = await dataClient.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<{
  user: Awaited<ReturnType<typeof getCurrentUser>>;
  profile: Profile | null;
}> {
  const dataClient = await createClient();
  const {
    data: { user },
  } = await dataClient.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await dataClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return { user, profile };
}

export async function isAdmin() {
  const { profile } = await getCurrentProfile();
  return profile?.is_admin ?? false;
}
