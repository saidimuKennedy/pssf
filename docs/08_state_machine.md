# PSSF — State Machine Specification

**Version:** 1.0  
**Status:** Approved for implementation

---

## Overview

The state machine governs all Case status transitions. It is implemented as a single service module. No status change happens outside this module.

Every transition:
1. Validates the transition is permitted from the current status
2. Validates the actor has permission to trigger it
3. Executes the transition — updates the Case status
4. Writes a `CaseStatusHistory` record
5. Writes an `AuditEvent`
6. Executes side effects — task generation, notification dispatch
7. Returns the updated Case

---

## Implementation Shape

```typescript
// lib/state-machine/transitions.ts

interface TransitionContext {
  case_id: string
  actor_id: string
  actor_role: Role
  reason?: string
  metadata?: Record<string, unknown>
}

async function transition(
  action: CaseAction,
  context: TransitionContext
): Promise<Case>
```

The transition function is the single entry point for all status changes. It is called by API route handlers and server actions.

---

## Transition Table

| Action | From status | To status | Allowed roles | Side effects |
|---|---|---|---|---|
| `SUBMIT` | DRAFT | SUBMITTED | MEMBER, CLAIMANT | Route case, generate task |
| `ROUTE_TO_EMPLOYER` | SUBMITTED | PENDING_EMPLOYER | SYSTEM | Generate employer task, notify employer |
| `ROUTE_TO_PSSF` | SUBMITTED | UNDER_REVIEW | SYSTEM | Generate PSSF task, notify member |
| `EMPLOYER_APPROVE` | PENDING_EMPLOYER | EMPLOYER_APPROVED | EMPLOYER | Write approval event |
| `EMPLOYER_REJECT` | PENDING_EMPLOYER | EMPLOYER_REJECTED | EMPLOYER | Write approval event, notify member |
| `ROUTE_AFTER_EMPLOYER` | EMPLOYER_APPROVED | UNDER_REVIEW | SYSTEM | Generate PSSF task, notify member |
| `REQUEST_MORE_INFO` | UNDER_REVIEW | MORE_INFO_REQUIRED | PSSF_OFFICER, PSSF_SUPERVISOR | Write approval event, notify member |
| `SUBMIT_ADDITIONAL_INFO` | MORE_INFO_REQUIRED | UNDER_REVIEW | MEMBER, CLAIMANT | Notify PSSF officer |
| `ROUTE_TO_VERIFICATION` | UNDER_REVIEW | UNDER_VERIFICATION | PSSF_OFFICER, PSSF_SUPERVISOR | Generate verification task |
| `ROUTE_TO_TRUSTEE` | UNDER_VERIFICATION | AWAITING_TRUSTEE | PSSF_OFFICER, PSSF_SUPERVISOR | Generate supervisor task, notify |
| `PSSF_APPROVE` | UNDER_REVIEW | APPROVED | PSSF_OFFICER, PSSF_SUPERVISOR | Write approval event, notify member, trigger payment if applicable |
| `PSSF_APPROVE` | UNDER_VERIFICATION | APPROVED | PSSF_OFFICER, PSSF_SUPERVISOR | Write approval event, notify member, trigger payment if applicable |
| `TRUSTEE_APPROVE` | AWAITING_TRUSTEE | APPROVED | PSSF_SUPERVISOR | Write approval event, notify, trigger payment |
| `PSSF_REJECT` | UNDER_REVIEW | REJECTED | PSSF_OFFICER, PSSF_SUPERVISOR | Write approval event, notify member |
| `PSSF_REJECT` | UNDER_VERIFICATION | REJECTED | PSSF_OFFICER, PSSF_SUPERVISOR | Write approval event, notify member |
| `TRUSTEE_REJECT` | AWAITING_TRUSTEE | REJECTED | PSSF_SUPERVISOR | Write approval event, notify |
| `MARK_PAYMENT_PROCESSING` | APPROVED | PAYMENT_PROCESSING | PSSF_OFFICER, PSSF_SUPERVISOR, SYSTEM | Notify member |
| `MARK_PAID` | PAYMENT_PROCESSING | COMPLETED | PSSF_OFFICER, PSSF_SUPERVISOR, SYSTEM | Notify member |
| `MARK_COMPLETE` | APPROVED | COMPLETED | SYSTEM | Notify member |
| `CLOSE` | EMPLOYER_REJECTED | CLOSED | PSSF_SUPERVISOR | — |
| `CLOSE` | REJECTED | CLOSED | PSSF_SUPERVISOR | — |
| `CLOSE` | COMPLETED | CLOSED | PSSF_SUPERVISOR, SYSTEM | — |

