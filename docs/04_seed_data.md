# PSSF — Seed Data Specification

**Version:** 1.0  
**Status:** Approved for implementation  
**Purpose:** Define all seed records needed to exercise every journey, every status, and every role end to end in the demo environment.

---

## Seed Users

### Staff and admin users

| Name | Email | Role | Password |
|---|---|---|---|
| Admin User | admin@pssf.go.ke | ADMIN | seed_admin_2024 |
| Grace Otieno | grace.otieno@pssf.go.ke | PSSF_SUPERVISOR | seed_super_2024 |
| David Mutua | david.mutua@pssf.go.ke | PSSF_OFFICER | seed_officer_2024 |
| Beatrice Njeri | beatrice.njeri@pssf.go.ke | PSSF_OFFICER | seed_officer_2024 |

### Employer users

| Name | Email | Role | Employer |
|---|---|---|---|
| James Kariuki | james.kariuki@health.go.ke | EMPLOYER | Ministry of Health |
| Susan Wambui | susan.wambui@education.go.ke | EMPLOYER | Ministry of Education |

### Member users

| Name | Phone | Role | National ID |
|---|---|---|---|
| John Kamau Mwangi | +254700000001 | MEMBER | 12345678 |
| Mary Achieng Ouma | +254700000002 | MEMBER | 23456789 |
| Peter Njoroge Kimani | +254700000003 | MEMBER | 34567890 |
| Alice Wanjiku Gichuki | +254700000004 | MEMBER | 45678901 |
| Robert Odhiambo Onyango | +254700000005 | MEMBER | 56789012 |

### Claimant users (for death benefits demo)

| Name | Phone | Role |
|---|---|---|
| Sarah Kamau | +254700000006 | CLAIMANT |

---

## Seed Employers

| Name | Code |
|---|---|
| Ministry of Health | MOH |
| Ministry of Education | MOE |
| Kenya Revenue Authority | KRA |
| National Treasury | NTR |

---

## Seed Members (linked to users above)

| Member | National ID | Member No | Employer | Personal No | Employment Date |
|---|---|---|---|---|---|
| John Kamau Mwangi | 12345678 | PSSF-0012345 | Ministry of Health | EMP-MOH-0034 | 2005-03-01 |
| Mary Achieng Ouma | 23456789 | PSSF-0023456 | Ministry of Education | EMP-MOE-0087 | 2010-07-15 |
| Peter Njoroge Kimani | 34567890 | PSSF-0034567 | Kenya Revenue Authority | EMP-KRA-0156 | 2008-01-20 |
| Alice Wanjiku Gichuki | 45678901 | PSSF-0045678 | National Treasury | EMP-NTR-0201 | 2015-09-01 |
| Robert Odhiambo Onyango | 56789012 | PSSF-0056789 | Ministry of Health | EMP-MOH-0412 | 2001-06-01 |

All members seeded with:
- KRA PIN in format `A000000000X`
- Mobile number from user record
- Communication preference: PORTAL

---

## Seed Cases

One case per journey type, seeded at representative statuses to allow every queue and dashboard view to be populated.

### J2 — Member Enrolment

| Reference | Member | Status | Notes |
|---|---|---|---|
| ENR-2024-000001 | John Kamau | DRAFT | Member has started but not submitted |
| ENR-2024-000002 | Mary Achieng | PENDING_EMPLOYER | Awaiting MOE confirmation |
| ENR-2024-000003 | Peter Njoroge | UNDER_REVIEW | Employer approved, now with PSSF |
| ENR-2024-000004 | Alice Wanjiku | COMPLETED | Fully processed |
| ENR-2024-000005 | Robert Odhiambo | EMPLOYER_REJECTED | Rejected by MOH |

### J3 — Beneficiary Nomination

| Reference | Member | Status | Notes |
|---|---|---|---|
| BEN-2024-000001 | John Kamau | DRAFT | Two beneficiaries added, not submitted |
| BEN-2024-000002 | Mary Achieng | UNDER_REVIEW | With PSSF |
| BEN-2024-000003 | Peter Njoroge | MORE_INFO_REQUIRED | PSSF requested witness details |
| BEN-2024-000004 | Alice Wanjiku | COMPLETED | Records updated |

