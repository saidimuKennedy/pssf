import { redirect } from "next/navigation"

export default function ClaimsQueuePage() {
  redirect("/staff/cases?type=BENEFITS_CLAIM")
}
