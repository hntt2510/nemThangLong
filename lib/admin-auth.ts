import type { Session } from "next-auth";

export function isAdmin(session: Session | null | undefined) {
  return session?.user?.role === "ADMIN";
}

export function isOrderOperator(session: Session | null | undefined) {
  return session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";
}

export function authStatus(session: Session | null | undefined, allowed: readonly string[]) {
  if (!session?.user) return 401 as const;
  return allowed.includes(session.user.role ?? "") ? 200 as const : 403 as const;
}