### J4 — AVC

| Reference | Member | Status | AVC Action | Method |
|---|---|---|---|---|
| AVC-2024-000001 | John Kamau | DRAFT | NEW | PAYROLL |
| AVC-2024-000002 | Mary Achieng | PENDING_EMPLOYER | NEW | PAYROLL |
| AVC-2024-000003 | Peter Njoroge | COMPLETED | VARY | PAYROLL |
| AVC-2024-000004 | Alice Wanjiku | COMPLETED | CANCEL | PAYROLL |

### J5 — Benefits Claim

| Reference | Member | Status | Notes |
|---|---|---|---|
| CLM-2024-000001 | Robert Odhiambo | SUBMITTED | Just submitted, awaiting routing |
| CLM-2024-000002 | Peter Njoroge | PENDING_EMPLOYER | Awaiting KRA exit confirmation |
| CLM-2024-000003 | Mary Achieng | UNDER_REVIEW | Employer confirmed, with PSSF |
| CLM-2024-000004 | Alice Wanjiku | UNDER_VERIFICATION | In PSSF verification |
| CLM-2024-000005 | John Kamau | APPROVED | Approved, payment pending |
| CLM-2024-000006 | Robert Odhiambo | PAYMENT_PROCESSING | Payment initiated |

### J6 — Death Benefits Claim

| Reference | Claimant | Status | Notes |
|---|---|---|---|
| DCL-2024-000001 | Sarah Kamau | SUBMITTED | Filed against John Kamau record |
| DCL-2024-000002 | Sarah Kamau | UNDER_VERIFICATION | Docs verified |
| DCL-2024-000003 | Sarah Kamau | AWAITING_TRUSTEE | Pending trustee decision |

### E1 — Missing Contribution

| Reference | Member | Status |
|---|---|---|
| MCR-2024-000001 | Mary Achieng | UNDER_REVIEW |
| MCR-2024-000002 | Peter Njoroge | COMPLETED |

### E2 — Discrepancy

| Reference | Member | Status | Field |
|---|---|---|---|
| DIS-2024-000001 | John Kamau | UNDER_REVIEW | Name spelling |
| DIS-2024-000002 | Alice Wanjiku | COMPLETED | Date of birth |

---

## Seed Documents

Each case above is seeded with documents at appropriate statuses.

| Case | Document Type | Status |
|---|---|---|
| ENR-2024-000003 | NATIONAL_ID | VERIFIED |
| ENR-2024-000002 | NATIONAL_ID | UPLOADED |
| BEN-2024-000002 | NATIONAL_ID | VERIFIED |
| BEN-2024-000002 | BIRTH_CERTIFICATE | VERIFIED |
| CLM-2024-000004 | EXIT_LETTER | VERIFIED |
| CLM-2024-000004 | NATIONAL_ID | VERIFIED |
| CLM-2024-000004 | ATM_CARD | UNDER_REVIEW |
| CLM-2024-000004 | KRA_PIN | VERIFIED |
| DCL-2024-000002 | DEATH_CERTIFICATE | VERIFIED |
| DCL-2024-000002 | MARRIAGE_CERTIFICATE | VERIFIED |
| DCL-2024-000002 | CLAIMANT_ID | VERIFIED |
| DCL-2024-000002 | ATM_CARD | UNDER_REVIEW |

Seed documents use a small placeholder PDF binary. Real content is not required for demo.

---

## Seed Approvals

| Case | Type | Decision | Actor |
|---|---|---|---|
| ENR-2024-000003 | EMPLOYER | APPROVED | James Kariuki |
| ENR-2024-000005 | EMPLOYER | REJECTED | James Kariuki |
| CLM-2024-000003 | EMPLOYER | APPROVED | James Kariuki |
| CLM-2024-000004 | EMPLOYER | APPROVED | James Kariuki |
| CLM-2024-000004 | PSSF | APPROVED | David Mutua |
| BEN-2024-000003 | PSSF | REQUEST_MORE_INFO | Beatrice Njeri |

