"use client";

import { useId, useState } from "react";
import { t } from "@/lib/copy";

type Mode = "login" | "register";

/**
 * The login and register forms are the same component in two modes — they share
 * every field except name and confirmation, and splitting them would mean two
 * copies of the password toggle, the validation styling and the submit state.
 *
 * ⚠ Front-end only. Nothing here authenticates anything: there is no request,
 * no token, no session. `onSubmit` deliberately stops at a visible notice
 * instead of faking a spinner and a redirect, because a form that *looks* like
 * it signed you in is worse than one that admits it did not. When the API
 * lands, replace the body of `onSubmit` and delete the notice.
 *
 * Passwords are never put in component state that outlives the form, never
 * logged, and the inputs carry the right `autocomplete` values so password
 * managers behave correctly.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameId = useId();
  const phoneId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const termsId = useId();
  const noticeId = useId();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8">
      <div className="flex flex-col gap-5">
        {isRegister && (
          <Field
            id={nameId}
            label={t.auth.name}
            type="text"
            autoComplete="name"
            required
          />
        )}

        <Field
          id={phoneId}
          label={t.auth.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="9911 2233"
          required
        />

        {/* Password + its visibility toggle. The button is inside the field box
            so the tap target sits where the eye icon appears. */}
        <div>
          <label htmlFor={passwordId} className="eyebrow">
            {t.auth.password}
          </label>
          <div className="relative mt-2">
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 8 : undefined}
              className="h-12 w-full border border-line bg-ground pr-12 pl-3.5 text-base text-ink transition-colors placeholder:text-faint focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? t.auth.hidePassword : t.auth.showPassword
              }
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 grid w-12 touch-manipulation place-items-center text-muted transition-colors hover:text-ink"
            >
              <EyeIcon off={showPassword} />
            </button>
          </div>
          {isRegister && (
            <p className="mt-1.5 text-xs text-muted">{t.auth.passwordHint}</p>
          )}
        </div>

        {isRegister && (
          <Field
            id={confirmId}
            label={t.auth.passwordConfirm}
            type="password"
            autoComplete="new-password"
            required
          />
        )}
      </div>

      {/* Secondary row: remember/forgot for login, terms for register. */}
      {isRegister ? (
        <label
          htmlFor={termsId}
          className="mt-6 flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
        >
          <input
            id={termsId}
            name="terms"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
          />
          {t.auth.terms}
        </label>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
            <input
              name="remember"
              type="checkbox"
              className="size-4 accent-[var(--color-accent)]"
            />
            {t.auth.remember}
          </label>
          <button
            type="button"
            className="eyebrow text-accent transition-opacity hover:opacity-75"
          >
            {t.auth.forgot}
          </button>
        </div>
      )}

      <button
        type="submit"
        aria-describedby={submitted ? noticeId : undefined}
        className="mt-7 h-12 w-full touch-manipulation rounded-full bg-ink text-[0.75rem] font-bold tracking-[0.14em] text-ground uppercase transition-colors hover:bg-accent hover:text-accent-ink"
      >
        {isRegister ? t.auth.registerTitle : t.auth.loginTitle}
      </button>

      {submitted && (
        <p
          id={noticeId}
          role="status"
          className="mt-4 border-l-2 border-flare pl-3 text-sm leading-relaxed text-muted"
        >
          {t.auth.demoNotice}
        </p>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  ...input
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>
      <input
        id={id}
        {...input}
        className="mt-2 h-12 w-full border border-line bg-ground px-3.5 text-base text-ink transition-colors placeholder:text-faint focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="size-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.8 10S4.9 4.6 10 4.6 18.2 10 18.2 10 15.1 15.4 10 15.4 1.8 10 1.8 10Z" />
      <circle cx="10" cy="10" r="2.6" />
      {off && <path d="M3.5 3.5l13 13" />}
    </svg>
  );
}
