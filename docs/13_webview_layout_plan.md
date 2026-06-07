# Plan: WhatsApp Webview Layout

## Context
PSSF sends WhatsApp notifications on every case transition. Currently templates are plain text — members read the message but have no direct link to act or view details. 

The goal is to add a mobile-optimized webview layout and case status page so WhatsApp notification templates can include a CTA button (`url` button component) that opens a rich but lightweight case status page directly inside WhatsApp's in-app browser.

---

## What changes

### 1. New route group: `app/(webview)/`

A stripped-down layout with no sidebar, no full navbar — just a PSSF logo header and the page content. Optimized for a narrow mobile viewport.

**`app/(webview)/layout.tsx`**
- `<html><body>` wrapper (inherits root layout fonts/globals)  
- Minimal header: PSSF logo + "Smart Self-Service Platform" wordmark, white background
- `{children}` in a `max-w-md mx-auto px-4 py-6` container
- No auth check — purely public

**`app/(webview)/case/[ref]/page.tsx`**
- Reads `ref` param, calls `/api/track?ref={ref}` (existing endpoint, no new API needed)
- Shows: case type label, reference, current status badge, submitted date, and status history timeline
- Uses the existing `CaseTimeline` component if extractable; otherwise a simple ordered list
- Bottom CTA: "View full details — log in to the PSSF portal" → links to `/login`
- Handles not-found gracefully (invalid ref → "Case not found" card)

---

### 2. Add `webview_url` to notification dispatch

**`lib/notifications/dispatch.ts`** — enrich variables automatically:
```typescript
webview_url: `${process.env.NEXT_PUBLIC_APP_URL}/webview/case/${caseRecord.reference}`,
```
This makes `[webview_url]` available to all templates without touching each call site.

---

### 3. Update WhatsApp Meta templates to include CTA button

**`lib/notifications/templates.ts`** — add a `button` component to the relevant WA templates. The Meta API supports a `url` type button in the `components` array:

```typescript
tpl_case_approved_wa: {
  name: "pssf_case_approved",
  language: "en",
  components: (v) => [
    { type: "body", parameters: [
      { type: "text", text: v.case_type_label ?? "" },
      { type: "text", text: v.case_reference ?? "" },
    ]},
    { type: "button", sub_type: "url", index: "0", parameters: [
      { type: "text", text: v.case_reference ?? "" }, // dynamic URL suffix
    ]},
  ],
},
```

Templates to update (all that notify the member about a status change):
- `tpl_case_approved_wa`
- `tpl_case_rejected_wa`
- `tpl_more_info_required_wa`
- `tpl_payment_processing_wa`
- `tpl_case_completed_wa`
- `tpl_pending_employer_wa`
- `tpl_employer_approved_wa`
- `tpl_employer_rejected_wa`

> **Note:** Each of these Meta templates must also be updated in Meta Business Manager to add the URL button with base URL `https://pssf.go.ke/webview/case/` and dynamic suffix `{{1}}`. That's a one-time manual step per template.

---

## Files to create / modify

| File | Action |
|---|---|
| `app/(webview)/layout.tsx` | **Create** — minimal mobile layout |
| `app/(webview)/case/[ref]/page.tsx` | **Create** — case status viewer |
| `lib/notifications/dispatch.ts` | **Edit** — add `webview_url` to enriched variables |
| `lib/notifications/templates.ts` | **Edit** — add button component to 8 WA templates |

---

## Reuse

- **`/api/track` route** (`app/api/track/route.ts`) — already returns `{ reference, type_label, status, submitted_at, updated_at, status_history[] }`. No new API needed.
- **Status badge styling** — copy pattern from `/member/requests` page
- **Timeline list** — copy from `/staff/cases/[id]/client.tsx` or `/member/requests/[id]`

---

## Verification

1. Run dev server. Visit `http://localhost:3000/webview/case/ENR-TEST-1` (seeded case).
2. Confirm: minimal header renders, case status shows, timeline shows, no sidebar.
3. Check mobile viewport in DevTools (375px wide).
4. Confirm invalid ref (e.g. `/webview/case/FAKE-000`) shows not-found card without crashing.
5. Check `dispatch.ts` log output — confirm `webview_url` appears in enriched variables for a test notification.
6. Confirm existing `/track` page and all other routes unaffected.
