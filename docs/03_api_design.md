# PSSF — API Design Document

**Version:** 1.0  
**Status:** Approved for implementation  
**Base URL:** `/api`  
**Auth:** Bearer token via Auth.js session. All protected routes require a valid session. Role is read from the session and enforced per endpoint.

---

## Conventions

- All request and response bodies are JSON
- Dates are ISO 8601 strings
- Errors follow a consistent shape: `{ error: string, code: string, details?: object }`
- Pagination uses `{ page, limit, total, data[] }`
- File uploads use `multipart/form-data`
- All UUIDs are strings

---

## Auth

### POST /api/auth/request-otp
Request an OTP to a phone number or email.

**Auth:** Public  
**Body:**
```json
{ "phone": "+254700000000" }
// or
{ "email": "member@example.com" }
```
**Response 200:**
```json
{ "message": "OTP sent", "expires_in": 300 }
```

---

### POST /api/auth/verify-otp
Verify an OTP code.

**Auth:** Public  
**Body:**
```json
{ "phone": "+254700000000", "code": "123456" }
```
**Response 200:**
```json
{ "verified": true, "token": "..." }
```

---

### POST /api/auth/login
Login with email and password.

**Auth:** Public  
**Body:**
```json
{ "email": "officer@pssf.go.ke", "password": "..." }
```
**Response 200:**
```json
{ "user": { "id": "...", "role": "PSSF_OFFICER", "name": "..." }, "token": "..." }
```

---

### POST /api/auth/logout
End the current session.

**Auth:** Required  
**Response 200:**
```json
{ "message": "Logged out" }
```

---

## Member

### POST /api/member/validate
Validate a member by national ID and date of birth. Returns prefill data.

**Auth:** Public (used before account creation)  
**Body:**
```json
{ "national_id": "12345678", "date_of_birth": "1980-05-15" }
```
**Response 200:**
```json
{
  "matched": true,
  "member": {
    "full_name": "John Kamau Mwangi",
    "national_id": "12345678",
    "date_of_birth": "1980-05-15",
    "employer_name": "Ministry of Health",
    "personal_number": "EMP-0034567",
    "member_number": "PSSF-0012345",
    "date_of_employment": "2005-03-01",
    "date_joined_scheme": "2005-03-01",
    "mobile_number": "+254700000000",
    "email": "john.kamau@health.go.ke"
  }
}
```
**Response 200 (no match):**
```json
{ "matched": false }
```

---

### GET /api/member/profile
Get the authenticated member's profile.

**Auth:** MEMBER, CLAIMANT  
**Response 200:**
```json
{
  "id": "...",
  "full_name": "...",
  "national_id": "...",
  "member_number": "...",
  "employer_name": "...",
  "mobile_number": "...",
  "email": "...",
  "communication_pref": "WHATSAPP"
}
```

---

### PATCH /api/member/profile
Update editable contact fields only.

**Auth:** MEMBER  
**Body:**
```json
{
  "mobile_number": "+254711000000",
  "email": "new@example.com",
  "postal_address": "P.O. Box 1234",
  "postal_code": "00100",
  "town": "Nairobi",
  "communication_pref": "EMAIL"
}
```
**Response 200:** Updated member profile

---

### GET /api/member/contributions
Get the member's contribution statement.

**Auth:** MEMBER  
**Query:** `?period=CURRENT_YEAR | LAST_12 | LAST_24 | FULL | CUSTOM&from=&to=`  
**Response 200:**
```json
{
  "member_number": "PSSF-0012345",
  "full_name": "John Kamau Mwangi",
  "employer_name": "Ministry of Health",
  "period": { "from": "2024-01-01", "to": "2024-12-31" },
  "summary": {
    "total_employee": 450000,
    "total_employer": 450000,
    "interest_earned": 72000,
    "total_balance": 972000
  },
  "employee_contributions": [
    { "month": "2024-01", "amount": 37500, "date_received": "2024-01-31", "status": "RECEIVED" }
  ],
  "employer_contributions": [
    { "month": "2024-01", "amount": 37500, "date_received": "2024-01-31", "status": "RECEIVED" }
  ],
  "last_updated": "2024-12-15T09:00:00Z"
}
```

---

## Cases

### POST /api/cases
Create a new case (starts a journey).

**Auth:** MEMBER, CLAIMANT  
**Body:**
```json
{ "type": "MEMBER_ENROLMENT", "member_id": "..." }
```
**Response 201:**
```json
{ "id": "...", "reference": "ENR-2024-000001", "type": "MEMBER_ENROLMENT", "status": "DRAFT" }
```

---

### GET /api/cases
List cases. Scope enforced by role.