---

## Routing Logic

When a Case is submitted, the system automatically routes it based on case type:

```typescript
// lib/state-machine/routing.ts

function getInitialRoute(caseType: CaseType): CaseAction {
  const requiresEmployer = [
    CaseType.MEMBER_ENROLMENT,
    CaseType.AVC,         // payroll method only
    CaseType.BENEFITS_CLAIM
  ]

  if (requiresEmployer.includes(caseType)) {
    return CaseAction.ROUTE_TO_EMPLOYER
  }

  return CaseAction.ROUTE_TO_PSSF
}
```

AVC cases where `form_data.method === "MOBILE_WALLET"` route directly to PSSF, bypassing employer.

---

## Side Effects

### Task generation

Tasks are created automatically on specific transitions.

```typescript
// lib/state-machine/tasks.ts

const TASK_GENERATION_RULES: Record<CaseAction, TaskSpec | null> = {
  ROUTE_TO_EMPLOYER: {
    task_type: "CONFIRM_EMPLOYMENT",
    assigned_role: Role.EMPLOYER
  },
  ROUTE_TO_PSSF: {
    task_type: determineReviewTaskType,   // varies by case type
    assigned_role: Role.PSSF_OFFICER
  },
  ROUTE_AFTER_EMPLOYER: {
    task_type: determineReviewTaskType,
    assigned_role: Role.PSSF_OFFICER
  },
  REQUEST_MORE_INFO: {
    task_type: "PROVIDE_ADDITIONAL_INFO",
    assigned_role: null    // assigned to case owner (member/claimant)
  },
  ROUTE_TO_VERIFICATION: {
    task_type: "VERIFY_DOCUMENTS",
    assigned_role: Role.PSSF_OFFICER
  },
  ROUTE_TO_TRUSTEE: {
    task_type: "TRUSTEE_DECISION",
    assigned_role: Role.PSSF_SUPERVISOR
  }
}
```

### Task type by case type

| Case type | Review task type |
|---|---|
| MEMBER_ENROLMENT | REVIEW_ENROLMENT |
| BENEFICIARY_NOMINATION | REVIEW_BENEFICIARIES |
| AVC | REVIEW_AVC |
| BENEFITS_CLAIM | REVIEW_CLAIM |
| DEATH_BENEFITS_CLAIM | REVIEW_DEATH_CLAIM |
| MISSING_CONTRIBUTION | REVIEW_MISSING_CONTRIBUTION |
| DISCREPANCY | REVIEW_DISCREPANCY |

### Notification dispatch

Every transition that has a corresponding notification trigger fires `dispatch()` from the notification service. Notification dispatch is non-blocking — a notification failure does not roll back the status transition.

### Audit event

Every transition writes an `AuditEvent` with:
- `action` = the transition action name
- `from_status` = the previous status
- `to_status` = the new status
- `actor_id` and `actor_role`
- `metadata` = reason, comments, or other context

---

## Guard Conditions

Invalid transitions throw a `INVALID_STATUS_TRANSITION` error before any database write.

```typescript
// lib/state-machine/guards.ts

function assertValidTransition(
  currentStatus: CaseStatus,
  action: CaseAction,
  actorRole: Role
): void {
  const allowed = TRANSITION_TABLE[action]
  if (!allowed) throw new TransitionError("Unknown action")
  if (allowed.from !== currentStatus) throw new TransitionError("INVALID_STATUS_TRANSITION")
  if (!allowed.roles.includes(actorRole)) throw new AuthError("FORBIDDEN")
}
```

---

## Payment Trigger

When a `BENEFITS_CLAIM` or `DEATH_BENEFITS_CLAIM` case reaches `APPROVED`, the system automatically calls `MARK_PAYMENT_PROCESSING` as a system-triggered transition. This sets status to `PAYMENT_PROCESSING` and notifies the member. Manual confirmation of payment by a PSSF officer triggers `MARK_PAID`, which moves the case to `COMPLETED`.

---

## Atomic Execution

All state machine operations run inside a Prisma transaction:

```typescript
await prisma.$transaction(async (tx) => {
  await tx.case.update(...)
  await tx.caseStatusHistory.create(...)
  await tx.auditEvent.create(...)
  if (task) await tx.task.create(...)
})
// Notifications dispatched after transaction commits
await dispatch(...)
```

If any database write fails, the entire transition rolls back. Notifications are dispatched after the transaction commits successfully.
