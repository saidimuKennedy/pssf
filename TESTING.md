# PSSF Notification & OTP Testing Guide

## Pre-flight Checklist

- [ ] `PSSF_MOCK_NOTIFICATIONS=false` in `.env`
- [ ] `CHATNATION_WA_ACCESS_TOKEN` matches the `apiKey` on the CRM integration row
- [ ] `CHATNATION_WA_PHONE_NUMBER_ID=1068158593050608` matches CRM integration row `config.phoneNumberId`
- [ ] All 9 Meta templates are **Approved** in Meta Business Manager
- [ ] `RESEND_API_KEY` set, `RESEND_FROM_EMAIL` is a verified Resend sender
- [ ] Dev server running: `npm run dev`

---

## Your Test Credentials (Kennedy)

| Role | Login | Password | OTP delivery |
|------|-------|----------|--------------|
| **Member** | `+254704696287` | — (OTP only) | WhatsApp to `+254704696287` (falls back to portal) |
| **PSSF Officer** | `waruirukennedy2@gmail.com` | `Kennedy@1234` | Email to `waruirukennedy2@gmail.com` |
| **Employer** | `kennedy.employer@pssf.go.ke` | `Kennedy@1234` | Email to `kennedy.employer@pssf.go.ke`* |
| **Admin** | `kennedy.admin@pssf.go.ke` | `Kennedy@1234` | Email to `kennedy.admin@pssf.go.ke`* |

> *Employer and Admin OTP emails go to addresses Resend can't deliver to in test mode.
> In dev, enter **`123456`** — the code is fixed in development regardless of delivery.

**Member details** (for sign-up / validate identity):
- National ID: `70469628`
- Date of birth: `1990-06-26`
- Member number: `PSSF/2015/099`
- Employer: Kenya Test Ministry

---

## Dev OTP shortcut

In `NODE_ENV=development`, the OTP code is **always `123456`**. You don't need to wait for delivery — just type `123456` in the OTP field. This works for both member (WhatsApp) and staff (email) login.

---

## Session Cookie (needed for curl tests)

**Option A — browser:** Log in at `http://localhost:3000/login`, open DevTools → Network → any `/api/...` request, copy the `Cookie` header value.

**Option B — mint a token directly (fastest for curl testing):**

```bash
# Run once — prints OFFICER and EMPLOYER tokens
npx tsx -e "
import { encode } from '@auth/core/jwt'
const SECRET = 'rKpsFCJBzehC/r9JtGKk5VOTODAr4b4BZZ0fpW1riO8='
const salt = 'authjs.session-token'
const exp = Math.floor(Date.now() / 1000) + 4 * 60 * 60

Promise.all([
  encode({ token: { id: 'usr-kenOff-000-0000-000000000001', email: 'kennedy.officer@pssf.go.ke', role: 'PSSF_OFFICER', phone: null, employer_id: null, member_id: null, exp }, secret: SECRET, salt }),
  encode({ token: { id: 'usr-kenEmp-000-0000-000000000001', email: 'kennedy.employer@pssf.go.ke', role: 'EMPLOYER', phone: null, employer_id: 'emp-ken1-0000-0000-000000000001', member_id: null, exp }, secret: SECRET, salt }),
]).then(([officer, employer]) => {
  console.log('OFFICER_TOKEN=' + officer)
  console.log('EMPLOYER_TOKEN=' + employer)
})
"
```

Then:
```bash
BASE="http://localhost:3000"
COOKIE="authjs.session-token=<paste token here>"
```

---

## Journey 1 · Sign Up (New Member Onboarding)

**What it tests:** Identity validation → OTP via WhatsApp → Account activation.

> Use a member whose `national_id` exists in the DB but has no linked phone yet.
> Kennedy already has an account so use one of the unlinked test members below.

Unlinked test member available for sign-up:
- National ID: `34567890` · DOB: `1988-11-30` · Name: Peter Odhiambo

Steps:
1. Open `http://localhost:3000/sign-up`
2. Enter National ID `34567890` and DOB `1988-11-30` → click **Validate**
3. Confirm / update mobile number shown
4. Click **Send OTP** → WhatsApp message arrives (`pssf_otp`)
5. Enter code → account activated

---

