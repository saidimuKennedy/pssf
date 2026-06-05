import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Role } from "@prisma/client"

const ROLE_HOME: Record<Role, string> = {
  MEMBER: "/member/dashboard",
  CLAIMANT: "/member/dashboard",
  EMPLOYER: "/employer/dashboard",
  PSSF_OFFICER: "/staff/dashboard",
  PSSF_SUPERVISOR: "/staff/dashboard",
  ADMIN: "/admin/dashboard",
}

export async function proxy(req: NextRequest) {
  const session = await auth()
  const { pathname } = req.nextUrl
  const isAuthenticated = !!session?.user

  if (isAuthenticated && (pathname === "/login" || pathname === "/sign-up")) {
    const home = ROLE_HOME[session!.user.role]
    return NextResponse.redirect(new URL(home, req.url))
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = session!.user.role

  if (pathname.startsWith("/member") && role !== "MEMBER" && role !== "CLAIMANT") {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url))
  }
  if (pathname.startsWith("/employer") && role !== "EMPLOYER") {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url))
  }
  if (pathname.startsWith("/staff") && role !== "PSSF_OFFICER" && role !== "PSSF_SUPERVISOR") {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url))
  }
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/member/:path*",
    "/employer/:path*",
    "/staff/:path*",
    "/admin/:path*",
    "/api/member/:path*",
    "/api/cases/:path*",
    "/api/approvals/:path*",
    "/api/documents/:path*",
    "/api/tasks/:path*",
    "/api/notifications/:path*",
    "/api/admin/:path*",
  ],
}
