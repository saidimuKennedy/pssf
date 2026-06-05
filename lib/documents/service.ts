import { CaseType, DocumentStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit/log"
import { AuthError } from "@/lib/state-machine/guards"
import { getChecklist, evaluateCondition } from "./checklists"
import { getMimeType, DocumentError } from "./validation"

const UPLOADABLE_STATUSES: DocumentStatus[] = [
  DocumentStatus.UPLOADED,
  DocumentStatus.UNDER_REVIEW,
  DocumentStatus.VERIFIED,
]

export async function uploadDocument(
  caseId: string,
  documentType: string,
  buffer: Buffer,
  fileName: string,
  actorId: string,
  actorRole: Role
): Promise<{ id: string; document_type: string; status: string; file_name: string }> {
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })

  if (
    (actorRole === Role.MEMBER || actorRole === Role.CLAIMANT) &&
    caseRecord.member_id !== actorId
  ) {
    throw new AuthError("FORBIDDEN", "Cannot upload to this case")
  }
  if (actorRole === Role.EMPLOYER && caseRecord.employer_id !== actorId) {
    throw new AuthError("FORBIDDEN", "Cannot upload to this case")
  }

  const mime = getMimeType(buffer)
  if (!mime) {
    throw new DocumentError("FILE_TYPE_NOT_ACCEPTED", "Only PDF, JPEG, and PNG files are accepted")
  }

  const fileSizeKb = Math.ceil(buffer.length / 1024)

  const doc = await (prisma.document.create as any)({
    data: {
      case_id: caseId,
      document_type: documentType,
      file_name: fileName,
      file_data: buffer,
      mime_type: mime,
      file_size_kb: fileSizeKb,
      status: DocumentStatus.UPLOADED,
      uploaded_by: actorId,
      uploaded_at: new Date(),
    },
  })

  await logAuditEvent({
    case_id: caseId,
    action: "DOCUMENT_UPLOADED",
    actor_id: actorId,
    actor_role: actorRole,
    metadata: { document_type: documentType, file_name: fileName, document_id: doc.id },
  })

  return {
    id: doc.id,
    document_type: doc.document_type,
    status: doc.status,
    file_name: doc.file_name,
  }
}

export async function getDocument(
  documentId: string,
  actorId: string,
  actorRole: Role
): Promise<{
  id: string
  file_data: Buffer
  mime_type: string
  file_name: string
  document_type: string
  status: string
}> {
  const doc = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
    include: { case: true },
  })

  if (!doc.file_data) {
    throw new AuthError("NOT_FOUND", "Document has no file data")
  }

  if (
    (actorRole === Role.MEMBER || actorRole === Role.CLAIMANT) &&
    doc.case.member_id !== actorId
  ) {
    throw new AuthError("FORBIDDEN", "Cannot access this document")
  }
  if (actorRole === Role.EMPLOYER && doc.case.employer_id !== actorId) {
    throw new AuthError("FORBIDDEN", "Cannot access this document")
  }

  return {
    id: doc.id,
    file_data: doc.file_data as Buffer,
    mime_type: doc.mime_type ?? "application/octet-stream",
    file_name: doc.file_name ?? "document",
    document_type: doc.document_type,
    status: doc.status,
  }
}

export async function replaceDocument(
  documentId: string,
  buffer: Buffer,
  fileName: string,
  actorId: string,
  actorRole: Role
): Promise<void> {
  const doc = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
    include: { case: true },
  })

  const isMemberRole = actorRole === Role.MEMBER || actorRole === Role.CLAIMANT
  const isPssfRole = actorRole === Role.PSSF_OFFICER || actorRole === Role.PSSF_SUPERVISOR

  if (isMemberRole) {
    if (doc.case.member_id !== actorId) {
      throw new AuthError("FORBIDDEN", "Cannot replace this document")
    }
    const replaceableStatuses: DocumentStatus[] = [DocumentStatus.UPLOADED, DocumentStatus.REJECTED]
    if (!replaceableStatuses.includes(doc.status)) {
      throw new DocumentError("REPLACE_NOT_ALLOWED", "Cannot replace a verified document")
    }
  } else if (!isPssfRole) {
    throw new AuthError("FORBIDDEN", "Insufficient permissions to replace documents")
  }

  const mime = getMimeType(buffer)
  if (!mime) {
    throw new DocumentError("FILE_TYPE_NOT_ACCEPTED", "Only PDF, JPEG, and PNG files are accepted")
  }

  const fileSizeKb = Math.ceil(buffer.length / 1024)
  const previousFileName = doc.file_name

  await (prisma.document.update as any)({
    where: { id: documentId },
    data: {
      file_name: fileName,
      file_data: buffer,
      mime_type: mime,
      file_size_kb: fileSizeKb,
      status: DocumentStatus.UPLOADED,
      uploaded_by: actorId,
      uploaded_at: new Date(),
      rejection_reason: null,
    },
  })

  await logAuditEvent({
    case_id: doc.case_id,
    action: "DOCUMENT_REPLACED",
    actor_id: actorId,
    actor_role: actorRole,
    metadata: {
      document_id: documentId,
      previous_file_name: previousFileName,
      new_file_name: fileName,
    },
  })
}

export async function verifyDocument(
  documentId: string,
  actorId: string,
  actorRole: Role
): Promise<void> {
  const allowedRoles: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!(allowedRoles as Role[]).includes(actorRole)) {
    throw new AuthError("FORBIDDEN", "Only PSSF staff can verify documents")
  }

  const doc = await prisma.document.findUniqueOrThrow({ where: { id: documentId } })

  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: DocumentStatus.VERIFIED,
      reviewed_by: actorId,
      reviewed_at: new Date(),
    },
  })

  await logAuditEvent({
    case_id: doc.case_id,
    action: "DOCUMENT_VERIFIED",
    actor_id: actorId,
    actor_role: actorRole,
    metadata: { document_id: documentId, document_type: doc.document_type },
  })
}

export async function rejectDocument(
  documentId: string,
  reason: string,
  actorId: string,
  actorRole: Role
): Promise<void> {
  const allowedRoles: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!(allowedRoles as Role[]).includes(actorRole)) {
    throw new AuthError("FORBIDDEN", "Only PSSF staff can reject documents")
  }

  const doc = await prisma.document.findUniqueOrThrow({ where: { id: documentId } })

  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: DocumentStatus.REJECTED,
      rejection_reason: reason,
      reviewed_by: actorId,
      reviewed_at: new Date(),
    },
  })

  await logAuditEvent({
    case_id: doc.case_id,
    action: "DOCUMENT_REJECTED",
    actor_id: actorId,
    actor_role: actorRole,
    metadata: { document_id: documentId, document_type: doc.document_type, reason },
  })
}

export async function validateSubmissionDocuments(
  caseId: string,
  caseType: CaseType,
  formData: Record<string, unknown>
): Promise<{ valid: boolean; missing: string[] }> {
  const checklist = getChecklist(caseType)
  const documents = await prisma.document.findMany({ where: { case_id: caseId } })

  const uploadedTypes = new Set(
    documents
      .filter((d) => (UPLOADABLE_STATUSES as DocumentStatus[]).includes(d.status))
      .map((d) => d.document_type)
  )

  const missing: string[] = []
  for (const req of checklist) {
    const isRequired =
      req.required ||
      (req.condition ? evaluateCondition(req.condition, formData) : false)

    if (isRequired && !uploadedTypes.has(req.type)) {
      missing.push(req.type)
    }
  }

  return { valid: missing.length === 0, missing }
}
