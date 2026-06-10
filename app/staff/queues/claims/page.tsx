import { redirect } from "next/navigation"

export default async function ClaimsQueuePage() {
  redirect("/staff/cases?type=BENEFITS_CLAIM")
}
