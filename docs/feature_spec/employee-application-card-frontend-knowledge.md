# Employee Application Card Frontend Knowledge

Date: 2026-05-28

Issue: MAN-25

This note records the employee application card interaction decisions from the MAN-25 discussion and implementation pass. Use it when updating `MyApplications` or `ApplicationCardforE`.

## Interaction Principles

- Do not show a clickable `Delete` action for application statuses that cannot be deleted.
- Replace unavailable delete actions with a lightweight status explanation, such as `Approved applications can't be deleted.`
- Keep backend delete status validation as the authoritative fallback. Frontend visibility only improves the user experience and must not be treated as a business-rule boundary.
- Unknown, missing, or empty status should default to not deletable.
- Normalize status checks with `trim().toLowerCase()` so values such as `Pending` and ` pending ` behave correctly.

## Current Delete Rules

- Deletable: `pending`, `draft`.
- Not deletable: `approved`, `rejected`, `cancelled`.
- Unknown, empty, null, or undefined status: not deletable.
- Prefer an API-provided `canDelete` when present, but keep the local status helper fallback for backward compatibility.
- All delete entry points, including card rendering and modal opening, should use the same `resolveCanDelete(application)` helper.

## Card Information Architecture

- Keep employee application cards as scannable summaries.
- Show high-priority fields on the card: leave type, dates, status badge, and a short comment preview.
- Limit card comment/reject reason text to a short preview. Do not let long text expand the card.
- Put complete `comment` and `rejectReason` content in the details modal.
- Use the card footer for the delete action or the unavailable-delete explanation. Do not place delete status copy in the middle of the content area.

## Details Entry Pattern

- Do not hide important details behind an isolated small `i` icon on the employee view.
- Employee-facing cards should use a lightweight `Details + i` entry so the affordance is clear without making the card bulky.
- Keep the details entry near the card header and preserve the modal pattern used by management history cards.
- When hidden details exist, such as long comments or a reject reason, the details entry may use a slightly stronger visual treatment.
- Tooltip-only detail access is not enough, especially on mobile.

## Details Modal

- Title: `Application Details`.
- Include full `Comment`.
- Include `Reject Reason` when present.
- Include a quiet unavailable-delete explanation for locked statuses when useful.
- Let modal body content scroll instead of expanding the card.

## Verification Snapshot

MAN-25 frontend verification from the implementation pass:

- Focused suites passed:
  - `ApplicationDeleteRules`
  - `ApplicationCardforEDeleteVisibility`
  - `MyApplicationsDeleteFlow`
- Details entry tests were added and passed.
- `git diff --check` passed after the frontend implementation pass.

Known unrelated blockers from the same pass:

- Full `jest --ci` still fails on the existing missing snapshot in `components/__tests__/StyledText-test.js`.
- `npx tsc --noEmit` still fails on unrelated existing TypeScript errors in:
  - `app/applications/Regulations.tsx`
  - `app/setPassword.tsx`
  - `components/applications/ReviewModal.tsx`
  - `components/FreeStyle/RequiredFormControl.tsx`

## Related Files

- `app/applications/MyApplications.tsx`
- `components/applications/ApplicationCardforE.tsx`
- `components/applications/applicationDeleteRules.ts`
- `model/LeaveApplication.ts`
- `request/LeaveApplicationRequest.ts`
- `plans/delete-application-visibility-cross-stack-plan-2026-05-28.md`
