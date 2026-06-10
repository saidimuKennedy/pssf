import { redirect } from "next/navigation"

export default async function MissingQueuePage() {
  redirect("/staff/cases?type=MISSING_CONTRIBUTION")
}
