# PSSF Smart Self-Service Platform — Architecture Document

**Version:** 0.3 — Approved  
**Date:** June 2026  
**Status:** APPROVED — Ready for Technical Design, Database Design, API Design, and UI Design

---

## 1. What We Are Building

The PSSF Smart Self-Service Platform is a statutory-compliant hybrid digital platform that digitizes all seven pension service journeys for the Public Service Superannuation Fund.

It is not a replacement of statutory forms. It is a digitization of them — all fields, declarations, routing steps, and approval requirements are preserved exactly as defined in PSSF.1 through PSSF.5.

### 1.1 Two delivery surfaces

**Surface 1 — Web portal (system of record)**

All transactions, form completions, document uploads, employer approvals, staff reviews, and audit trails happen here. This is the authoritative surface.

**Surface 2 — WhatsApp (communication rail)**

OTP delivery, milestone notifications, and contribution statement summaries delivered through the Chatnation CRM. WhatsApp carries no transactional weight. It is a communication channel only. The PSSF platform triggers events and passes payloads to the CRM — the CRM handles all WhatsApp delivery.

### 1.2 Data strategy

For the demo and Phase 1, the platform uses seeded internal data instead of waiting for PSSF API integration. This is a deliberate decision that controls pace without compromising architecture.

The critical rule is that the portal never talks directly to seed tables. Even in the demo, all data access goes through a service layer. When PSSF provides real APIs, only the service layer changes. The portal does not change.

```
Demo / Phase 1
Portal → Application APIs → Services → Seed Database

Phase 2 (PSSF integration)
Portal → Application APIs → Services → PSSF API
```

The portal is insulated from the data source at every stage.

---

## 2. Domain Separation

Two important boundaries were identified during architecture review.

### 2.1 Sign Up is Auth, not a Case

Account activation is an authentication concern, not a workflow concern. Sign Up lives in the Auth domain and is handled entirely outside the Case engine.

```
Auth Domain        — Sign Up, OTP verification, login, session management
Case Domain        — All seven statutory service journeys
```

These two domains do not overlap. A member must complete Auth before they can interact with the Case domain, but Auth completion does not create a Case.

### 2.2 Contribution Statement is a query, not a Case

Viewing a contribution statement is a read operation against member and contribution records. It does not initiate a workflow and should not produce a Case.

```
Statement Service  — Validates member, queries contribution records, returns formatted statement
Case Engine        — Not involved
```

A Case is only created from a statement interaction when the member takes a follow-up action:

- Report a missing contribution → creates a `MISSING_CONTRIBUTION` Case
- Request clarification → creates a `DISCREPANCY` Case

Viewing, downloading, or forwarding a statement never touches the Case engine.

---

## 3. Portal Split

### 3.1 Citizen-facing portal

**Members and claimants**

- Sign up and account activation
- Member enrolment
- Beneficiary nomination and updates
- AVC — new, vary, cancel
- Benefits claim submission
- Death benefits claim submission
- Contribution statement view and download
- Missing contribution reporting
- Discrepancy reporting
- Request status tracking

**Employers**

- Member enrolment confirmation
- AVC check-off confirmation
- Benefits claim exit confirmation
- Employment discrepancy verification
- Missing contribution verification

### 3.2 Management portal — back-office

**PSSF staff and case officers**

- Unified review queues by form type and status
- Document verification and review
- Approve, reject, request more information, reassign
- Internal case notes
- Status management
- Employer approval monitoring

**Administrators and management**

- Audit trail — who did what and when
- Reports and analytics
- User and access management
- Notification configuration
- System-wide case oversight

---

## 4. Core Journey Pattern

All statutory journeys follow the same digital logic. Members learn it once and it applies everywhere.

```
Validate → Prefill → Lock verified fields → Allow safe edits →
Complete missing fields → Upload documents → Preview →
OTP + Declaration → Submit → Route → Track
```

**Locked fields** are populated from verified records and cannot be edited directly. If locked information is wrong, the member opens a discrepancy report — a separate, routed correction workflow.

**Editable fields** are contact and communication fields: mobile number, email, postal address, code, town.

---

## 5. The Five Statutory Journeys and Their Routing

Sign Up and Contribution Statement are handled outside the Case engine (see section 2). The Case engine handles five statutory journeys plus two exception workflows.

