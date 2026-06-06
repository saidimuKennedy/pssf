import { redirect } from "next/navigation"

export default function MissingQueuePage() {
  redirect("/staff/cases?type=MISSING_CONTRIBUTION")
}