---

## Seed Contributions

Each member gets 24 months of contribution history.

| Member | Monthly Employee | Monthly Employer |
|---|---|---|
| John Kamau | 37,500 | 37,500 |
| Mary Achieng | 28,000 | 28,000 |
| Peter Njoroge | 42,000 | 42,000 |
| Alice Wanjiku | 55,000 | 55,000 |
| Robert Odhiambo | 31,000 | 31,000 |

All contributions seeded with status `RECEIVED` and sequential `date_received` values. Interest is calculated as a flat 8% annual rate applied to the running balance.

---

## Seed Beneficiaries

Seeded against BEN-2024-000001 (John Kamau, DRAFT):

| Name | Relationship | Allocation | Minor |
|---|---|---|---|
| James Kamau | Child | 40% | No |
| Grace Kamau | Spouse | 60% | No |

Seeded against BEN-2024-000002 (Mary Achieng, UNDER_REVIEW):

| Name | Relationship | Allocation | Minor |
|---|---|---|---|
| Peter Ouma | Child | 50% | Yes |
| Jane Ouma | Child | 30% | Yes |
| Thomas Achieng | Parent | 20% | No |

Guardian for minors: Mary's mother, Esther Achieng.

---

## Seed Notification Rules

| Trigger Event | Recipient Type | Channel | Template Ref |
|---|---|---|---|
| CASE_SUBMITTED | MEMBER | PORTAL | tpl_case_submitted_portal |
| CASE_SUBMITTED | PSSF_STAFF | PORTAL | tpl_case_submitted_staff_portal |
| PENDING_EMPLOYER | EMPLOYER | EMAIL | tpl_pending_employer_email |
| PENDING_EMPLOYER | EMPLOYER | PORTAL | tpl_pending_employer_portal |
| EMPLOYER_APPROVED | MEMBER | PORTAL | tpl_employer_approved_portal |
| EMPLOYER_APPROVED | MEMBER | WHATSAPP | tpl_employer_approved_wa |
| EMPLOYER_REJECTED | MEMBER | PORTAL | tpl_employer_rejected_portal |
| EMPLOYER_REJECTED | MEMBER | EMAIL | tpl_employer_rejected_email |
| MORE_INFO_REQUIRED | MEMBER | PORTAL | tpl_more_info_portal |
| MORE_INFO_REQUIRED | MEMBER | WHATSAPP | tpl_more_info_wa |
| CASE_APPROVED | MEMBER | PORTAL | tpl_approved_portal |
| CASE_APPROVED | MEMBER | WHATSAPP | tpl_approved_wa |
| CASE_APPROVED | MEMBER | EMAIL | tpl_approved_email |
| CASE_REJECTED | MEMBER | PORTAL | tpl_rejected_portal |
| CASE_REJECTED | MEMBER | EMAIL | tpl_rejected_email |
| PAYMENT_PROCESSING | MEMBER | PORTAL | tpl_payment_processing_portal |
| PAYMENT_PROCESSING | MEMBER | WHATSAPP | tpl_payment_processing_wa |
| CASE_COMPLETED | MEMBER | PORTAL | tpl_completed_portal |
| CASE_COMPLETED | MEMBER | WHATSAPP | tpl_completed_wa |
| DOCUMENT_REJECTED | MEMBER | PORTAL | tpl_doc_rejected_portal |
| TASK_OVERDUE | EMPLOYER | EMAIL | tpl_task_overdue_email |
| CASE_REASSIGNED | PSSF_STAFF | PORTAL | tpl_reassigned_portal |

---

## Seed Script Order

Run in this sequence to avoid foreign key violations:

1. Employers
2. Users
3. Members (requires users + employers)
4. Employer officers (requires users + employers)
5. Cases (requires members + employers)
6. Case status history (requires cases)
7. Documents (requires cases)
8. Approvals (requires cases + users)
9. Tasks (requires cases + users)
10. Beneficiaries (requires cases + members)
11. Contributions (requires members)
12. Notification rules (standalone)
13. Notifications (requires cases + users)
14. Audit events (requires cases + users)