## Journey 2 · Member Login (WhatsApp OTP)

**What it tests:** `pssf_otp` Meta template delivery.

1. Open `http://localhost:3000/login`
2. Enter phone `+254704696287` → click **Send OTP**
3. WhatsApp message arrives:
   > *Your PSSF verification code is 123456. It expires in 5 minutes. Do not share this code.*
4. Enter code → redirects to `/member/dashboard`

---

## Journey 3 · Staff Login (Email OTP)

**What it tests:** Resend email OTP delivery for 2FA.

1. Open `http://localhost:3000/login` → Staff/Email tab
2. Enter `waruirukennedy2@gmail.com` + `Kennedy@1234`
3. Check `waruirukennedy2@gmail.com` inbox → subject: *Your PSSF Verification Code*
4. Enter code (or just `123456` in dev) → redirects to `/staff/dashboard`

---

## Journey 4 · Member Enrolment Notifications

Kennedy has 5 enrolment cases at different stages:

| Reference | Status | Action to take | Notification fired |
|-----------|--------|----------------|--------------------|
| ENR-TEST-000001 | PENDING_EMPLOYER | Login as employer → **Approve** | EMPLOYER_APPROVED → WA + email |
| ENR-TEST-000002 | PENDING_EMPLOYER | Login as employer → **Reject** | EMPLOYER_REJECTED → WA + email |
| ENR-TEST-000003 | UNDER_REVIEW | Login as officer → **Approve** | CASE_APPROVED → WA + email |
| ENR-TEST-000004 | UNDER_REVIEW | Login as officer → **Request more info** | MORE_INFO_REQUIRED → WA + email |
| ENR-TEST-000005 | MORE_INFO_REQUIRED | Visible in member portal as already fired | — |

**Via Portal:**
- Employer: `http://localhost:3000/employer/approvals` → find ENR-TEST-000001, Approve
- Staff: `http://localhost:3000/staff/dashboard` → find ENR-TEST-000003, Approve

**Via curl (as staff):**
```bash
# Employer approve ENR-TEST-000001
curl -s -X POST "$BASE/api/cases/case-kenEnr1-0000-0000-00000001/employer-approve" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"officer_name":"Kennedy Waruiru","designation":"HR Director"}' | jq

# Employer reject ENR-TEST-000002
curl -s -X POST "$BASE/api/cases/case-kenEnr2-0000-0000-00000002/employer-reject" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"reason":"Employment records do not match."}' | jq

# PSSF approve ENR-TEST-000003
curl -s -X POST "$BASE/api/approvals/pssf" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"caseId":"case-kenEnr3-0000-0000-00000003","decision":"APPROVED","comments":"All verified."}' | jq

# PSSF request more info ENR-TEST-000004
curl -s -X POST "$BASE/api/notifications/send" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{
    "triggerEvent": "MORE_INFO_REQUIRED",
    "recipientType": "MEMBER",
    "recipientId": "usr-kenMem-000-0000-000000000001",
    "caseId": "case-kenEnr4-0000-0000-00000004",
    "variables": {
      "case_type_label": "Member Enrolment",
      "case_reference": "ENR-TEST-000004",
      "info_requested": "Please upload a certified copy of your National ID."
    }
  }' | jq
```

**Expected:** WhatsApp message on `+254704696287` + email to `waruirukennedy2@gmail.com`.

---

## Journey 5 · Beneficiary Nomination Notifications

| Reference | Status | Action | Notification |
|-----------|--------|--------|--------------|
| BEN-TEST-000001 | UNDER_REVIEW | PSSF approve | CASE_APPROVED → WA + email |
| BEN-TEST-000002 | UNDER_REVIEW | PSSF reject | CASE_REJECTED → WA + email |
| BEN-TEST-000003 | MORE_INFO_REQUIRED | Already in portal | — |
| BEN-TEST-000004 | COMPLETED | Historical view | — |

```bash
# PSSF approve BEN-TEST-000001
curl -s -X POST "$BASE/api/approvals/pssf" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"caseId":"case-kenBen1-0000-0000-00000001","decision":"APPROVED","comments":"Beneficiaries verified."}' | jq

# PSSF reject BEN-TEST-000002
curl -s -X POST "$BASE/api/approvals/pssf" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"caseId":"case-kenBen2-0000-0000-00000002","decision":"REJECTED","comments":"Allocation percentages do not total 100%."}' | jq
```

