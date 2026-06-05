import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"
import type { NextAuthConfig } from "next-auth"

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

        const user = await prisma.user.findUnique({ where: { phone } })
        if (!user || !user.is_active) return null

        const otp = await prisma.otpRequest.findFirst({
          where: {
            phone,
            verified: false,
            expires_at: { gt: new Date() },
            attempts: { lt: 3 },
          },
          orderBy: { created_at: "desc" },
        })
        if (!otp) return null

        const hash = hashOtp(code)
        if (otp.code !== hash) {
          await prisma.otpRequest.update({
            where: { id: otp.id },
            data: { attempts: { increment: 1 } },
          })
          return null
        }

        await prisma.otpRequest.update({
          where: { id: otp.id },
          data: { verified: true },
        })
        await prisma.user.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
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

        const otp = await prisma.otpRequest.findFirst({
          where: {
            email,
            verified: false,
            expires_at: { gt: new Date() },
            attempts: { lt: 3 },
          },
          orderBy: { created_at: "desc" },
        })
        if (!otp) return null

        const hash = hashOtp(code)
        if (otp.code !== hash) {
          await prisma.otpRequest.update({
            where: { id: otp.id },
            data: { attempts: { increment: 1 } },
          })
          return null
        }

        await prisma.otpRequest.update({
          where: { id: otp.id },
          data: { verified: true },
        })
        await prisma.user.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
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
        token.employer_id = user.employer_id ?? null
        token.member_id = user.member_id ?? null

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

export function hashOtp(code: string): string {
  const { createHash } = require("crypto") as typeof import("crypto")
  return createHash("sha256").update(code).digest("hex")
}
