import { NextResponse } from "next/server"
import { signOut } from "@/auth"

async function handleLogout() {
  await signOut({ redirect: false })
  return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
}

export const GET = handleLogout
export const POST = handleLogout