| Code | Journey | Routing path |
|---|---|---|
| J2 | Member enrolment | Member → Employer → PSSF review → Done |
| J3 | Beneficiary nomination | Member → PSSF review → Done |
| J4a | AVC — payroll check-off | Member → Employer HR → PSSF record update → Done |
| J4b | AVC — mobile wallet | Member → Payment confirmation → PSSF record update → Done |
| J5 | Benefits claim | Member → Employer → PSSF review → PSSF verification → Payment → Done |
| J6 | Death benefits claim | Claimant → PSSF review → PSSF verification → Trustee decision → Payment → Done |
| E1 | Missing contribution | Member → PSSF support → Employer verification → Resolved |
| E2 | Discrepancy | Member → PSSF verification or Employer verification → Resolved |

Workflows are fixed per journey type. They are not user-configurable. A simple state machine per journey type is sufficient — no workflow engine is needed.

---

## 6. Core Domain Entities

These are the frozen entities. Every screen, API, workflow, and database table derives from this list.

### 6.1 Entity list

| Entity | Purpose |
|---|---|
| `users` | Any authenticated actor in the system |
| `roles` | Named set of permissions assigned to a user |
| `permissions` | A single allowed action on a resource |
| `members` | A PSSF scheme member, linked to a user |
| `employers` | An organisation with one or more employer officers |
| `cases` | A single request for one statutory service |
| `case_status_history` | Immutable log of every status transition on a Case |
| `tasks` | Actionable work items assigned to actors at workflow stages |
| `documents` | Files attached to a Case with their own status lifecycle |
| `approvals` | Immutable decision events recorded against a Case |
| `notifications` | Messages dispatched to actors via channels |
| `audit_events` | Immutable record of every action taken on a Case |

### 6.2 Fixed case types

```
MEMBER_ENROLMENT
BENEFICIARY_NOMINATION
AVC
BENEFITS_CLAIM
DEATH_BENEFITS_CLAIM
MISSING_CONTRIBUTION
DISCREPANCY
```

### 6.3 Fixed case statuses

```
DRAFT
SUBMITTED
PENDING_EMPLOYER
EMPLOYER_APPROVED
EMPLOYER_REJECTED
UNDER_REVIEW
MORE_INFO_REQUIRED
UNDER_VERIFICATION
AWAITING_TRUSTEE
APPROVED
PAYMENT_PROCESSING
COMPLETED
REJECTED
CLOSED
```

---

## 7. The Case Entity

A Case is the central entity of the platform. It is created the moment a member begins a statutory journey and lives until the request is fully resolved.

### 7.1 What a Case carries

- The journey type — determines workflow, document checklist, and routing
- The current status — drives what actions are available and to whom
- The member or claimant identity — validated at creation
- All form-specific field data for that journey
- All document slots with their individual status lifecycles
- All approval events — immutable
- All tasks assigned to actors at each workflow stage
- The full audit trail — immutable
- All notifications dispatched

### 7.2 Case relationships

```
Case
 ├── CaseType                (1 — determines workflow)
 ├── CaseStatus              (current state)
 ├── Member / Claimant       (validated owner)
 ├── Documents[]             (1..N document slots)
 ├── Approvals[]             (0..N immutable approval events)
 ├── Tasks[]                 (0..N work items)
 ├── Notifications[]         (0..N dispatched messages)
 ├── CaseStatusHistory[]     (immutable transition log)
 └── AuditEvents[]           (immutable action log)
```

---

## 8. State Machine

### 8.1 Valid transitions

| From | To | Triggered by |
|---|---|---|
| — | `DRAFT` | Member starts journey |
| `DRAFT` | `SUBMITTED` | Member submits |
| `SUBMITTED` | `PENDING_EMPLOYER` | System routes (J2, J4a, J5) |
| `SUBMITTED` | `UNDER_REVIEW` | System routes (J3, J4b, J6, E1, E2) |
| `PENDING_EMPLOYER` | `EMPLOYER_APPROVED` | Employer approves |
| `PENDING_EMPLOYER` | `EMPLOYER_REJECTED` | Employer rejects |
| `EMPLOYER_APPROVED` | `UNDER_REVIEW` | System routes to PSSF |
| `UNDER_REVIEW` | `MORE_INFO_REQUIRED` | PSSF staff requests information |
| `MORE_INFO_REQUIRED` | `UNDER_REVIEW` | Member submits additional information |
| `UNDER_REVIEW` | `UNDER_VERIFICATION` | PSSF routes to verification (J5, J6) |
| `UNDER_VERIFICATION` | `AWAITING_TRUSTEE` | Verification complete, trustee required (J6 only) |
| `UNDER_REVIEW` | `APPROVED` | PSSF staff approves |
| `UNDER_VERIFICATION` | `APPROVED` | PSSF verification approves |
| `AWAITING_TRUSTEE` | `APPROVED` | Trustee decision issued |
| `APPROVED` | `PAYMENT_PROCESSING` | System initiates payment (J5, J6) |
| `APPROVED` | `COMPLETED` | Non-payment journeys complete |
| `PAYMENT_PROCESSING` | `COMPLETED` | Payment confirmed |
| `UNDER_REVIEW` | `REJECTED` | PSSF staff rejects |
| `UNDER_VERIFICATION` | `REJECTED` | PSSF verification rejects |
| `AWAITING_TRUSTEE` | `REJECTED` | Trustee denies |
| `EMPLOYER_REJECTED` | `CLOSED` | PSSF supervisor closes |
| `REJECTED` | `CLOSED` | PSSF supervisor closes |
| `COMPLETED` | `CLOSED` | System or staff closes |