**Auth:** All roles  
**Query:** `?status=&type=&page=1&limit=20&search=`  
**Response 200:**
```json
{
  "total": 42,
  "page": 1,
  "limit": 20,
  "data": [
    { "id": "...", "reference": "ENR-2024-000001", "type": "MEMBER_ENROLMENT", "status": "UNDER_REVIEW", "member_name": "John Kamau", "created_at": "..." }
  ]
}
```

---

### GET /api/cases/:id
Get full case detail.

**Auth:** All roles (scoped)  
**Response 200:**
```json
{
  "id": "...",
  "reference": "ENR-2024-000001",
  "type": "MEMBER_ENROLMENT",
  "status": "UNDER_REVIEW",
  "member": { "...prefilled fields" },
  "form_data": { "...journey specific fields" },
  "documents": [ { "id": "...", "document_type": "NATIONAL_ID", "status": "VERIFIED" } ],
  "approvals": [ { "type": "EMPLOYER", "decision": "APPROVED", "actor_name": "...", "created_at": "..." } ],
  "status_history": [ { "from_status": "SUBMITTED", "to_status": "UNDER_REVIEW", "created_at": "..." } ],
  "tasks": [ { "task_type": "REVIEW_ENROLMENT", "status": "IN_PROGRESS" } ],
  "notes": [],
  "created_at": "...",
  "submitted_at": "...",
  "updated_at": "..."
}
```

---

### PATCH /api/cases/:id
Update form data on a DRAFT case.

**Auth:** MEMBER, CLAIMANT  
**Body:**
```json
{ "form_data": { "...updated fields" } }
```
**Response 200:** Updated case

---

### POST /api/cases/:id/submit
Submit a case. Triggers routing and task generation.

**Auth:** MEMBER, CLAIMANT  
**Body:**
```json
{ "declaration_accepted": true, "otp_verified": true }
```
**Response 200:**
```json
{ "status": "SUBMITTED", "message": "Your case has been submitted successfully.", "reference": "ENR-2024-000001" }
```

---

### POST /api/cases/:id/additional-info
Member responds to a more information request.

**Auth:** MEMBER, CLAIMANT  
**Body:**
```json
{ "response": "I have uploaded the corrected document.", "documents": ["doc_id_1"] }
```
**Response 200:** Updated case

---

### POST /api/cases/:id/notes
Add an internal note to a case.

**Auth:** PSSF_OFFICER, PSSF_SUPERVISOR  
**Body:**
```json
{ "content": "Awaiting employer stamp verification.", "is_internal": true }
```
**Response 201:** Created note

---

### POST /api/cases/:id/reassign
Reassign a case to another officer.

**Auth:** PSSF_SUPERVISOR  
**Body:**
```json
{ "assigned_to": "user_id", "reason": "Officer on leave" }
```
**Response 200:** Updated case

---

### POST /api/cases/:id/close
Close a resolved or rejected case.

**Auth:** PSSF_SUPERVISOR  
**Body:**
```json
{ "reason": "Case rejected and member notified." }
```
**Response 200:** Updated case

---

## Approvals

### POST /api/approvals/employer
Employer officer records their decision on a case.

**Auth:** EMPLOYER  
**Body:**
```json
{
  "case_id": "...",
  "decision": "APPROVED",
  "actor_name": "Jane Wanjiru",
  "designation": "HR Manager",
  "comments": "Employment details confirmed.",
  "effective_month": "2024-02"
}
```
**Response 201:** Created approval event

---

### POST /api/approvals/pssf
PSSF officer records their decision.

**Auth:** PSSF_OFFICER, PSSF_SUPERVISOR  
**Body:**
```json
{
  "case_id": "...",
  "decision": "REQUEST_MORE_INFO",
  "reason": "Death certificate is not certified.",
  "comments": "Please provide a certified copy from the registrar."
}
```
**Response 201:** Created approval event

---

### POST /api/approvals/trustee
Record a trustee decision on a death benefits case.

**Auth:** PSSF_SUPERVISOR  
**Body:**
```json
{
  "case_id": "...",
  "decision": "APPROVED",
  "comments": "Trustees have reviewed and approved."
}
```
**Response 201:** Created approval event

---

## Documents

### POST /api/documents/upload
Upload a document to a case.

**Auth:** MEMBER, CLAIMANT, EMPLOYER, PSSF_OFFICER, PSSF_SUPERVISOR  
**Content-Type:** `multipart/form-data`  
**Body:**
```
case_id: "..."
document_type: "NATIONAL_ID"
file: <binary>
```
**Response 201:**
```json
{ "id": "...", "document_type": "NATIONAL_ID", "status": "UPLOADED", "file_name": "id_copy.pdf" }
```

---

### GET /api/documents/:id
Download a document file.