---

## Journey 6 · AVC Notifications

| Reference | Status | Action | Notification |
|-----------|--------|--------|--------------|
| AVC-TEST-000001 | PENDING_EMPLOYER NEW | Employer approve | EMPLOYER_APPROVED → WA + email |
| AVC-TEST-000002 | PENDING_EMPLOYER VARY | Employer reject | EMPLOYER_REJECTED → WA + email |
| AVC-TEST-000003 | UNDER_REVIEW NEW | PSSF approve | CASE_APPROVED → WA + email |
| AVC-TEST-000004 | COMPLETED CANCEL | Historical view | — |

```bash
# Employer approve AVC-TEST-000001
curl -s -X POST "$BASE/api/cases/case-kenAvc1-0000-0000-00000001/employer-approve" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"officer_name":"Kennedy Waruiru","designation":"HR Director","effective_payroll_month":"2026-07"}' | jq

# Employer reject AVC-TEST-000002
curl -s -X POST "$BASE/api/cases/case-kenAvc2-0000-0000-00000002/employer-reject" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"reason":"Payroll system does not support this variation at this time."}' | jq

# PSSF approve AVC-TEST-000003
curl -s -X POST "$BASE/api/approvals/pssf" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"caseId":"case-kenAvc3-0000-0000-00000003","decision":"APPROVED","comments":"AVC recorded."}' | jq
```

---

## Journey 7 · Benefits Claim Notifications (Full Pipeline)

This journey covers every notification event in sequence:

| Reference | Status | Action | Notification |
|-----------|--------|--------|--------------|
| CLM-TEST-000001 | PENDING_EMPLOYER | Employer approve | EMPLOYER_APPROVED → WA + email |
| CLM-TEST-000002 | PENDING_EMPLOYER | Employer reject | EMPLOYER_REJECTED → WA + email |
| CLM-TEST-000003 | UNDER_REVIEW | PSSF approve | CASE_APPROVED → WA + email |
| CLM-TEST-000004 | UNDER_REVIEW | PSSF reject | CASE_REJECTED → WA + email |
| CLM-TEST-000005 | UNDER_REVIEW | PSSF more info | MORE_INFO_REQUIRED → WA + email |
| CLM-TEST-000006 | APPROVED | Mark payment processing | PAYMENT_PROCESSING → WA + email |
| CLM-TEST-000007 | PAYMENT_PROCESSING | Mark paid | CASE_COMPLETED → WA + email |

```bash
# Employer approve CLM-TEST-000001
curl -s -X POST "$BASE/api/cases/case-kenClm1-0000-0000-00000001/employer-approve" \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" \
  -d '{"officer_name":"Kennedy Waruiru","designation":"HR Director"}' | jq

# Employer reject CLM-TEST-000002
curl -s -X POST "$BASE/api/cases/case-kenClm2-0000-0000-00000002/employer-reject" \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" \
  -d '{"reason":"Exit date not confirmed in our records."}' | jq

# PSSF approve CLM-TEST-000003
curl -s -X POST "$BASE/api/approvals/pssf" \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" \
  -d '{"caseId":"case-kenClm3-0000-0000-00000003","decision":"APPROVED","comments":"All documents verified."}' | jq

# PSSF reject CLM-TEST-000004
curl -s -X POST "$BASE/api/approvals/pssf" \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" \
  -d '{"caseId":"case-kenClm4-0000-0000-00000004","decision":"REJECTED","comments":"Bank account details could not be verified."}' | jq

# PSSF request more info CLM-TEST-000005
curl -s -X POST "$BASE/api/notifications/send" \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" \
  -d '{
    "triggerEvent": "MORE_INFO_REQUIRED",
    "recipientType": "MEMBER",
    "recipientId": "usr-kenMem-000-0000-000000000001",
    "caseId": "case-kenClm5-0000-0000-00000005",
    "variables": {
      "case_type_label": "Benefits Claim",
      "case_reference": "CLM-TEST-000005",
      "info_requested": "Please upload a certified ATM card copy."
    }
  }' | jq

# Mark CLM-TEST-000006 payment processing
curl -s -X POST "$BASE/api/cases/case-kenClm6-0000-0000-00000006/mark-payment-processing" \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" -d '{}' | jq

# Mark CLM-TEST-000007 paid / completed
curl -s -X POST "$BASE/api/cases/case-kenClm7-0000-0000-00000007/mark-paid" \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" -d '{}' | jq
```

