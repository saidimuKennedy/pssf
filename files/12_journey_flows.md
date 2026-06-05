# PSSF — Journey Flow Documents

**Version:** 1.0  
**Status:** Approved for implementation

---

## J2 — Member Enrolment

**Purpose:** Digitize PSSF.1 Member Enrolment Form.  
**Routing:** Member → Employer confirmation → PSSF review → Completed

### Steps

**Step 1: Validate identity**
- Member enters National ID number and date of birth
- System calls `POST /api/member/validate`
- On match: proceed to Step 2
- On no match: show "We could not find a record matching your details. Please contact PSSF."
- On DOB mismatch: show "Date of birth does not match. Please try again."

**Step 2: Review prefilled details**
- System displays locked fields: employer name, full name, personal number, date of employment, date of birth, ID number, KRA PIN (if verified), member number (if available)
- System displays editable fields: mobile number, email, postal address, code, town
- Member updates contact fields as needed
- Phone change triggers OTP confirmation before saving
- If any locked field is wrong: member clicks "Report a discrepancy" — this opens the discrepancy flow (E2) — the enrolment cannot proceed until the discrepancy is resolved or the member accepts the current data

**Step 3: Complete missing fields**
- If KRA PIN is missing: member enters it
- If mobile number is missing: member enters it and confirms via OTP
- If email is missing: member enters it

**Step 4: Upload National ID**
- Document slot for NATIONAL_ID shown
- Member uploads a clear copy of National ID or Passport
- Accepted formats: PDF, JPEG, PNG — max 5MB
- Upload status shown in real time

**Step 5: Review statutory declaration**
- Text: "I certify that the above information is true and correct in every respect to the best of my knowledge. I agree to be bound by the Public Service Superannuation Scheme Act, related laws, Rules and Regulations."
- Member checks declaration checkbox

**Step 6: Preview**
- Full summary shown: member details, uploaded document, declaration, routing destination (Employer, then PSSF)

**Step 7: Confirm**
- OTP sent to registered mobile via Chatnation CRM
- Member enters OTP
- On success: `POST /api/cases/:id/submit` called

**Step 8: Submission**
- Status moves to SUBMITTED → PENDING_EMPLOYER
- Employer task created
- Employer notified via email and portal
- Member shown success screen with reference number and status tracker link

**Employer step: Confirm employment**
- Employer officer receives task in portal
- Opens case, reviews member details
- Enters: authorised official name, designation, date
- Selects: Approve, Reject, or Request Correction
- On approve: status moves to EMPLOYER_APPROVED → UNDER_REVIEW, PSSF task created
- On reject: status moves to EMPLOYER_REJECTED, member notified

**PSSF step: Review and complete**
- PSSF officer reviews form data and verified document
- Marks document as VERIFIED
- Approves case
- Status moves to COMPLETED
- Member notified via WhatsApp and portal

---

## J3 — Beneficiary Nomination

**Purpose:** Digitize PSSF.2 Beneficiary Nomination Form.  
**Routing:** Member → PSSF review → Records updated

### Steps

**Step 1: Validate identity**
- Member enters National ID and date of birth
- Same validation flow as J2

**Step 2: Review prefilled member particulars**
- Locked: employer name, full name, personal number, ID number
- Editable: mobile, email, address

**Step 3: Add beneficiaries**
- Member adds up to N beneficiaries
- For each: surname, first name, middle name, relationship, ID or birth cert number, date of birth, mobile, allocation %
- Relationship options: Child, Spouse, Parent, Other
- Is beneficiary 18 or above? — Yes or No
  - If Yes (adult): ID-based prefill offered (optional), or manual entry
  - If No (minor): capture birth certificate number, do not require National ID

**Step 4: Guardian details (if any minor beneficiary)**
- Name, relationship, address, code, town, mobile

**Step 5: Minor benefit option (if any minor beneficiary)**
- Option A: Pay to a trust established by the Trustees
- Option B: Pay to named Guardian

**Step 6: Allocation validation**
- System calculates total allocation %
- Must equal exactly 100% before submission is allowed
- Running total shown as member adds or edits beneficiaries

**Step 7: Upload documents**
- National ID (required)
- Birth certificates for minors (conditional)
- Guardian ID (conditional)

**Step 8: Witness details**
- Witnessed by (name), Witness ID number, Witness mobile, Witness signature, Witness date
- Warning shown: witness must not be a Trustee, Officer of the Scheme, or Beneficiary

**Step 9: Declaration**
- Statutory declaration text shown
- Declaration checkbox + OTP

**Step 10: Preview → Confirm → Submit**
- Standard preview → confirm flow
- Routes directly to PSSF (no employer step)
- PSSF reviews, approves or requests info, marks records updated
- Member notified on completion

---

## J4 — Additional Voluntary Contributions

**Purpose:** Digitize PSSF.3 AVC Form.  
**Routing (payroll):** Member → Employer HR → PSSF record update → Completed  
**Routing (mobile wallet):** Member → Payment confirmation → PSSF record update → Completed

### Steps

**Step 1: Validate identity**
- Standard validation

**Step 2: Review prefilled details**
- Locked: member personal number, full name, date joined scheme, employer
- Editable: mobile number, email

**Step 3: Select AVC action**
- New Contribution
- Vary Contribution
- Cancel Contributions

**Step 4: AVC details**
- New: enter amount in KES, commencement date
- Vary: enter current amount, new amount, effective date
- Cancel: enter cancellation effective date

**Step 5: Select contribution method**
- Payroll check-off (primary — routes to employer)
- Mobile wallet (optional — routes to PSSF directly)

**Step 6: Declaration → Preview → Confirm → Submit**
- Standard flow
- Payroll: routes to employer, employer confirms effective payroll month
- Mobile wallet: member confirms via payment prompt, routes to PSSF

