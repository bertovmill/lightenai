// Server-side auth helpers backed by Clerk. Replaces the old
// supabase.auth.getUser() pattern used across API routes & server components.
import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdminEmail } from "./admin";

/** Clerk user id (fast, no network). Null when signed out. */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export interface AuthUser {
  id: string;
  email: string | null;
}

/** Full current user with primary email, or null when signed out. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await currentUser();
  if (!user) return null;
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;
  return { id: user.id, email };
}

/** True when the signed-in user's email is in the admin allowlist. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return isAdminEmail(user?.email);
}

export { isAdminEmail };
