import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Legacy customer/selling flows are intentionally disabled by middleware.
    "app/(public)/account/**",
    "app/(public)/cart/**",
    "app/(public)/wishlist/**",
    "app/(public)/order/**",
    "app/(public)/login/**",
    "app/(public)/register/**",
    "app/(public)/forgot-password/**",
    "app/(public)/reset-password/**",
    "app/(public)/faq/**",
    "app/(public)/shipping-returns/**",
    "app/admin/orders/**",
    "components/cart/**",
    "components/user-menu.tsx",
    "components/newsletter-form.tsx",
  ]),
]);
