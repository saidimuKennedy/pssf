const MAX_SIZE_BYTES = 5 * 1024 * 1024

export class DocumentError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "DocumentError"
  }
}

export function getMimeType(buffer: Buffer): string | null {
  // PDF: %PDF = 25 50 44 46
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return "application/pdf"
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg"
  }
  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png"
  }
  return null
}

export function validateFileType(buffer: Buffer): void {
  const mime = getMimeType(buffer)
  if (!mime) {
    throw new DocumentError(
      "FILE_TYPE_NOT_ACCEPTED",
      "Only PDF, JPEG, and PNG files are accepted"
    )
  }
}

export function validateFileSize(buffer: Buffer): void {
  if (buffer.length > MAX_SIZE_BYTES) {
    throw new DocumentError("FILE_TOO_LARGE", "File exceeds maximum size of 5MB")
  }
}