---

## J5 — Benefits Claim

**Purpose:** Digitize PSSF.4 Benefits Claim Form.  
**Routing:** Member → Employer confirmation → PSSF claims review → PSSF verification → Payment → Completed

### Steps

**Step 1: Validate identity** — Standard

**Step 2: Review prefilled particulars**
- Locked: employer name, full name, personal number, ID number, KRA PIN, date of birth
- Editable: bank account number, bank, branch, mobile number, email, address

**Step 3: Payment details**
- Bank account number, bank name, branch (required)
- M-Pesa number (optional)
- Member must confirm payment details are correct before proceeding
- Confirmation shown again at preview

**Step 4: Leaving employment details**
- Date of leaving employment
- Reason: Normal retirement, Early retirement, 12/16/20 year rule, Resignation, Termination, Emigration, Other

**Step 5: Select benefit option**
- Only shown for retirement types
- Five statutory options presented (lumpsum + annuity, lumpsum + drawdown, full annuity, full drawdown, full lumpsum if trivial)

**Step 6: Transfer details (conditional)**
- Shown only if member selects transfer to another registered scheme
- Scheme name, administrator, account name, account number, bank, branch

**Step 7: Contribution summary**
- Read-only view: employee contributions, employer contributions, interest, total balance
- Labelled as indicative — final settlement subject to PSSF calculation

**Step 8: Upload documents**
- Exit letter (required)
- National ID (required)
- ATM card front page (required)
- KRA PIN certificate (required)
- Proof of residency (conditional — emigration only)
- Option election form (conditional — joined at 45+)

**Step 9: Declaration**
- Trustees have final discretion
- Bank and M-Pesa details are correct
- PSSF is not responsible for wrong payment details
- Information is true and correct

**Step 10: Preview → Confirm → Submit**
- Routes to employer for exit confirmation
- Employer confirms: date of leaving, exit reason, name, designation
- Routes to PSSF claims review
- Routes to PSSF verification
- Approval → Payment processing → Completed

---

## J6 — Death Benefits Claim

**Purpose:** Digitize PSSF.5 Death Benefits Claim Form.  
**Routing:** Claimant → PSSF claims intake → Document verification → Beneficiary verification → Trustee decision → Payment → Completed

### Steps

**Step 1: Validate deceased member**
- Enter: deceased member ID number, date of birth, personal/employment number (if known), PSSF member number (if known)
- System matches against member records

**Step 2: Review deceased member details**
- Locked: full name, personal number, employer name, date of birth
- Claimant enters: date of death

**Step 3: Add claimants (up to 5)**
- For each: name, relationship, National ID or birth cert number, KRA PIN, mobile number
- Age logic same as J3 — adults may use ID prefill, minors use birth cert

**Step 4: Home particulars**
- County, subcounty, location, sublocation, village, chief's name

**Step 5: Select benefit option**
- Six statutory options including trust fund for minors and full lumpsum

**Step 6: Payment details**
- Bank details per beneficiary
- M-Pesa number where applicable
- M-Pesa note: applicable for benefits below KES 500,000

**Step 7: Upload documents**
- Death certificate (required)
- Marriage certificate or affidavit (conditional — spouse claimant)
- Birth certificates of children (conditional)
- Claimant ID copies (required)
- ATM card front page per beneficiary (required)

**Step 8: Witness details**
- Full name, ID number, signature, date

**Step 9: Declaration**
- Each claimant confirms individually
- Trustees have final discretion
- Payment details are correct
- PSSF not responsible for wrong information

**Step 10: Preview → Confirm → Submit**
- OTP to claimant's mobile
- Routes to PSSF
- Document verification → Beneficiary verification → Trustee decision → Payment

---

## J7 — Contribution Statement

**Purpose:** Allow members to view and download their contribution history.  
**Routing:** No case created. Statement service query only.

### Steps

**Step 1: Select period**
- Current year, last 12 months, last 24 months, custom range, full statement

**Step 2: View summary**
- Total employee contributions, total employer contributions, interest earned, total balance, period, last updated

**Step 3: View breakdown**
- Month-by-month table: employee amount, employer amount, date received, status

**Step 4: Actions**
- Download PDF
- Send to email
- Send summary to WhatsApp (via CRM)
- Report missing contribution → creates MISSING_CONTRIBUTION case (E1)
- Request clarification → creates DISCREPANCY case (E2)

---

## E1 — Missing Contribution Report

**Purpose:** Allow a member to report a contribution that does not appear in their statement.  
**Routing:** Member → PSSF support review → Employer verification (if needed) → Resolved

### Steps

**Step 1:** Member selects month and contribution type (employee, employer, or both)  
**Step 2:** Member enters explanation  
**Step 3:** Member uploads supporting document (payslip — optional but recommended)  
**Step 4:** System creates a MISSING_CONTRIBUTION Case and routes to PSSF  
**Step 5:** PSSF reviews — may route to employer for verification  
**Step 6:** Resolved or closed with explanation

---

## E2 — Discrepancy Report

**Purpose:** Allow a member to report incorrect information in their locked profile fields.  
**Routing:** Member → PSSF verification (identity issues) or Employer verification (employment issues) → Resolved

### Steps

**Step 1:** Member selects which field is wrong
- Name, date of birth, ID/passport number, employer, employment number, date of employment, KRA PIN, other

**Step 2:** Member enters correct information and explanation

**Step 3:** Member uploads supporting proof document

**Step 4:** System creates a DISCREPANCY Case
- Identity issues → route to PSSF
- Employment issues → route to Employer
- Contribution issues → route to both

**Step 5:** Reviewed and resolved by appropriate party  
**Step 6:** Member notified on resolution
