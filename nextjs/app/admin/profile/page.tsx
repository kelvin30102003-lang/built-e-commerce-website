import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requireStaffOrAdmin } from '@/lib/auth/require-admin';
import { log_admin_activity } from '@/lib/supabase/rpc';
import { z } from 'zod';

const adminProfileSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  password: z.union([z.literal(''), z.string().min(12).max(128)]),
});

/** Server action to update profile */
export async function updateProfileAction(formData: FormData) {
  'use server';
  const { user } = await requireStaffOrAdmin();
  const supabase = await createClient();
  const parsed = adminProfileSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) throw new Error('Enter a valid name and email. New passwords must be at least 12 characters.');
  const { full_name: fullName, email, password } = parsed.data;

  // Update auth email/password if changed
  if (email !== user.email) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
  }
  if (password.length > 0) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  // Update profile row
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id);
  if (profileError) throw profileError;

  await log_admin_activity('update_profile', { fullName, email });

  redirect('/admin/profile');
}

export default async function AdminProfilePage() {
  const { user, profile } = await requireStaffOrAdmin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <form
        className="w-full max-w-md space-y-4 rounded-xl border border-surface-dim bg-surface-lowest p-6"
        action={updateProfileAction}
      >
        <h1 className="text-2xl font-semibold text-primary">My Profile</h1>
        <div>
          <label className="block text-sm font-medium text-primary" htmlFor="full_name">Full Name</label>
          <input
            required
            name="full_name"
            id="full_name"
            defaultValue={profile?.full_name ?? ''}
            className="mt-1 block w-full rounded border border-surface-dim bg-white p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary" htmlFor="email">Email</label>
          <input
            required
            name="email"
            id="email"
            type="email"
            defaultValue={user?.email ?? ''}
            className="mt-1 block w-full rounded border border-surface-dim bg-white p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary" htmlFor="password">New Password (optional)</label>
          <input
            name="password"
            id="password"
            type="password"
            placeholder="Leave blank to keep current"
            className="mt-1 block w-full rounded border border-surface-dim bg-white p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-4 py-2 text-primary-foreground font-medium"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
