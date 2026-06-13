import { redirect } from "next/navigation";
import { getAuthUser, isAdminEmail } from "@/lib/auth";
import AdminShell from "./AdminShell";

// Server-side admin gate. Middleware already guarantees a signed-in user on
// /admin; here we enforce the admin-email allowlist before rendering anything.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!isAdminEmail(user?.email)) {
    redirect("/login?redirectTo=/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
