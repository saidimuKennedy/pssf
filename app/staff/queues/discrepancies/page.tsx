import { redirect } from "next/navigation"

export default async function DiscrepanciesQueuePage() {
  redirect("/staff/cases?type=DISCREPANCY")
}
