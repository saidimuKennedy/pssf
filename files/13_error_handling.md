# PSSF — Error Handling and Edge Cases

**Version:** 1.0  
**Status:** Approved for implementation

---

## Validation Failures

### Identity validation — no match

**Trigger:** `POST /api/member/validate` returns `matched: false`  
**User message:** "We could not find a record matching your details. Please check your National ID number and date of birth and try again. If the problem continues, please contact PSSF support."  
**Action:** Stay on validation screen. Do not proceed to prefill.

### Identity validation — date of birth mismatch

**Trigger:** National ID found but DOB does not match  
**User message:** "The date of birth you entered does not match our records. Please check and try again."  
**Action:** Stay on validation screen. Do not reveal whether the ID exists.

### Beneficiary allocation not 100%

**Trigger:** Member tries to proceed past beneficiary step with total allocation ≠ 100%  
**User message:** "Your beneficiary allocations must total exactly 100%. Current total: [X]%."  
**Action:** Block progression. Show running total. Highlight the allocation field that needs adjustment.

### Document required but not uploaded

**Trigger:** Member tries to submit with a required document in PENDING status  
**User message:** "Please upload your [document type] before submitting."  
**Action:** Block submission. Highlight the missing document slot.

### File type not accepted

**Trigger:** Member uploads a file with an unsupported MIME type  
**User message:** "This file type is not accepted. Please upload a PDF, JPEG, or PNG file."  
**Action:** Reject upload. Keep slot in PENDING.

### File too large

**Trigger:** Member uploads a file over 5MB  
**User message:** "This file is too large. Maximum file size is 5MB."  
**Action:** Reject upload. Keep slot in PENDING.

### OTP expired

**Trigger:** Member submits an OTP after the 5-minute window  
**User message:** "This code has expired. Please request a new code."  
**Action:** Show resend button. Invalidate the expired OTP.

### OTP invalid

**Trigger:** Member enters incorrect OTP code  
**User message:** "The code you entered is incorrect. Please try again."  
**Action:** Decrement attempt counter. After 3 failed attempts, invalidate the OTP and require a new one.

### OTP rate limit

**Trigger:** More than 5 OTP requests for the same phone in 1 hour  
**User message:** "Too many code requests. Please wait before requesting a new code."  
**Action:** Block new OTP requests for the remainder of the rate limit window.

---

## Session and Access Failures

### Session expired mid-journey

**Trigger:** Member's session expires while completing a multi-step journey form  
**Behaviour:** Next API call returns 401. Client detects 401 and redirects to login page. After re-authentication, member is returned to the last saved step of their draft case — form data is preserved in the database, not in client state.  
**User message:** "Your session has expired. Please log in again to continue."

### Unauthorised access attempt

**Trigger:** User attempts to access a route outside their role  
**Behaviour:** Middleware intercepts and redirects to the appropriate portal home. No error page shown.

### Employer accesses another employer's case

**Trigger:** Employer officer manually navigates to a case ID not belonging to their employer  
**Behaviour:** Service layer returns 404 (not 403 — do not confirm the case exists)  
**User message:** Standard 404 page.

---

## Workflow Edge Cases

### Member submits a case while a previous case of the same type is in progress

**Behaviour:** System allows it. Members may have multiple active cases of the same type. Each gets a unique reference. PSSF officers can see all.

### Employer does not respond to a pending approval

**Trigger:** Task has no action after a configurable number of days (default: 5 business days)  
**Behaviour:** System generates an overdue reminder notification to the employer via email. After a second threshold (default: 10 business days), a PSSF supervisor is alerted. The case does not auto-close — a human decision is required.

### Employer rejects an enrolment

**Trigger:** `EMPLOYER_REJECTED` status  
**Behaviour:** Member is notified with the rejection reason. The case moves to CLOSED after supervisor review. Member must contact PSSF to resolve the underlying employment discrepancy before resubmitting. No automatic re-routing.

