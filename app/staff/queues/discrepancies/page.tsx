import { redirect } from "next/navigation"

export default function DiscrepanciesQueuePage() {
  redirect("/staff/cases?type=DISCREPANCY")
}
