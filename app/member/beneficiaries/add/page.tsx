"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react"
import { BENEFICIARY_STEPS, getSkippedSteps, nextAfterBeneficiaries } from "@/lib/beneficiaries/journey"
import { BeneficiarySchema, type BeneficiaryInput } from "@/lib/validations/beneficiaries"
import { cn } from "@/lib/utils"

interface BeneficiaryRecord {
  id: string
  surname: string
  first_name: string
  middle_name: string | null
  relationship: string
  national_id: string | null
  birth_cert_number: string | null
  date_of_birth: string
  mobile_number: string | null
  allocation_percent: string
  is_minor: boolean
}

export default function BeneficiaryAddPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [prefillLoading, setPrefillLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BeneficiaryInput>({
    resolver: zodResolver(BeneficiarySchema),
    defaultValues: {
      is_minor: false,
      relationship: "Child",
      allocation_percent: 0,
    },
  })

  const isMinor = watch("is_minor")
  const relationship = watch("relationship")

  const loadBeneficiaries = useCallback(async () => {
    if (!caseId) return
    const res = await fetch(`/api/cases/${caseId}/beneficiaries`)
    if (res.ok) {
      const data = await res.json()
      setBeneficiaries(
        (data.beneficiaries as BeneficiaryRecord[]).map((b) => ({
          ...b,
          date_of_birth: b.date_of_birth
            ? new Date(b.date_of_birth).toISOString().split("T")[0]
            : "",
        }))
      )
    }
  }, [caseId])

  useEffect(() => {
    loadBeneficiaries()
  }, [loadBeneficiaries])

  const allocationTotal = beneficiaries.reduce(
    (sum, b) => sum + Number(b.allocation_percent),
    0
  )
  const allocationValid = Math.abs(allocationTotal - 100) < 0.01
  const hasMinor = beneficiaries.some((b) => b.is_minor)

  function openAddForm() {
    setEditingId(null)
    reset({
      surname: "",
      first_name: "",
      middle_name: "",
      relationship: "Child",
      relationship_other: "",
      national_id: "",
      birth_cert_number: "",
      date_of_birth: "",
      mobile_number: "",
      allocation_percent: 0,
      is_minor: false,
    })
    setShowForm(true)
    setApiError(null)
  }

  function openEditForm(b: BeneficiaryRecord) {
    setEditingId(b.id)
    const relOptions = ["Child", "Spouse", "Parent", "Other"]
    const isStandard = relOptions.includes(b.relationship)
    reset({
      surname: b.surname,
      first_name: b.first_name,
      middle_name: b.middle_name ?? "",
      relationship: isStandard ? (b.relationship as BeneficiaryInput["relationship"]) : "Other",
      relationship_other: isStandard ? "" : b.relationship,
      national_id: b.national_id ?? "",
      birth_cert_number: b.birth_cert_number ?? "",
      date_of_birth: b.date_of_birth,
      mobile_number: b.mobile_number ?? "",
      allocation_percent: Number(b.allocation_percent),
      is_minor: b.is_minor,
    })
    setShowForm(true)
    setApiError(null)
  }

  async function handlePrefillId() {
    const nationalId = watch("national_id")
    const dob = watch("date_of_birth")
    if (!nationalId || !dob) {
      setApiError("Enter National ID and date of birth to validate.")
      return
    }
    setPrefillLoading(true)
    setApiError(null)
    try {
      const res = await fetch("/api/member/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ national_id: nationalId, date_of_birth: dob }),
      })
      const data = await res.json()
      if (data.matched && data.member) {
        const parts = data.member.full_name.split(" ")
        setValue("surname", parts[parts.length - 1] ?? "")
        setValue("first_name", parts[0] ?? "")
        setValue("middle_name", parts.slice(1, -1).join(" ") || undefined)
        if (data.member.mobile_number) setValue("mobile_number", data.member.mobile_number)
      } else {
        setApiError("No matching record found. You may enter details manually.")
      }
    } finally {
      setPrefillLoading(false)
    }
  }

  async function onSubmitForm(values: BeneficiaryInput) {
    if (!caseId) return
    setLoading(true)
    setApiError(null)
    try {
      const url = editingId
        ? `/api/cases/${caseId}/beneficiaries/${editingId}`
        : `/api/cases/${caseId}/beneficiaries`
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const body = await res.json()
        setApiError(body.error ?? "Failed to save beneficiary.")
        return
      }
      setShowForm(false)
      setEditingId(null)
      await loadBeneficiaries()
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(id: string) {
    if (!caseId) return
    const res = await fetch(`/api/cases/${caseId}/beneficiaries/${id}`, { method: "DELETE" })
    if (res.ok) await loadBeneficiaries()
  }

  function handleContinue() {
    if (beneficiaries.length === 0) {
      setApiError("Please add at least one beneficiary.")
      return
    }
    if (!allocationValid) {
      setApiError(
        `Your beneficiary allocations must total exactly 100%. Current total: ${allocationTotal.toFixed(2)}%.`
      )
      return
    }
    router.push(nextAfterBeneficiaries(caseId!, hasMinor))
  }

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start nomination again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <StepIndicator
        steps={[...BENEFICIARY_STEPS]}
        currentStep={3}
        skippedSteps={getSkippedSteps(hasMinor)}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0D2137]">Add Beneficiaries</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add each beneficiary and allocate percentages totalling exactly 100%.
          </p>
        </div>
        {!showForm && (
          <Button type="button" size="sm" onClick={openAddForm} className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        )}
      </div>

      <div
        className={cn(
          "rounded-lg border px-4 py-3 flex items-center justify-between",
          allocationValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        )}
      >
        <span className="text-sm font-medium text-gray-700">Total Allocation</span>
        <span
          className={cn(
            "text-lg font-bold",
            allocationValid ? "text-green-700" : "text-red-600"
          )}
        >
          {allocationTotal.toFixed(2)}%
        </span>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {beneficiaries.length > 0 && (
        <div className="space-y-3">
          {beneficiaries.map((b) => (
            <div
              key={b.id}
              className="rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-3"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {b.first_name} {b.middle_name ? `${b.middle_name} ` : ""}{b.surname}
                </p>
                <p className="text-sm text-gray-500">
                  {b.relationship} · {Number(b.allocation_percent)}%
                  {b.is_minor ? " · Minor" : ""}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => openEditForm(b)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(b.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {beneficiaries.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-8">
          No beneficiaries added yet. Click Add to get started.
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="rounded-lg border border-gray-200 p-5 space-y-4 bg-gray-50"
        >
          <h3 className="font-semibold text-gray-800">
            {editingId ? "Edit Beneficiary" : "New Beneficiary"}
          </h3>

          <div className="flex items-center gap-3">
            <Checkbox
              id="is_minor"
              checked={isMinor}
              onCheckedChange={(v) => setValue("is_minor", Boolean(v))}
            />
            <Label htmlFor="is_minor" className="cursor-pointer">
              Beneficiary is under 18 (minor)
            </Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Surname <span className="text-red-500">*</span></Label>
              <Input {...register("surname")} />
              {errors.surname && <p className="text-xs text-red-600">{errors.surname.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>First Name <span className="text-red-500">*</span></Label>
              <Input {...register("first_name")} />
              {errors.first_name && <p className="text-xs text-red-600">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Middle Name</Label>
              <Input {...register("middle_name")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Relationship <span className="text-red-500">*</span></Label>
              <Select
                value={relationship}
                onValueChange={(v) => setValue("relationship", v as BeneficiaryInput["relationship"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {relationship === "Other" && (
              <div className="space-y-1">
                <Label>Specify Relationship</Label>
                <Input {...register("relationship_other")} placeholder="e.g. Sibling" />
                {errors.relationship_other && (
                  <p className="text-xs text-red-600">{errors.relationship_other.message}</p>
                )}
              </div>
            )}
            <div className="space-y-1">
              <Label>Date of Birth <span className="text-red-500">*</span></Label>
              <Input type="date" {...register("date_of_birth")} />
              {errors.date_of_birth && (
                <p className="text-xs text-red-600">{errors.date_of_birth.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Allocation % <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                {...register("allocation_percent", { valueAsNumber: true })}
              />
              {errors.allocation_percent && (
                <p className="text-xs text-red-600">{errors.allocation_percent.message}</p>
              )}
            </div>
          </div>

          {!isMinor && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>National ID (optional)</Label>
                  <Input {...register("national_id")} placeholder="For prefill validation" />
                </div>
                <div className="space-y-1 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={prefillLoading}
                    onClick={handlePrefillId}
                    className="w-full"
                  >
                    {prefillLoading ? "Validating…" : "Validate & Prefill"}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Birth Certificate No. (optional)</Label>
                <Input {...register("birth_cert_number")} />
              </div>
            </div>
          )}

          {isMinor && (
            <div className="space-y-1">
              <Label>Birth Certificate Number <span className="text-red-500">*</span></Label>
              <Input {...register("birth_cert_number")} />
              {errors.birth_cert_number && (
                <p className="text-xs text-red-600">{errors.birth_cert_number.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label>Mobile Number</Label>
            <Input {...register("mobile_number")} placeholder="+254712345678" />
            {errors.mobile_number && (
              <p className="text-xs text-red-600">{errors.mobile_number.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
            >
              {loading ? "Saving…" : editingId ? "Update Beneficiary" : "Add Beneficiary"}
            </Button>
          </div>
        </form>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/member/beneficiaries/details?case_id=${caseId}`)}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!allocationValid || beneficiaries.length === 0}
          className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
