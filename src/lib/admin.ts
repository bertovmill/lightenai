// Isomorphic admin check — safe to import in both client and server components.
// Admins are matched by email against NEXT_PUBLIC_ADMIN_EMAILS (comma-separated).
// Real enforcement happens server-side (middleware + admin layout); the client
// use of this only controls whether admin menu links are shown.
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
