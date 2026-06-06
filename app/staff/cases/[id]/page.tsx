import { auth } from "@/auth"
import { redirect } from "next/navigation"
import StaffCaseDetailClient from "./client"

export default async function StaffCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const { id } = await params
  return (
    <StaffCaseDetailClient
      caseId={id}
      userId={session.user.id}
      userRole={session.user.role}
    />
  )
}
