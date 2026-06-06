import { redirect } from "next/navigation"

export default function DeathClaimsQueuePage() {
  redirect("/staff/cases?type=DEATH_BENEFITS_CLAIM")
}
