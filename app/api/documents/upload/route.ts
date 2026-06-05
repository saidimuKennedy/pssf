import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { uploadDocument } from "@/lib/documents/service"
import { validateFileType, validateFileSize, DocumentError } from "@/lib/documents/validation"
import { UploadDocumentSchema } from "@/lib/validations/documents"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data", code: "VALIDATION_ERROR" },
      { status: 400 }
    )
  }

  const caseId = formData.get("case_id")
  const documentType = formData.get("document_type")
  const file = formData.get("file")

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided", code: "VALIDATION_ERROR" },
      { status: 400 }
    )
  }

  const parsed = UploadDocumentSchema.safeParse({ case_id: caseId, document_type: documentType })
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    validateFileSize(buffer)
    validateFileType(buffer)
  } catch (err) {
    if (err instanceof DocumentError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 422 })
    }
    throw err
  }

  try {
    const doc = await uploadDocument(
      parsed.data.case_id,
      parsed.data.document_type,
      buffer,
      file.name,
      session.user.id,
      session.user.role
    )
    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    if (err instanceof DocumentError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 422 })
    }
    console.error(err)
    return NextResponse.json(
      { error: "Failed to upload document", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