### Member responds to more-info request but PSSF officer has changed

**Trigger:** Case was reassigned after a more-info request was issued  
**Behaviour:** `SUBMIT_ADDITIONAL_INFO` transition moves case back to `UNDER_REVIEW`. New assignee sees the additional information in the case detail. The audit trail records both officers.

### Document rejected multiple times

**Trigger:** Member re-uploads a document that PSSF rejects again  
**Behaviour:** No limit on re-uploads. Each rejection and re-upload is recorded in the audit trail. If a pattern of repeated rejections occurs, a PSSF supervisor can add an internal note and contact the member directly.

### Death benefits — fewer than all claimants sign the declaration

**Trigger:** Not all listed claimants have confirmed  
**Behaviour:** Case cannot be submitted until all claimants have confirmed their declaration. System shows which claimants have confirmed and which have not.

### Contribution statement shows a gap month

**Trigger:** A month has no contribution record  
**Behaviour:** Month appears in the breakdown table with status `MISSING`. No automatic alert is generated. Member can manually report it via the missing contribution flow.

### AVC cancellation submitted but employer has already deducted the current month

**Trigger:** AVC cancel case submitted after payroll cut-off  
**Behaviour:** The cancellation case is processed normally. The effective date field determines when the cancellation takes effect. PSSF and the employer officer resolve the cut-off timing issue via the case comments. No system automation for this edge case in Phase 1.

---

## Notification Failures

### Chatnation CRM unreachable

**Trigger:** WhatsApp dispatch call to CRM fails  
**Behaviour:** Notification record is written with status FAILED. The case status transition is not rolled back — the CRM failure does not block the workflow. A retry mechanism attempts the dispatch up to 3 times with exponential backoff. After 3 failures, the notification status is set to FAILED and a portal notification is dispatched instead.

### Resend email delivery failure

**Trigger:** Resend API returns an error  
**Behaviour:** Same as above — retry 3 times, then mark FAILED, fall back to portal notification.

### Member has no registered phone

**Trigger:** WhatsApp notification triggered for a member with no mobile number  
**Behaviour:** Skip WhatsApp dispatch. Fall back to email if email is registered. Fall back to portal notification in all cases.

---

## Data Edge Cases

### Beneficiary with no National ID (adult)

**Trigger:** Adult beneficiary added without ID prefill  
**Behaviour:** Manual entry is always allowed. ID is optional for adult beneficiaries. The `national_id` field on the beneficiary record is nullable.

### Member number not yet assigned

**Trigger:** Member validates successfully but `member_number` is null in the seed data  
**Behaviour:** Member number field is left blank in the prefilled display. Enrolment proceeds without it. PSSF assigns the member number during their review step.

### KRA PIN not verified

**Trigger:** KRA PIN is present in form data but not marked as verified  
**Behaviour:** Field is shown as editable, not locked. Member can update it. PSSF verifies during review.

### Transfer scheme bank details incomplete

**Trigger:** Member selects transfer option but does not complete all transfer scheme fields  
**Behaviour:** Transfer scheme fields are validated as a group. If transfer is selected, all fields (scheme name, administrator, account name, account number, bank, branch) are required before the form can proceed to preview.

---

## System Errors

### Unexpected server error

**Trigger:** Unhandled exception in a route handler or server action  
**Response:** `{ "error": "An unexpected error occurred. Please try again.", "code": "INTERNAL_ERROR" }`  
**Behaviour:** Error is logged with full stack trace. User sees a generic message. Draft case data is preserved.

### Database connection failure

**Trigger:** Prisma cannot connect to PostgreSQL  
**Behaviour:** API returns 503. Portal shows a maintenance message. No data is lost — the form data in the user's session is preserved until they retry.

### Prisma transaction failure

**Trigger:** A state machine transition fails mid-transaction  
**Behaviour:** Full rollback. Case status does not change. No partial audit events or tasks are written. User receives an error and is invited to retry.
