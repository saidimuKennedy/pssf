import { redirect } from "next/navigation"

export default async function BeneficiariesQueuePage() {
  redirect("/staff/cases?type=BENEFICIARY_NOMINATION")
}
