import { redirect } from "next/navigation"

export default async function DeathClaimsQueuePage() {
  redirect("/staff/cases?type=DEATH_BENEFITS_CLAIM")
}
