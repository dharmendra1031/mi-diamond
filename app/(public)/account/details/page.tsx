import { getCurrentProfile } from "@/lib/local-data/auth";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { user, profile } = await getCurrentProfile();
  const { ok } = await searchParams;

  return (
    <>
      <header>
        <h1 className="font-serif text-3xl text-ink-700">My Details</h1>
        <p className="mt-1 text-sm text-ink-500">
          You can update your account details.
        </p>
      </header>

      {ok && (
        <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Your details have been saved.
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
        <ProfileForm
          email={user?.email ?? ""}
          fullName={profile?.full_name ?? ""}
          phone={profile?.phone ?? ""}
        />
      </div>
    </>
  );
}
