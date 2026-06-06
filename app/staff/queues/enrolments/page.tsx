import { redirect } from "next/navigation"

export default function EnrolmentsQueuePage() {
  redirect("/staff/cases?type=MEMBER_ENROLMENT")
}
