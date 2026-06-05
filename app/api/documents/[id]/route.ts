import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDocument } from "@/lib/documents/service"
import { AuthError } from "@/lib/state-machine/guards"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const { id } = await params
  const download = req.nextUrl.searchParams.get("download") === "true"

  try {
    const doc = await getDocument(id, session.user.id, session.user.role)

    const disposition = download
      ? `attachment; filename="${doc.file_name}"`
      : `inline; filename="${doc.file_name}"`

    return new NextResponse(new Uint8Array(doc.file_data), {
      status: 200,
      headers: {
        "Content-Type": doc.mime_type,
        "Content-Disposition": disposition,
        "Content-Length": String(doc.file_data.length),
      },
    })
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.name === "FORBIDDEN" ? 403 : 404
      return NextResponse.json({ error: err.message, code: err.name }, { status })
    }
    console.error(err)
    return NextResponse.json(
      { error: "Failed to retrieve document", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
