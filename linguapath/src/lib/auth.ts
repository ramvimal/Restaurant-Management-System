import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { user } from "./schema";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", newUser: "/languages" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const found = await db.query.user.findFirst({ where: eq(user.email, credentials.email.toLowerCase().trim()) });
        if (!found?.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, found.passwordHash);
        if (!ok) return null;
        return { id: found.id, email: found.email, name: found.name, image: found.image };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user: u, account }) {
      // Upsert OAuth users so Google login works without a separate signup step.
      if (account?.provider === "google" && u.email) {
        const email = u.email.toLowerCase();
        const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
        if (existing) {
          await db.update(user).set({ name: u.name, image: u.image }).where(eq(user.id, existing.id));
        } else {
          await db.insert(user).values({ email, name: u.name, image: u.image });
        }
      }
      return true;
    },
    async jwt({ token, user: u }) {
      if (u?.email) {
        const found = await db.query.user.findFirst({ where: eq(user.email, u.email.toLowerCase()) });
        if (found) {
          token.uid = found.id;
          token.name = found.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (token.uid as string) ?? "";
      }
      return session;
    },
  },
};
