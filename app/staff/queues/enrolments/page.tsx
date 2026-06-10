import { redirect } from "next/navigation"

export default async function EnrolmentsQueuePage() {
  redirect("/staff/cases?type=MEMBER_ENROLMENT")
}