### 8.2 Rules

- A Case moves forward only through its defined workflow states
- `EMPLOYER_REJECTED` does not auto-re-route — a new Case must be created or a PSSF supervisor intervenes
- `AWAITING_TRUSTEE` is only reachable for `DEATH_BENEFITS_CLAIM` cases
- `PAYMENT_PROCESSING` is only reachable for `BENEFITS_CLAIM` and `DEATH_BENEFITS_CLAIM` cases
- Every status transition is recorded immutably in `case_status_history`

---

## 9. Actions and Actor Permissions

### 9.1 Action list

```
CREATE_CASE
SUBMIT_CASE
EMPLOYER_APPROVE
EMPLOYER_REJECT
EMPLOYER_REQUEST_CORRECTION
PSSF_APPROVE
PSSF_REJECT
PSSF_REQUEST_MORE_INFO
PSSF_MARK_VERIFIED
PSSF_REASSIGN
PSSF_ADD_NOTE
UPLOAD_DOCUMENT
REPLACE_DOCUMENT
FLAG_DOCUMENT_VERIFIED
FLAG_DOCUMENT_REJECTED
SUBMIT_ADDITIONAL_INFO
MARK_PAYMENT_PROCESSING
MARK_PAID
CLOSE_CASE
EXPORT_RECORD
SEND_NOTIFICATION
```

### 9.2 Actor permissions matrix

| Action | Member / Claimant | Employer | PSSF Officer | PSSF Supervisor | System |
|---|---|---|---|---|---|
| `CREATE_CASE` | ✓ | | | | |
| `SUBMIT_CASE` | ✓ | | | | |
| `EMPLOYER_APPROVE` | | ✓ | | | |
| `EMPLOYER_REJECT` | | ✓ | | | |
| `EMPLOYER_REQUEST_CORRECTION` | | ✓ | | | |
| `PSSF_APPROVE` | | | ✓ | ✓ | |
| `PSSF_REJECT` | | | ✓ | ✓ | |
| `PSSF_REQUEST_MORE_INFO` | | | ✓ | ✓ | |
| `PSSF_MARK_VERIFIED` | | | ✓ | ✓ | |
| `PSSF_REASSIGN` | | | | ✓ | |
| `PSSF_ADD_NOTE` | | | ✓ | ✓ | |
| `UPLOAD_DOCUMENT` | ✓ | ✓ | ✓ | ✓ | |
| `REPLACE_DOCUMENT` | ✓ | | ✓ | ✓ | |
| `FLAG_DOCUMENT_VERIFIED` | | | ✓ | ✓ | |
| `FLAG_DOCUMENT_REJECTED` | | | ✓ | ✓ | |
| `SUBMIT_ADDITIONAL_INFO` | ✓ | | | | |
| `MARK_PAYMENT_PROCESSING` | | | ✓ | ✓ | |
| `MARK_PAID` | | | ✓ | ✓ | ✓ |
| `CLOSE_CASE` | | | | ✓ | |
| `EXPORT_RECORD` | | | ✓ | ✓ | |
| `SEND_NOTIFICATION` | | | | | ✓ |

---

## 10. Identity and Authorization Model

### 10.1 User types

Every authenticated person in the system is a `User`. Users are typed by their role assignment.

