"use client"

import { useState, useRef } from "react"
import { Upload, CheckCircle2, Clock, XCircle, RefreshCw, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DocumentStatus = "PENDING" | "UPLOADED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED"

interface FileUploadSlotProps {
  documentType: string
  label: string
  required: boolean
  caseId: string
  currentStatus: DocumentStatus
  currentFileName?: string | null
  rejectionReason?: string | null
  onUploadSuccess?: (status: DocumentStatus, fileName: string) => void
}

const ACCEPTED = ".pdf,.jpg,.jpeg,.png"
const MAX_SIZE_MB = 5

export function FileUploadSlot({
  documentType,
  label,
  required,
  caseId,
  currentStatus,
  currentFileName,
  rejectionReason,
  onUploadSuccess,
}: FileUploadSlotProps) {
  const [status, setStatus] = useState<DocumentStatus>(currentStatus)
  const [fileName, setFileName] = useState<string | null>(currentFileName ?? null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const canUpload = status === "PENDING" || status === "REJECTED"
  const canReplace = status === "UPLOADED" || status === "REJECTED"

  async function handleFile(file: File) {
    setError(null)
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.")
      return
    }
    const allowed = ["application/pdf", "image/jpeg", "image/png"]
    if (!allowed.includes(file.type)) {
      setError("Only PDF, JPEG, and PNG files are accepted.")
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("case_id", caseId)
      fd.append("document_type", documentType)
      fd.append("file", file)

      const res = await fetch("/api/documents/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? "Upload failed")
        return
      }
      setStatus("UPLOADED")
      setFileName(file.name)
      onUploadSuccess?.("UPLOADED", file.name)
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  function triggerPicker() {
    fileRef.current?.click()
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-2",
        status === "VERIFIED" && "border-green-200 bg-green-50",
        status === "REJECTED" && "border-red-200 bg-red-50",
        status === "PENDING" && "border-gray-200 bg-white",
        status === "UPLOADED" && "border-blue-200 bg-blue-50",
        status === "UNDER_REVIEW" && "border-amber-200 bg-amber-50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-800">{label}</span>
          {required && (
            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Required</span>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      {fileName && (
        <p className="text-xs text-gray-600 truncate">{fileName}</p>
      )}

      {status === "REJECTED" && rejectionReason && (
        <p className="text-xs text-red-600">{rejectionReason}</p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />

      {canUpload && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={triggerPicker}
          className="w-full"
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          {uploading ? "Uploading…" : status === "REJECTED" ? "Re-upload" : "Upload"}
        </Button>
      )}

      {status === "UPLOADED" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={uploading}
          onClick={triggerPicker}
          className="w-full text-gray-600 hover:text-gray-800"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Replace
        </Button>
      )}

      {status === "PENDING" && (
        <p className="text-xs text-gray-400">
          Accepted: PDF, JPEG, PNG · Max 5MB
        </p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const map: Record<DocumentStatus, { label: string; icon: React.ReactNode; className: string }> = {
    PENDING: {
      label: "Pending",
      icon: <Clock className="w-3 h-3" />,
      className: "bg-gray-100 text-gray-600",
    },
    UPLOADED: {
      label: "Uploaded",
      icon: <CheckCircle2 className="w-3 h-3" />,
      className: "bg-blue-100 text-blue-700",
    },
    UNDER_REVIEW: {
      label: "Under Review",
      icon: <Clock className="w-3 h-3" />,
      className: "bg-amber-100 text-amber-700",
    },
    VERIFIED: {
      label: "Verified",
      icon: <CheckCircle2 className="w-3 h-3" />,
      className: "bg-green-100 text-green-700",
    },
    REJECTED: {
      label: "Rejected",
      icon: <XCircle className="w-3 h-3" />,
      className: "bg-red-100 text-red-700",
    },
  }
  const { label, icon, className } = map[status]
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", className)}>
      {icon}
      {label}
    </span>
  )
}
