# PSSF — Document Handling Specification

**Version:** 1.0  
**Status:** Approved for implementation

---

## Storage Strategy

Documents are stored in PostgreSQL as binary data (`Bytes` in Prisma) for Phase 1. No external storage provider is required.

File data is stored in the `file_data` column of the `documents` table alongside metadata. Files are served directly from the database via the `/api/documents/:id` endpoint.

When storage volume requires it, the `file_data` column is replaced with a `file_url` column pointing to an external object store. The API contract does not change.

---

## Accepted File Types

| Type | MIME Types |
|---|---|
| PDF | `application/pdf` |
| JPEG | `image/jpeg` |
| PNG | `image/png` |

No other file types are accepted. The server validates MIME type from the file buffer, not the filename extension.

---

## File Size Limit

Maximum file size: **5 MB** per document.

Files exceeding this limit are rejected with a `VALIDATION_ERROR` response before they reach the database.

---

## Document Types

The following document type identifiers are used across cases:

| Identifier | Label |
|---|---|
| `NATIONAL_ID` | National ID or Passport copy |
| `BIRTH_CERTIFICATE` | Birth certificate |
| `DEATH_CERTIFICATE` | Death certificate |
| `MARRIAGE_CERTIFICATE` | Marriage certificate or affidavit |
| `EXIT_LETTER` | Letter confirming exit from service |
| `ATM_CARD` | Front page of ATM card |
| `KRA_PIN` | KRA PIN certificate |
| `GUARDIAN_ID` | Guardian National ID |
| `PROOF_OF_RESIDENCY` | Proof of permanent residency abroad |
| `OPTION_ELECTION` | Option election form (age 45+ rule) |
| `PAYSLIP` | Payslip (for missing contribution report) |
| `SUPPORTING` | General supporting document |

---

## Document Checklist by Journey Type

Checklists are defined in the service layer as configuration, not hardcoded in the UI.

```typescript
// lib/documents/checklists.ts

export const DOCUMENT_CHECKLISTS: Record<CaseType, DocumentRequirement[]> = {
  MEMBER_ENROLMENT: [
    { type: "NATIONAL_ID", required: true }
  ],
  BENEFICIARY_NOMINATION: [
    { type: "NATIONAL_ID", required: true },
    { type: "BIRTH_CERTIFICATE", required: false, condition: "has_minor_beneficiary" },
    { type: "GUARDIAN_ID", required: false, condition: "has_minor_beneficiary" }
  ],
  BENEFITS_CLAIM: [
    { type: "EXIT_LETTER", required: true },
    { type: "NATIONAL_ID", required: true },
    { type: "ATM_CARD", required: true },
    { type: "KRA_PIN", required: true },
    { type: "PROOF_OF_RESIDENCY", required: false, condition: "reason_is_emigration" },
    { type: "OPTION_ELECTION", required: false, condition: "joined_at_45_plus" }
  ],
  DEATH_BENEFITS_CLAIM: [
    { type: "DEATH_CERTIFICATE", required: true },
    { type: "MARRIAGE_CERTIFICATE", required: false, condition: "has_spouse_claimant" },
    { type: "BIRTH_CERTIFICATE", required: false, condition: "has_child_claimant" },
    { type: "NATIONAL_ID", required: true },
    { type: "ATM_CARD", required: true }
  ],
  MISSING_CONTRIBUTION: [
    { type: "PAYSLIP", required: false },
    { type: "SUPPORTING", required: false }
  ],
  DISCREPANCY: [
    { type: "SUPPORTING", required: true }
  ],
  AVC: [],
  BENEFICIARY_NOMINATION: []
}
```

---

## Upload Flow

### Client

1. User selects a file using a file input
2. Client validates file type and size before upload
3. Client sends `multipart/form-data` POST to `/api/documents/upload`
4. Upload progress is shown via a progress indicator
5. On success, document slot status updates to `UPLOADED`
6. On failure, error message is shown with the rejection reason

### Server

1. Receives multipart form data
2. Validates: authenticated session, case ownership, file type, file size
3. Reads file buffer
4. Inserts `Document` record with `file_data`, `mime_type`, `file_name`, `file_size_kb`, `status: UPLOADED`
5. Writes `AuditEvent` for the upload
6. Returns document metadata (never returns file data in upload response)

---

## Retrieval Flow

```
GET /api/documents/:id
```

1. Validates session and scoping — member sees own case documents, employer sees their cases, PSSF sees all
2. Fetches document record including `file_data`
3. Sets `Content-Type` header from `mime_type`
4. Sets `Content-Disposition: inline; filename="[file_name]"` for viewing
5. Streams binary data in response

For downloads, client appends `?download=true` which changes `Content-Disposition` to `attachment`.

---

## Document Status Lifecycle

```
PENDING     — Document slot exists but no file has been uploaded yet
UPLOADED    — File has been uploaded, awaiting PSSF review
UNDER_REVIEW — PSSF officer has opened the document
VERIFIED    — PSSF officer has marked the document as verified
REJECTED    — PSSF officer has rejected the document with a reason
```

### Transition rules

| From | To | Triggered by |
|---|---|---|
| PENDING | UPLOADED | Member, Claimant, Employer, or PSSF uploads file |
| UPLOADED | UNDER_REVIEW | PSSF officer opens the document |
| UNDER_REVIEW | VERIFIED | PSSF officer calls `/api/documents/:id/verify` |
| UNDER_REVIEW | REJECTED | PSSF officer calls `/api/documents/:id/reject` |
| REJECTED | UPLOADED | Member re-uploads a replacement file |

Every transition writes an `AuditEvent`.

---

## Submission Validation

A Case cannot be submitted if any required document is in status `PENDING`. The submission endpoint checks the document checklist for the case type and rejects with `DOCUMENT_REQUIRED` if any required slot has not been uploaded.

Conditional documents are only checked when their condition is met. The condition is evaluated against the case's `form_data` JSONB field.

---

## Replacement Policy

- Members may replace a document that is in `UPLOADED` or `REJECTED` status
- Members may not replace a document that is `VERIFIED`
- PSSF Officers may replace any document at any status
- Replacement overwrites the `file_data`, `file_name`, `mime_type`, and `file_size_kb` fields
- Replacement resets status to `UPLOADED`
- Replacement writes an `AuditEvent` recording the previous and new file names

---

## Security Rules

- Documents are never returned in list responses — only metadata
- File data is only returned via the explicit GET `/api/documents/:id` endpoint
- Scoping is enforced at the service layer — a member cannot retrieve a document from another member's case even if they know the document ID
- File type is validated from the buffer magic bytes, not the filename extension
- Maximum file size is enforced server-side before the buffer is written to the database
