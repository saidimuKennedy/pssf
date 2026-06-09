import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"
import type { NextAuthConfig } from "next-auth"
import { validateOTP } from "@/lib/kra/otp"

const STAFF_ROLES: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR, Role.ADMIN, Role.EMPLOYER]

export const authConfig = {
  providers: [
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string
        const code = credentials?.code as string
        if (!phone || !code) return null

        const user = await prisma.user.findFirst({ where: { phone } })
        if (!user || !user.is_active) return null

        const result = await validateOTP(phone, code)
        if (!result.success) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { last_login_at: new Date(), otp_verified_at: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: null,
          role: user.role,
        }
      },
    }),
    Credentials({
      id: "password",
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string
        const code = credentials?.code as string
        if (!email || !password || !code) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password_hash || !user.is_active) return null
        if (!STAFF_ROLES.includes(user.role)) return null

        const passwordOk = await bcrypt.compare(password, user.password_hash)
        if (!passwordOk) return null

        if (!user.phone) return null

        const result = await validateOTP(user.phone, code)
        if (!result.success) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { last_login_at: new Date(), otp_verified_at: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: null,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role as Role
        token.phone = user.phone ?? null

        // Look up employer_id and member_id — the authorize() functions don't return them.
        const officer = await prisma.employerOfficer.findFirst({
          where: { user_id: user.id },
          select: { employer_id: true },
        })
        token.employer_id = officer?.employer_id ?? null

        const member = await prisma.member.findUnique({
          where: { user_id: user.id },
          select: { id: true },
        })
        token.member_id = member?.id ?? null

        // Staff sessions are shorter — encode expiry in token
        if (STAFF_ROLES.includes(user.role as Role)) {
          token.exp = Math.floor(Date.now() / 1000) + 4 * 60 * 60
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      session.user.phone = token.phone as string | null
      session.user.employer_id = token.employer_id as string | null
      session.user.member_id = token.member_id as string | null
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
