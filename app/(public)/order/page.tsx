import { CheckoutForm } from "./checkout-form";
import { getCurrentProfile } from "@/lib/supabase/auth";

export const metadata = { title: "Order Requests" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { user, profile } = await getCurrentProfile();

  return (
    <div className="container-prose py-12 md:py-16">
      <p className="label-eyebrow">Final Step</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl text-ink-700">
        Create Order Request
      </h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Complete the form below to create your order request. Our team will contact you
        as soon as possible to share product and payment details
        iletecektir.
      </p>

      <div className="mt-10">
        <CheckoutForm
          loggedIn={!!user}
          userId={user?.id ?? null}
          defaultName={profile?.full_name ?? ""}
          defaultPhone={profile?.phone ?? ""}
          defaultEmail={user?.email ?? ""}
        />
      </div>
    </div>
  );
}
