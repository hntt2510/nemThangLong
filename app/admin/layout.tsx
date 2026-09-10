import { auth, signOut } from "@/auth";
import { AdminShell } from "@/components/admin-shell";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/admin/dashboard");
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") redirect("/");
  async function signOutAction() { "use server"; await signOut({ redirectTo: "/dang-nhap" }); }
  return <AdminShell role={session.user.role} name={session.user.name ?? session.user.email ?? "Tài khoản"} signOutAction={signOutAction}>{children}</AdminShell>;
}
