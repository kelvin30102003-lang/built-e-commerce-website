import { ForgotPasswordForm } from '@/components/shop/forgot-password-form';

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground">Reset Password</h1>
      <p className="mt-3 text-sm text-secondary">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
