export type DocsSession = { user?: { role?: string | null } } | null | undefined;

export function openApiAuthStatus(session: DocsSession) {
  if (!session?.user) return 401 as const;
  return session.user.role === "ADMIN" ? 200 as const : 403 as const;
}