```
User
 ├── MEMBER              (citizen — has a pension scheme membership)
 ├── CLAIMANT            (citizen — filing a death benefits claim)
 ├── EMPLOYER            (employer staff — confirms employment records)
 ├── PSSF_OFFICER        (PSSF staff — reviews and processes cases)
 ├── PSSF_SUPERVISOR     (PSSF staff — can reassign, close, and escalate)
 └── ADMIN               (system admin — manages users, roles, notifications)
```

### 10.2 Role and permission model

```
User
 └── assigned Role
      └── Role contains Permission(s)
           └── Permission = allowed Action on a resource
```

Roles are named containers of permissions. Permissions map directly to the action list in section 9. Access control is data-driven — changing what a role can do is a configuration change, not a code change.

### 10.3 Role definitions

**MEMBER**
Can create, submit, upload documents, submit additional info, and view their own cases only.

**CLAIMANT**
Same as MEMBER but scoped to death benefits claims. Can add multiple claimants to a single case.

**EMPLOYER**
Can view cases routed to their employer. Can approve, reject, or request correction. Can upload supporting documents. Cannot view cases belonging to other employers.

**PSSF_OFFICER**
Can view all cases in their assigned queue. Can approve, reject, request more info, verify documents, add notes, upload, and export. Cannot reassign or close cases.

**PSSF_SUPERVISOR**
All PSSF_OFFICER permissions plus reassign cases between officers, close cases, and view all queues regardless of assignment.

**ADMIN**
Can manage users, roles, and employer accounts. Can configure notification rules. Can view reports and audit trails. Cannot process cases directly.

### 10.4 Scoping rules

- Members see only their own cases
- Claimants see only cases they filed
- Employer officers see only cases belonging to their employer
- PSSF Officers see cases in their assigned queue plus unassigned cases
- PSSF Supervisors see all cases
- Administrators see system-level data, not case-level content

### 10.5 Authentication methods

| Actor | Method |
|---|---|
| Member | OTP to registered mobile (primary) or password |
| Claimant | OTP to registered mobile |
| Employer | Password with OTP second factor |
| PSSF Officer | Password with OTP second factor |
| PSSF Supervisor | Password with OTP second factor |
| Admin | Password with OTP second factor |

Phone number updates always require OTP confirmation before the change is saved.

---

## 11. Document Model

### 11.1 Document slot structure

Each Case has a document checklist determined by its journey type. Each slot carries:

| Field | Description |
|---|---|
| `document_type` | The required document (e.g. National ID, Death Certificate) |
| `required` | Required, optional, or conditional |
| `condition` | For conditional documents — the field value that triggers the requirement |
| `file_reference` | Storage reference to the uploaded file |
| `upload_status` | Current status of this document |
| `rejection_reason` | Populated when status is REJECTED |
| `uploaded_by` | User ID and actor type |
| `uploaded_at` | Timestamp |
| `reviewed_by` | PSSF officer who verified or rejected |
| `reviewed_at` | Timestamp |

### 11.2 Document status lifecycle

```
PENDING → UPLOADED → UNDER_REVIEW → VERIFIED
                                   → REJECTED (+ reason)
```

A rejected document can be re-uploaded by the member. Re-upload resets status to `UPLOADED` and generates an audit event.

### 11.3 Document checklist by journey

| Journey | Required documents |
|---|---|
| J2 Member enrolment | National ID or Passport copy |
| J3 Beneficiary nomination | Member ID; Birth certificates for minors; Guardian ID where required |
| J5 Benefits claim | Exit confirmation letter; Certified ID; ATM card front page; KRA PIN certificate; Proof of residency (emigration only); Option election form (age 45+ rule) |
| J6 Death benefits claim | Death certificate; Marriage certificate or affidavit; Children birth certificates; Claimant ID copies; ATM card front page per beneficiary |

### 11.4 Storage

All documents are stored in PostgreSQL for Phase 1. No external storage provider is required. When storage volume demands it, an object store can be wired in behind the service layer without changing the document model or the API contract.

---

## 12. Approval Event Model

### 12.1 Approval event structure

| Field | Description |
|---|---|
| `approval_type` | EMPLOYER, PSSF, or TRUSTEE |
| `actor_name` | Full name of the approving actor |
| `actor_role` | Their role at time of action |
| `actor_org` | Organisation (employer name or PSSF) |
| `decision` | APPROVED, REJECTED, REQUEST_CORRECTION, REQUEST_MORE_INFO |
| `reason` | Required for rejections and correction requests |
| `comments` | Optional additional notes |
| `timestamp` | UTC timestamp — immutable |
| `digital_ref` | Digital stamp or confirmation reference where applicable |