**Auth:** All roles (scoped — member sees own, employer sees their cases, PSSF sees all)  
**Response 200:** Binary file stream with correct `Content-Type`

---

### POST /api/documents/:id/verify
Mark a document as verified.

**Auth:** PSSF_OFFICER, PSSF_SUPERVISOR  
**Response 200:**
```json
{ "status": "VERIFIED" }
```

---

### POST /api/documents/:id/reject
Reject a document with a reason.

**Auth:** PSSF_OFFICER, PSSF_SUPERVISOR  
**Body:**
```json
{ "reason": "Document is not certified by a Commissioner for Oaths." }
```
**Response 200:**
```json
{ "status": "REJECTED", "rejection_reason": "..." }
```

---

## Tasks

### GET /api/tasks
Get tasks for the current actor.

**Auth:** All roles  
**Query:** `?status=PENDING&type=&page=1&limit=20`  
**Response 200:**
```json
{
  "total": 8,
  "data": [
    { "id": "...", "task_type": "REVIEW_ENROLMENT", "case_reference": "ENR-2024-000001", "status": "PENDING", "due_at": "...", "created_at": "..." }
  ]
}
```

---

### POST /api/tasks/:id/complete
Mark a task as completed.

**Auth:** All roles (own tasks only)  
**Response 200:**
```json
{ "status": "COMPLETED", "completed_at": "..." }
```

---

## Notifications

### GET /api/notifications
Get portal notifications for the current user.

**Auth:** All roles  
**Query:** `?unread=true&page=1&limit=20`  
**Response 200:**
```json
{
  "total": 5,
  "data": [
    { "id": "...", "message": "Your enrolment has been approved.", "read": false, "created_at": "..." }
  ]
}
```

---

### POST /api/notifications/:id/read
Mark a notification as read.

**Auth:** All roles  
**Response 200:** `{ "read": true }`

---

### POST /api/notifications/send
Internal — trigger a notification dispatch. Called by server actions, not the client directly.

**Auth:** System (server-side only)  
**Body:**
```json
{
  "case_id": "...",
  "recipient_id": "...",
  "trigger_event": "CASE_APPROVED",
  "channels": ["WHATSAPP", "EMAIL", "PORTAL"]
}
```
**Response 200:** `{ "dispatched": 3 }`

---

## Admin

### GET /api/admin/users
List all users.

**Auth:** ADMIN  
**Query:** `?role=&page=1&limit=20&search=`  
**Response 200:** Paginated user list

---

### POST /api/admin/users
Create a new staff or employer user.

**Auth:** ADMIN  
**Body:**
```json
{ "email": "...", "role": "PSSF_OFFICER", "full_name": "...", "employer_id": "..." }
```
**Response 201:** Created user

---

### PATCH /api/admin/users/:id
Update a user's role or status.

**Auth:** ADMIN  
**Body:**
```json
{ "role": "PSSF_SUPERVISOR", "is_active": true }
```
**Response 200:** Updated user

---

### GET /api/admin/employers
List all employers.

**Auth:** ADMIN, PSSF_SUPERVISOR  
**Response 200:** Paginated employer list

---

### POST /api/admin/employers
Create a new employer record.

**Auth:** ADMIN  
**Body:**
```json
{ "name": "Ministry of Education", "code": "MOE" }
```
**Response 201:** Created employer

---

### GET /api/admin/audit
Export audit events.

**Auth:** ADMIN, PSSF_SUPERVISOR  
**Query:** `?case_id=&actor_id=&from=&to=&page=1&limit=100`  
**Response 200:** Paginated audit event list

---

### GET /api/admin/notification-rules
List notification rules.

**Auth:** ADMIN  
**Response 200:** All notification rules

---

### PATCH /api/admin/notification-rules/:id
Enable or disable a notification rule.

**Auth:** ADMIN  
**Body:**
```json
{ "is_active": false }
```
**Response 200:** Updated rule

---

## Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Valid session but insufficient role |
| `NOT_FOUND` | 404 | Resource does not exist or is out of scope |
| `VALIDATION_ERROR` | 422 | Request body failed Zod validation |
| `INVALID_STATUS_TRANSITION` | 422 | Attempted status change is not permitted |
| `OTP_EXPIRED` | 422 | OTP code has expired |
| `OTP_INVALID` | 422 | OTP code is incorrect |
| `MEMBER_NOT_FOUND` | 404 | National ID and DOB did not match any record |
| `CASE_NOT_EDITABLE` | 422 | Case is not in DRAFT status |
| `ALLOCATION_INVALID` | 422 | Beneficiary allocation does not total 100% |
| `DOCUMENT_REQUIRED` | 422 | Required document not yet uploaded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
