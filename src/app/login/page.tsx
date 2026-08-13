import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { t } from "@/lib/copy";

export const metadata: Metadata = {
  title: t.auth.loginTitle,
  description: t.auth.loginLede,
  /* Auth screens have no business in search results. */
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title={t.auth.loginTitle}
      lede={t.auth.loginLede}
      altPrompt={t.auth.noAccount}
      altLabel={t.auth.registerTitle}
      altHref="/register"
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