### 12.2 Immutability rule

Approval events are never edited. If a decision is reversed, a new approval event is created recording the new decision and the actor who made it. The original event remains in the record.

### 12.3 Approval chaining

Cases requiring multiple approvals accumulate events in sequence. For J5 Benefits Claims:

```
Employer approval event → PSSF review approval event → PSSF verification approval event
```

Each event is independent. A PSSF rejection after employer approval does not erase the employer approval event.

---

## 13. Task Model

Tasks are the actionable work items that appear in queue dashboards.

### 13.1 Task structure

| Field | Description |
|---|---|
| `task_type` | e.g. REVIEW_ENROLMENT, CONFIRM_EXIT, VERIFY_DOCUMENTS |
| `case_id` | The Case this task belongs to |
| `assigned_to` | User ID of the responsible actor |
| `assigned_role` | Role type the task targets |
| `status` | PENDING, IN_PROGRESS, COMPLETED, REASSIGNED |
| `due_at` | Optional SLA deadline |
| `created_at` | When the task was generated |
| `completed_at` | When the task was resolved |

### 13.2 Task generation rules

Tasks are generated automatically when a Case transitions into a state requiring actor input.

| Case status | Task generated for |
|---|---|
| `PENDING_EMPLOYER` | Employer officer assigned to that employer |
| `UNDER_REVIEW` | PSSF Officer (next in queue or assigned) |
| `MORE_INFO_REQUIRED` | Member or Claimant |
| `UNDER_VERIFICATION` | PSSF Verification Officer |
| `AWAITING_TRUSTEE` | PSSF Supervisor |

---

## 14. Notification Model

### 14.1 Notification rule structure

| Field | Description |
|---|---|
| `trigger_event` | The Case or system event that fires this rule |
| `recipient_type` | MEMBER, CLAIMANT, EMPLOYER, PSSF_STAFF |
| `channel` | WHATSAPP, EMAIL, PORTAL |
| `template_ref` | Message template for this channel and recipient type |
| `active` | Whether the rule is currently enabled |

### 14.2 Notification triggers

| Trigger event | Notifies |
|---|---|
| Case submitted | Member, PSSF staff |
| Pending employer | Employer officer |
| Employer approved | Member, PSSF staff |
| Employer rejected | Member |
| Under PSSF review | Member |
| More information required | Member |
| Additional info submitted | PSSF officer |
| Approved | Member |
| Rejected | Member |
| Payment processing | Member |
| Completed | Member |
| Employer task overdue | Employer officer |
| Document rejected | Member |
| Case reassigned | PSSF officer (new assignee) |

### 14.3 Channels and providers

| Channel | Provider | Used for |
|---|---|---|
| WhatsApp | Chatnation CRM | OTP delivery; status notifications; statement summaries |
| Email | Resend | Full-detail notifications to members and employer officers |
| Portal | Internal | In-app notification bell for all actor types |

WhatsApp delivery is handled entirely by the Chatnation CRM. The PSSF platform triggers the event and passes the payload — the CRM handles template resolution and delivery. No direct WhatsApp API integration is required on this project.

### 14.4 WhatsApp scope boundary

WhatsApp is a notification and OTP channel only, delivered through the Chatnation CRM. The PSSF platform has no direct WhatsApp integration. The following are explicitly out of scope for this platform:

- Full journey completion over WhatsApp
- Form field collection over WhatsApp
- Document upload over WhatsApp
- Conversational chatbot journeys

---

## 15. Audit and Compliance Model

### 15.1 Audit event structure

| Field | Description |
|---|---|
| `case_id` | The Case affected |
| `action` | The action performed |
| `actor_id` | User who performed the action |
| `actor_role` | Their role at time of action |
| `from_status` | Case status before the action |
| `to_status` | Case status after the action |
| `metadata` | Action-specific context (rejection reason, document type, etc.) |
| `timestamp` | UTC timestamp — immutable |
| `ip_address` | For security audit purposes |

### 15.2 What is always recorded

- Every status transition with before and after values
- Every document upload, replacement, verification, and rejection
- Every approval decision
- Every note added
- Every reassignment
- Every notification dispatched
- Read access on sensitive case types (death benefits)

### 15.3 Audit access

- Members see their own case timeline (simplified view)
- PSSF Officers see full audit trails for cases in their queue
- PSSF Supervisors see audit trails for all cases
- Administrators can export audit trails for compliance reporting

---

## 16. Approved Technology Stack

### 16.1 Frontend and backend

