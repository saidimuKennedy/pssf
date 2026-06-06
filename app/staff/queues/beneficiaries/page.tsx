import { redirect } from "next/navigation"

export default function BeneficiariesQueuePage() {
  redirect("/staff/cases?type=BENEFICIARY_NOMINATION")
}
