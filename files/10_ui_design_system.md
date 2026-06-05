# PSSF — UI Design System

**Version:** 1.0  
**Status:** Approved for implementation  
**Source:** Derived from approved UI mock

---

## Brand

**Name:** PSSF Smart Self-Service Platform  
**Full name:** Public Service Superannuation Fund — Smart Self-Service Platform  
**Tagline:** Securing tomorrow, today

---

## Color Palette

### Primary colors

| Name | Hex | Usage |
|---|---|---|
| PSSF Navy | `#0D2137` | Hero background, footer, primary headings, dark CTA |
| PSSF Green | `#1A7A4A` | Logo, Access Portal button, approved badges, accent arrows |
| White | `#FFFFFF` | Page background, card surfaces |

### Secondary colors

| Name | Hex | Usage |
|---|---|---|
| Light Gray | `#F5F5F5` | Page background alternate sections |
| Border Gray | `#E5E7EB` | Card borders, dividers |
| Text Primary | `#111827` | Body text |
| Text Secondary | `#6B7280` | Subtitles, captions, muted text |

### Status colors

| Status | Color | Hex |
|---|---|---|
| Approved / Completed | Green | `#16A34A` |
| Under Review / Pending | Amber | `#D97706` |
| More Info Required | Blue | `#2563EB` |
| Rejected | Red | `#DC2626` |
| Draft | Gray | `#6B7280` |
| Submitted | Indigo | `#4F46E5` |
| Payment Processing | Teal | `#0D9488` |

### Service card accent colors (from mock)

Each service card uses a distinct icon color:

| Service | Icon color |
|---|---|
| Member Enrolment | PSSF Green `#1A7A4A` |
| Beneficiary Nomination | Blue `#2563EB` |
| AVC Contributions | Green `#16A34A` |
| Benefits Claim | Purple `#7C3AED` |
| Death Benefits Claim | Rose `#E11D48` |
| Contribution Statement | Navy `#0D2137` |
| Missing Contribution | Amber `#D97706` |

---

## Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Hero headline | System sans-serif | 48px / 3rem | 800 (extra bold) |
| Page heading H1 | System sans-serif | 36px / 2.25rem | 700 |
| Section heading H2 | System sans-serif | 28px / 1.75rem | 600 |
| Card heading H3 | System sans-serif | 18px / 1.125rem | 600 |
| Body | System sans-serif | 16px / 1rem | 400 |
| Small / caption | System sans-serif | 14px / 0.875rem | 400 |
| Label | System sans-serif | 13px / 0.8125rem | 500 |

Font stack: `Inter, system-ui, -apple-system, sans-serif`

---

## Spacing Scale (Tailwind defaults)

```
4px   — 1    tight spacing
8px   — 2    compact elements
12px  — 3    small gap
16px  — 4    standard gap
24px  — 6    card padding
32px  — 8    section gap
48px  — 12   large section gap
64px  — 16   hero padding
```

---

## Component Library

**Base:** shadcn/ui  
**Utility:** Tailwind CSS

All shadcn/ui components are used with the following theme overrides:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      pssf: {
        navy: "#0D2137",
        green: "#1A7A4A",
      }
    }
  }
}
```

---

## Core Components

### Button variants

| Variant | Usage | Style |
|---|---|---|
| Primary | Access Portal, Submit, Confirm | PSSF Navy background, white text |
| Secondary | Track Request, Cancel, Back | White background, navy border, navy text |
| Success | Approve | Green background, white text |
| Destructive | Reject | Red background, white text |
| Ghost | Tertiary actions | No background, text only |

### Status badge

```tsx
<Badge variant="approved">Approved</Badge>
<Badge variant="under_review">Under Review</Badge>
<Badge variant="more_info">More Info Required</Badge>
<Badge variant="rejected">Rejected</Badge>
<Badge variant="draft">Draft</Badge>
<Badge variant="submitted">Submitted</Badge>
<Badge variant="pending_employer">Pending Employer</Badge>
<Badge variant="completed">Completed</Badge>
<Badge variant="payment">Payment Processing</Badge>
```

### Card

Standard surface with white background, 1px border, 8px radius, 24px padding. Used for service cards, case list items, dashboard widgets.

### Form fields

All form inputs use shadcn/ui `Input`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`. Locked (prefilled) fields render as read-only with a lock icon and a muted background.

### Step indicator

Used across all journey forms. Shows the member's progress through the validate → prefill → complete → upload → preview → confirm flow.

```
● Validate  ─  ● Complete  ─  ○ Upload  ─  ○ Preview  ─  ○ Confirm
```

Active step: filled circle, navy. Completed step: filled circle, green with checkmark. Upcoming step: empty circle, gray.

### File upload slot

Each document slot shows:
- Document type label
- Required / optional badge
- Upload button (when PENDING)
- File name + status badge (when uploaded)
- Rejection reason (when REJECTED) + re-upload button

---

## Layout Patterns

### Public landing page

Full-width layout. No sidebar. Navigation bar fixed at top.

Sections (top to bottom):
1. Navigation bar
2. Hero — headline left, building image right, two CTAs, trust badges
3. Services grid — 7 service cards
4. How It Works — 6-step horizontal strip
5. Track Your Requests — status list + notification preferences
6. Trust strip — 4 columns
7. Footer

### Member portal

Authenticated layout. Left sidebar navigation + main content area.

Sidebar items:
- Dashboard
- My Requests
- Member Enrolment
- Beneficiary Nomination
- AVC Contributions
- Benefits Claim
- Death Benefits Claim
- Contribution Statement
- Discrepancy / Missing Contribution

### Employer portal

Authenticated layout. Left sidebar.

Sidebar items:
- Dashboard
- Pending Approvals
- Completed
- Discrepancy Verifications

### Staff portal

Authenticated layout. Left sidebar.

Sidebar items:
- Dashboard
- All Cases
- Enrolments
- Beneficiaries
- AVC
- Claims
- Death Claims
- Missing Contributions
- Discrepancies
- Reports

### Admin portal

Authenticated layout. Left sidebar.

Sidebar items:
- Dashboard
- Users
- Employers
- Notification Rules
- Audit Trail
- Reports

---

## Navigation Bar (Public)

Logo left. Navigation links center. Dark mode toggle + Login + Access Portal buttons right.

Links: Home, Services ▾, How It Works, About PSSF, Resources ▾, Support

**Mobile:** Hamburger menu collapses all navigation links.

---

## Responsive Breakpoints

| Name | Width | Layout change |
|---|---|---|
| Mobile | < 640px | Single column, stacked, hamburger nav |
| Tablet | 640px – 1024px | Two column grid where applicable |
| Desktop | > 1024px | Full layout as designed |

---

## Dark Mode

Dark mode toggle is present in the navigation bar. Implementation uses Tailwind's `dark:` variant. System preference is respected by default.

Dark mode palette:
- Background: `#0F172A`
- Card surface: `#1E293B`
- Text primary: `#F1F5F9`
- Text secondary: `#94A3B8`
- Border: `#334155`
