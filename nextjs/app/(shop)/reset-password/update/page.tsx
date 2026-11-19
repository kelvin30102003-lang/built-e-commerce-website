import { UpdatePasswordForm } from '@/components/shop/update-password-form';

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground">Set New Password</h1>
      <p className="mt-3 text-sm text-secondary">Choose a new password for your account.</p>
      <UpdatePasswordForm />
    </div>
  );
}
