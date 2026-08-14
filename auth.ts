import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPrisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "thang-long-local-dev-secret-change-me",
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(credentials);
        if (!parsed.success) return null;
        const prisma = getPrisma();
        if (!prisma) return null;
        try {
          const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
          if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
  pages: { signIn: "/dang-nhap" },
});
