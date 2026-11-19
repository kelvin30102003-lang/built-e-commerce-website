import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { redirect } from 'next/navigation';

/**
 * Guard for any route that requires a logged‑in user (not necessarily admin).
 * If the user is not authenticated, redirect to the login page.
 */
export async function requireUser() {
  const { user } = await getCurrentProfile();
  if (!user) {
    redirect('/login');
  }
  return { user };
}
