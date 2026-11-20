"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "@/lib/actions/auth";

export function LoginRegisterPanel({
  defaultTab,
  registered,
  redirectTo,
}: {
  defaultTab: string;
  registered: boolean;
  redirectTo: string;
}) {
  const [mode, setMode] = useState<"login" | "register">(
    defaultTab === "register" ? "register" : "login"
  );
  const [showRegisteredToast, setShowRegisteredToast] = useState(registered);

  useEffect(() => {
    if (!registered) return;
    const timeout = window.setTimeout(() => setShowRegisteredToast(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [registered]);

  return (
    <div className="relative flex w-full flex-col rounded-xl border border-outline-variant/70 bg-surface-lowest p-6 shadow-sm sm:p-8">
      {showRegisteredToast && (
        <div role="status" className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-lg bg-foreground px-5 py-3 text-sm text-primary-foreground shadow-lg">
          Account created successfully. Please sign in.
        </div>
      )}
      {/* Tab navigation */}
      <div className="w-full border-b border-outline-variant/70 mb-8">
        <div className="flex items-center space-x-8">
          <button
            type="button"
            className={
              mode === "login"
                ? "relative pb-3 text-sm font-medium text-foreground border-b-2 border-foreground -mb-[1px] cursor-default focus:outline-none"
                : "relative pb-3 text-sm font-medium text-secondary hover:text-foreground transition-colors tracking-tight focus:outline-none"
            }
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={
              mode === "register"
                ? "relative pb-3 text-sm font-medium text-foreground border-b-2 border-foreground -mb-[1px] cursor-default focus:outline-none"
                : "relative pb-3 text-sm font-medium text-secondary hover:text-foreground transition-colors tracking-tight focus:outline-none"
            }
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>
      </div>

      {/* Form area */}
      <div className="w-full">
        {mode === "login" ? (
          <SignInForm redirectTo={redirectTo} />
        ) : (
          <CreateAccountForm redirectTo={redirectTo} />
        )}
      </div>

    </div>
  );
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <svg aria-hidden="true" className="h-4 w-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {visible ? (
        <>
          <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.9 5.2A10.8 10.8 0 0112 5c4.6 0 8.5 3 10 7-.5 1.4-1.4 2.7-2.5 3.7M6.2 6.2A11.2 11.2 0 002 12c1.5 4 5.4 7 10 7 1.2 0 2.3-.2 3.3-.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

/* ─────────────────────────── Sign In Form ─────────────────────────── */

function SignInForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }


  return (
    <>
      {/* Header */}
      <div className="space-y-1.5 mb-7">
        <h2 className="text-3xl font-medium tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-secondary text-sm tracking-normal">
          Sign in with your email to continue your experience.
        </p>
      </div>

      {/* Email/password form */}
      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />

        {/* Email */}
        <div>
          <label
            className="block text-xs font-medium text-on-surface-variant mb-1.5"
            htmlFor="login-email"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              required
              autoComplete="email"
              id="login-email"
              name="email"
              placeholder="name@example.com"
              type="email"
              className="block w-full rounded-lg border border-outline-variant/70 bg-surface-lowest py-3 pl-10 pr-4 text-sm text-foreground placeholder-secondary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              className="block text-xs font-medium text-on-surface-variant"
              htmlFor="login-password"
            >
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-secondary hover:text-foreground transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              required
              autoComplete="current-password"
              id="login-password"
              name="password"
              placeholder="••••••••••••"
              type={showPassword ? "text" : "password"}
              className="block w-full rounded-lg border border-outline-variant/70 bg-surface-lowest py-3 pl-10 pr-10 text-sm text-foreground placeholder-secondary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-foreground focus:outline-none"
            >
              <PasswordVisibilityIcon visible={showPassword} />
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center pt-0.5">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded-md border-outline-variant text-primary focus:ring-primary accent-primary cursor-pointer"
          />
          <label
            className="ml-2 block text-xs text-secondary cursor-pointer select-none"
            htmlFor="remember-me"
          >
            Remember this device for 30 days
          </label>
        </div>

        {error && (
          <p className="text-sm text-error bg-error/5 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="pt-2.5">
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-6 bg-primary hover:bg-foreground active:scale-[0.99] text-primary-foreground text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-150 ease-in-out shadow-sm rounded-xl flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{isPending ? "Signing in..." : "Sign In"}</span>
            <svg className="w-4 h-4 stroke-[2] group-hover:translate-x-0.5 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </>
  );
}

/* ─────────────────────── Create Account Form ──────────────────────── */

function CreateAccountForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) setError(result.error);
    });
  }


  return (
    <>
      {/* Header */}
      <div className="space-y-1.5 mb-7">
        <h2 className="text-3xl font-medium tracking-tight text-foreground">
          Create your account
        </h2>
        <p className="text-secondary text-sm tracking-normal">
          Join us and start shopping your favourite items.
        </p>
      </div>

      {/* Registration form */}
      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        {/* Full name */}
        <div>
          <label
            className="block text-xs font-medium text-on-surface-variant mb-1.5"
            htmlFor="reg-name"
          >
            Full name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              required
              autoComplete="name"
              id="reg-name"
              name="fullName"
              placeholder="John Doe"
              type="text"
              className="block w-full rounded-lg border border-outline-variant/70 bg-surface-lowest py-3 pl-10 pr-4 text-sm text-foreground placeholder-secondary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            className="block text-xs font-medium text-on-surface-variant mb-1.5"
            htmlFor="reg-email"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              required
              autoComplete="email"
              id="reg-email"
              name="email"
              placeholder="name@example.com"
              type="email"
              className="block w-full rounded-lg border border-outline-variant/70 bg-surface-lowest py-3 pl-10 pr-4 text-sm text-foreground placeholder-secondary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            className="block text-xs font-medium text-on-surface-variant mb-1.5"
            htmlFor="reg-password"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              required
              autoComplete="new-password"
              id="reg-password"
              name="password"
              placeholder="8 characters minimum"
              type={showPassword ? "text" : "password"}
              minLength={8}
              className="block w-full rounded-lg border border-outline-variant/70 bg-surface-lowest py-3 pl-10 pr-10 text-sm text-foreground placeholder-secondary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-foreground focus:outline-none"
            >
              <PasswordVisibilityIcon visible={showPassword} />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-error bg-error/5 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="pt-2.5">
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-6 bg-primary hover:bg-foreground active:scale-[0.99] text-primary-foreground text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-150 ease-in-out shadow-sm rounded-xl flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{isPending ? "Creating account..." : "Create Account"}</span>
            <svg className="w-4 h-4 stroke-[2] group-hover:translate-x-0.5 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </>
  );
}