---

## Journey 8 · Death Benefits Claim

Kennedy is the **claimant** on these cases (not the deceased member).

| Reference | Status | Notes |
|-----------|--------|-------|
| DCL-TEST-000001 | SUBMITTED | In PSSF intake queue |
| DCL-TEST-000002 | UNDER_VERIFICATION | Documents under review |
| DCL-TEST-000003 | AWAITING_TRUSTEE | Pending trustee decision |

Process DCL-TEST-000001 through to completion in the staff portal to trigger all claimant notification events (same trigger events as benefits claim).

---

## Journey 9 · Contribution Statement (WhatsApp + Email)

From the member portal after logging in as Kennedy:

```bash
# Send statement summary to WhatsApp
curl -s -X POST "$BASE/api/notifications/send" \
  -H "Content-Type: application/json" \
  -H "Cookie: $MEMBER_COOKIE" \
  -d '{
    "triggerEvent": "STATEMENT_EMAIL",
    "channel": "WHATSAPP",
    "variables": {
      "full_name": "Kennedy Waruiru",
      "period_from": "Jun 2024",
      "period_to": "May 2026",
      "total_balance": "KES 2,160,000"
    }
  }' | jq

# Send full statement to email
curl -s -X POST "$BASE/api/notifications/send" \
  -H "Content-Type: application/json" \
  -H "Cookie: $MEMBER_COOKIE" \
  -d '{
    "triggerEvent": "STATEMENT_EMAIL",
    "channel": "EMAIL",
    "variables": {
      "full_name": "Kennedy Waruiru",
      "period_from": "Jun 2024",
      "period_to": "May 2026",
      "total_balance": "KES 2,160,000"
    }
  }' | jq
```

---

## Journey 10 · Discrepancy & Missing Contribution

| Reference | Type | Status |
|-----------|------|--------|
| DIS-TEST-000001 | Discrepancy | UNDER_REVIEW — employer name correction |
| MCR-TEST-000001 | Missing Contribution | UNDER_REVIEW — April 2026 both employee+employer |

Process these in the staff portal to test the full resolution flow.

---

## Complete Notification Coverage Map

| Trigger event | Template | Channel | Case to use |
|---------------|----------|---------|-------------|
| EMPLOYER_APPROVED | pssf_employer_approved + email | WA + Email | ENR-TEST-1, AVC-TEST-1, CLM-TEST-1 |
| EMPLOYER_REJECTED | pssf_employer_rejected + email | WA + Email | ENR-TEST-2, AVC-TEST-2, CLM-TEST-2 |
| MORE_INFO_REQUIRED | pssf_more_info_required + email | WA + Email | ENR-TEST-4, CLM-TEST-5 |
| CASE_APPROVED | pssf_case_approved + email | WA + Email | ENR-TEST-3, BEN-TEST-1, AVC-TEST-3, CLM-TEST-3 |
| CASE_REJECTED | pssf_case_rejected + email | WA + Email | BEN-TEST-2, CLM-TEST-4 |
| PAYMENT_PROCESSING | pssf_payment_processing + email | WA + Email | CLM-TEST-6 |
| CASE_COMPLETED | pssf_case_completed + email | WA + Email | CLM-TEST-7 |
| OTP | pssf_otp | WA only | Login with +254704696287 |
| STATEMENT | pssf_statement + email | WA + Email | Journey 9 curl |

---

## Verifying Delivery

**WhatsApp:** analytics dashboard → Messages → Outbound → filter by `pssf_*` template

**Email:** Resend dashboard → Emails → should show `Delivered`; check `waruirukennedy2@gmail.com` inbox

**Portal:** Log in as Kennedy member → notification bell should show unread items
`GET /api/notifications` returns the full list

---

## Quick Reset

Re-seed at any time to reset all cases back to their original statuses:

```bash
npx tsx prisma/seed.ts
```
