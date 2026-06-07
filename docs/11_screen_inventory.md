# PSSF — Screen Inventory

**Version:** 1.0  
**Status:** Approved for implementation

---

## Public Surface

| Screen | Route | Purpose | Key actions |
|---|---|---|---|
| Landing page | `/` | Entry point, service overview, how it works, request tracker preview | Access Portal, Track Request, service card navigation |
| Login | `/login` | Authentication entry | Phone OTP login, email/password login |
| Verify OTP | `/verify-otp` | OTP code entry | Submit code, resend code |
| Sign Up | `/sign-up` | New member account activation | Validate ID + DOB, confirm contact details, set access method |
| Track Request (public) | `/track` | Unauthenticated status check by reference number | Enter reference, view status |

---

## Member Surface

All routes under `/member/*`. Requires MEMBER or CLAIMANT role.

### Dashboard and account

| Screen | Route | Purpose | Key actions |
|---|---|---|---|
| Member dashboard | `/member/dashboard` | Overview of active cases, quick service access, recent notifications | Start new service, view all requests |
| My profile | `/member/profile` | View and update contact details | Edit phone, email, address, communication preference |
| My notifications | `/member/notifications` | All portal notifications | Mark as read, view linked case |
| Track all requests | `/member/requests` | Full list of member's cases with status | Filter by type and status, open case detail |
| Case detail | `/member/requests/[id]` | Full case view — status, documents, timeline, approvals | Upload document, submit additional info, view history |

### Member enrolment (J2)

| Screen | Route | Purpose |
|---|---|---|
| Start enrolment | `/member/enrolment` | Journey entry, validate identity |
| Prefill review | `/member/enrolment/details` | Review locked and editable fields |
| Document upload | `/member/enrolment/documents` | Upload National ID |
| Declaration | `/member/enrolment/declaration` | Review and accept statutory declaration |
| Preview | `/member/enrolment/preview` | Full submission preview |
| Confirm | `/member/enrolment/confirm` | OTP confirmation |
| Submitted | `/member/enrolment/submitted` | Success screen with reference number |

### Beneficiary nomination (J3)

| Screen | Route | Purpose |
|---|---|---|
| Start nomination | `/member/beneficiaries` | Journey entry |
| Member details | `/member/beneficiaries/details` | Review prefilled member particulars |
| Add beneficiaries | `/member/beneficiaries/add` | Add each beneficiary, manage allocation |
| Guardian details | `/member/beneficiaries/guardian` | Shown only if minor beneficiaries exist |
| Document upload | `/member/beneficiaries/documents` | Upload required documents |
| Witness details | `/member/beneficiaries/witness` | Capture witness information |
| Declaration | `/member/beneficiaries/declaration` | Review and accept |
| Preview | `/member/beneficiaries/preview` | Full submission preview |
| Confirm | `/member/beneficiaries/confirm` | OTP confirmation |
| Submitted | `/member/beneficiaries/submitted` | Success screen |

### AVC (J4)

| Screen | Route | Purpose |
|---|---|---|
| Start AVC | `/member/avc` | Select AVC action — new, vary, cancel |
| Member details | `/member/avc/details` | Review prefilled details |
| AVC details | `/member/avc/action` | Enter amount, effective date, method |
| Declaration | `/member/avc/declaration` | Review and accept |
| Preview | `/member/avc/preview` | Full submission preview |
| Confirm | `/member/avc/confirm` | OTP confirmation |
| Submitted | `/member/avc/submitted` | Success screen |

### Benefits claim (J5)

| Screen | Route | Purpose |
|---|---|---|
| Start claim | `/member/claims/benefits` | Journey entry |
| Member details | `/member/claims/benefits/details` | Review prefilled particulars |
| Payment details | `/member/claims/benefits/payment` | Enter bank account or M-Pesa number |
| Leaving details | `/member/claims/benefits/leaving` | Date and reason for leaving |
| Benefit option | `/member/claims/benefits/option` | Select lumpsum or annuity option |
| Transfer scheme | `/member/claims/benefits/transfer` | Shown only if transfer to scheme is selected |
| Contribution summary | `/member/claims/benefits/summary` | View indicative statement before submission |
| Document upload | `/member/claims/benefits/documents` | Upload all required documents |
| Declaration | `/member/claims/benefits/declaration` | Review statutory declaration |
| Preview | `/member/claims/benefits/preview` | Full submission preview |
| Confirm | `/member/claims/benefits/confirm` | OTP confirmation |
| Submitted | `/member/claims/benefits/submitted` | Success screen |

### Death benefits claim (J6)

