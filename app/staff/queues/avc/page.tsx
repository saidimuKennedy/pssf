import { redirect } from "next/navigation"

export default function AvcQueuePage() {
  redirect("/staff/cases?type=AVC")
}