| Layer | Technology |
|---|---|
| Framework | Next.js (latest stable) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Component library | shadcn/ui |
| Data fetching | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| Backend | Next.js Route Handlers and Server Actions |

A separate NestJS service is not required at this stage. The system is workflow-heavy, not compute-heavy. Next.js handles both frontend and backend in a single deployable application. This decision is revisited if compute or queue requirements grow significantly.

### 16.2 Data and storage

| Layer | Technology |
|---|---|
| Database | PostgreSQL |
| ORM | Prisma |


All uploaded documents are stored in PostgreSQL for Phase 1. This removes the external storage dependency entirely and eliminates any blocker on file handling. When storage volume requires it, an object store can be introduced behind the service layer without touching the rest of the platform.

### 16.3 Authentication

| Layer | Technology |
|---|---|
| Auth framework | Auth.js |

### 16.4 Communication services

| Service | Provider |
|---|---|
| WhatsApp (notifications + OTP) | Chatnation CRM |
| Email | Resend |
| Portal | Internal |

---

## 17. Application Structure

```
app/
│
├── (public)/
│   ├── sign-up/
│   ├── login/
│   └── verify-otp/
│
├── member/
│   ├── dashboard/
│   ├── enrolment/
│   ├── beneficiaries/
│   ├── avc/
│   ├── claims/
│   ├── statements/
│   ├── discrepancies/
│   └── requests/
│
├── employer/
│   ├── dashboard/
│   ├── approvals/
│   ├── discrepancies/
│   └── contributions/
│
├── staff/
│   ├── dashboard/
│   ├── queues/
│   ├── cases/
│   ├── documents/
│   └── reports/
│
├── admin/
│   ├── users/
│   ├── employers/
│   ├── notifications/
│   └── audit/
│
└── api/
    ├── auth/
    ├── member/
    ├── cases/
    ├── approvals/
    ├── documents/
    ├── tasks/
    └── notifications/
```

---

## 18. API Contract — Core Endpoints

### Auth

```
POST   /api/auth/request-otp
POST   /api/auth/verify-otp
POST   /api/auth/login
POST   /api/auth/logout
```

### Member

```
GET    /api/member/profile
PATCH  /api/member/profile
POST   /api/member/validate
GET    /api/member/contributions
```

### Cases

```
POST   /api/cases
GET    /api/cases
GET    /api/cases/:id
POST   /api/cases/:id/submit
POST   /api/cases/:id/upload
POST   /api/cases/:id/additional-info
```

### Approvals

```
POST   /api/approvals/employer
POST   /api/approvals/pssf
POST   /api/approvals/trustee
```

### Documents

```
POST   /api/documents/upload
GET    /api/documents/:id
POST   /api/documents/:id/verify
POST   /api/documents/:id/reject
```

### Tasks

```
GET    /api/tasks
POST   /api/tasks/:id/assign
POST   /api/tasks/:id/complete
```

### Notifications

```
POST   /api/notifications/send
POST   /api/notifications/sms
POST   /api/notifications/email
POST   /api/notifications/whatsapp
```

---

## 19. Database Tables — Phase 1

```
users
roles
permissions

members
employers

cases
case_status_history

tasks

documents

approvals

notifications

audit_events
```

---

## 20. Build Order

Do not start with enrolment forms. Build infrastructure first. Later journeys become configuration on top of proven infrastructure rather than separately invented systems.

### Phase 1 — Foundation
```
Authentication
Roles
Permissions
```

### Phase 2 — Core engine
```
Case engine
Status engine
Audit engine
```

### Phase 3 — Documents
```
Document upload
Document storage in PostgreSQL
Document status lifecycle
```

### Phase 4 — Notifications
```
Chatnation CRM — WhatsApp notifications and OTP
Resend — Email
Portal notification bell
Notification rules engine
```

### Phase 5 — First journey
```
Member Enrolment (J2)
```

### Phase 6
```
Beneficiary Nomination (J3)
```

### Phase 7
```
AVC (J4a and J4b)
```

### Phase 8
```
Benefits Claims (J5)
Death Benefits Claims (J6)
```

### Phase 9
```
Statement Service
Missing Contribution (E1)
Discrepancy (E2)
```

### Phase 10
```
Employer portal
Staff dashboard and queues
Admin panel
Reports and audit exports
```

---

*Architecture Status: APPROVED*  
*Ready for Technical Design*  
*Ready for Database Design*  
*Ready for API Design*  
*Ready for UI Design*