| Screen | Route | Purpose |
|---|---|---|
| Start claim | `/member/claims/death` | Journey entry, validate deceased member |
| Deceased member details | `/member/claims/death/details` | Review prefilled details, enter date of death |
| Add claimants | `/member/claims/death/claimants` | Add up to 5 claimants |
| Home particulars | `/member/claims/death/home` | Capture county, subcounty, village details |
| Benefit option | `/member/claims/death/option` | Select distribution option |
| Payment details | `/member/claims/death/payment` | Bank or M-Pesa per claimant |
| Document upload | `/member/claims/death/documents` | Upload all required documents |
| Witness details | `/member/claims/death/witness` | Capture witness |
| Declaration | `/member/claims/death/declaration` | All claimants confirm |
| Preview | `/member/claims/death/preview` | Full submission preview |
| Confirm | `/member/claims/death/confirm` | OTP confirmation |
| Submitted | `/member/claims/death/submitted` | Success screen |

### Contribution statement (J7)

| Screen | Route | Purpose |
|---|---|---|
| Statement overview | `/member/statements` | Select period, view summary |
| Statement detail | `/member/statements/detail` | Full breakdown — employee, employer, interest |
| Report missing contribution | `/member/statements/missing` | File a missing contribution report |

### Exception flows

| Screen | Route | Purpose |
|---|---|---|
| Report discrepancy | `/member/discrepancy` | Report incorrect locked field |
| Discrepancy detail | `/member/discrepancy/[id]` | Track discrepancy case |

---

## Employer Surface

All routes under `/employer/*`. Requires EMPLOYER role.

| Screen | Route | Purpose | Key actions |
|---|---|---|---|
| Employer dashboard | `/employer/dashboard` | Pending approvals count, recent activity | View pending queue |
| Pending approvals | `/employer/approvals` | All cases awaiting employer confirmation | Filter, open case |
| Approval detail | `/employer/approvals/[id]` | Full case view for employer action | Approve, reject, request correction |
| Completed | `/employer/completed` | History of processed approvals | View detail |
| Discrepancy verifications | `/employer/discrepancies` | Employment discrepancies routed to employer | Verify or dispute |
| Missing contribution verifications | `/employer/contributions` | Missing contribution queries routed to employer | Confirm or dispute |

---

## Staff Surface

All routes under `/staff/*`. Requires PSSF_OFFICER or PSSF_SUPERVISOR role.

| Screen | Route | Purpose | Key actions |
|---|---|---|---|
| Staff dashboard | `/staff/dashboard` | Queue counts by type and status, overdue alerts | Navigate to queue |
| All cases | `/staff/cases` | Full case list with filters | Filter by type, status, employer, officer, date |
| Case detail | `/staff/cases/[id]` | Full case view | Approve, reject, request info, verify docs, add note, reassign, close, export |
| Enrolment queue | `/staff/queues/enrolments` | All enrolment cases | |
| Beneficiary queue | `/staff/queues/beneficiaries` | All beneficiary nomination cases | |
| AVC queue | `/staff/queues/avc` | All AVC cases | |
| Claims queue | `/staff/queues/claims` | All benefits claim cases | |
| Death claims queue | `/staff/queues/death-claims` | All death benefits cases | |
| Missing contributions queue | `/staff/queues/missing` | All missing contribution reports | |
| Discrepancies queue | `/staff/queues/discrepancies` | All discrepancy reports | |
| Reports | `/staff/reports` | Volume and processing time reports | Export |

---

## Admin Surface

All routes under `/admin/*`. Requires ADMIN role.

| Screen | Route | Purpose | Key actions |
|---|---|---|---|
| Admin dashboard | `/admin/dashboard` | System health, user counts, recent activity | |
| Users | `/admin/users` | Full user list | Create, edit role, activate, deactivate |
| User detail | `/admin/users/[id]` | Single user view | Update role, reset password, deactivate |
| Employers | `/admin/employers` | Employer list | Create employer, manage officers |
| Employer detail | `/admin/employers/[id]` | Single employer view with officers | Add officer, deactivate |
| Notification rules | `/admin/notifications` | All notification rules | Enable, disable per rule |
| Audit trail | `/admin/audit` | Full system audit log | Filter by case, actor, date — export |
| Reports | `/admin/reports` | Volume, SLA, and processing reports | Export |

---

## Shared Components Across Surfaces

| Component | Used on |
|---|---|
| Case timeline | Member case detail, Staff case detail |
| Document checklist | All journey upload steps, Staff case detail |
| Status badge | All case list views |
| Step indicator | All journey forms |
| Notification bell | All authenticated layouts |
| Confirmation modal (OTP) | All journey confirm steps |
| Empty state | All list views when no data |
| Loading skeleton | All data-fetching screens |
