import { redirect } from "next/navigation"

export default async function AvcQueuePage() {
  redirect("/staff/cases?type=AVC")
}
