# Admin Sick Proof Status Frontend Plan - 2026-06-03

## Goal

Show HR whether sick leave proof is missing or submitted in both admin application review and application history, using the existing sick proof data returned on `LeaveApplication`.

This is a frontend implementation plan only. Do not write code until the user approves this plan.

## Product Decision From Discussion

- Display a single HR-readable proof state instead of raw `required/submitted` fields.
- Show proof status in both `Time Off Request` and `History`.
- Make `Time Off Request` more action-oriented: missing proof should be easy to spot on the card.
- Make `History` more audit-oriented: proof status, upload time, and filename should remain visible but less visually loud.
- Do not add missing-proof filtering in this version.
- Do not add a proof approval flow, file version history, batch review, or large proof management page in this version.

## Existing Frontend Structure

- Admin pending review page: `app/applications/ReviewApplications.tsx`
- Pending review card: `components/applications/ReviewOfApplicationCard.tsx`
- Pending review modal: `components/applications/ReviewModal.tsx`
- Admin history page: `app/applications/History.tsx`
- History card and details modal: `components/applications/HistoryApplicationCard.tsx`
- Leave application model: `model/LeaveApplication.ts`
- API wrapper: `request/LeaveApplicationRequest.ts`
- Service wrapper: `service/ApplicationService.ts`
- Existing proof fields on `LeaveApplication`:
  - `sickProofRequired`
  - `sickProofSubmitted`
  - `sickProofUploadedAt`
  - `sickProofOriginalFilename`

## Frontend Data Model

Keep the existing `LeaveApplication` proof fields as the API source of truth.

Add a frontend-only derived proof display model inside a small helper, not as backend state:

- `kind`: `missing | submitted | not_required`
- `label`: `Proof missing | Proof submitted | Proof not required`
- `tone`: `warning | success | neutral`
- `uploadedAtText`: formatted upload time when available
- `filenameText`: shortened original filename when available
- `shouldShowOnCard`: true for sick leave, false for non-sick leave unless the page needs explicit `Proof not required`

Derivation rules:

- If `leaveType` is not `SICK` and `sickProofRequired !== true`, return `not_required`.
- If proof is required and `sickProofSubmitted === true`, return `submitted`.
- If proof is required and `sickProofSubmitted !== true`, return `missing`.
- Treat `sickProofRequired === undefined` on `SICK` as required for backward compatibility with older responses.

## Component Hierarchy

Add reusable proof display components under `components/applications/`:

- `ProofStatusBadge`
  - Owns the compact badge UI.
  - Props: derived proof display model plus `variant?: "review" | "history" | "detail"`.
  - Badge text:
    - `Proof missing`
    - `Proof submitted`
    - `Proof not required`
  - Visuals:
    - Missing: light orange background `#FFF3E0`, text `#B45309`, 6px dot `#F59E0B`.
    - Submitted: light green background `#E8F5EE`, text `#1F7A4D`, 6px dot `#22C55E`.
    - Not required: light gray background `#F3F4F6`, text `#6B7280`, 6px dot `#9CA3AF`.
  - Badge height about 24px, horizontal padding 8px, 12px medium text.

- `ProofStatusSummary`
  - Owns the detail/modal proof summary.
  - Shows the badge plus secondary fields:
    - Required/missing: `Proof required for this sick leave` and `No file uploaded yet`.
    - Submitted: upload time and original filename.
    - Not required: `No proof required for this request`.
  - Does not add file preview in this version.
  - Does not add View/Download unless backend exposes a safe file access endpoint in a later approved plan.

## Time Off Request Page Plan

Target files:

- `app/applications/ReviewApplications.tsx`
- `components/applications/ReviewOfApplicationCard.tsx`
- `components/applications/ReviewModal.tsx`

Steps:

1. Change `ReviewOfApplicationCard` props so it receives the full `LeaveApplication` instead of separate primitive props, or pass proof fields explicitly if the team wants the smallest diff. Full object is preferable because the card now displays multiple fields from the same API model.
2. Add `ProofStatusBadge` to the sick leave card near the leave type row. If there is not enough room, place it below the leave type with 8px spacing.
3. For `Proof missing` on `Time Off Request`, add a subtle 3px orange left accent on the card. Do not recolor the full card.
4. Do not add a missing-proof filter control in this version. HR sees status on each card, and filtering can be planned later if explicitly approved.
5. Add `ProofStatusSummary` near the top of `ReviewModal`, above the rejection comment form. HR should see proof status before approving or declining.
6. Keep approve/decline behavior unchanged.

Mobile/responsive behavior:

- Let the badge wrap below the leave type on narrow cards.
- Keep the button touch target unchanged.
- Keep filenames single-line with ellipsis in detail summaries.
- Avoid fixed card heights that cause text overlap.

## History Page Plan

Target files:

- `app/applications/History.tsx`
- `components/applications/HistoryApplicationCard.tsx`

Steps:

1. Keep the existing employee filter and retry/clear controls unchanged. Do not add a missing-proof filter in this version.
2. Add `ProofStatusBadge` to `HistoryApplicationCard` with lighter history treatment:
   - No orange left card accent.
   - Put the badge in metadata area near leave type/status.
3. For submitted proof, show a compact secondary line in history:
   - `Uploaded Jun 3 · filename.pdf`
   - Use small muted text.
   - Shorten long filenames.
4. Add `ProofStatusSummary` near the top of the existing History Details modal, before Comment/Reject Reason/Note.
5. Preserve existing note editing behavior.

## API Contract Expected By Frontend

Existing fields required on every `LeaveApplication` response:

```ts
interface LeaveApplication {
  id?: number;
  applicant?: string;
  leaveType?: string;
  start?: Date;
  end?: Date;
  submitTime?: Date;
  currentHandler?: string;
  status?: string;
  reason?: string;
  rejectReason?: string;
  note?: string;
  canDelete?: boolean;
  sickProofRequired?: boolean;
  sickProofSubmitted?: boolean;
  sickProofUploadedAt?: Date;
  sickProofOriginalFilename?: string;
}
```

Frontend behavior:

- Do not send a `proofStatus` query parameter in this version.
- Render proof status from each returned `LeaveApplication`.
- Keep existing pending review and history request shapes unchanged.

## Tests

Add focused Jest tests. Suggested files:

- `components/__tests__/ProofStatusBadge-test.js`
- `components/__tests__/ReviewApplicationsProofStatus-test.js`
- `components/__tests__/HistoryProofStatus-test.js`

Test cases:

- Sick leave without submitted proof shows `Proof missing`.
- Sick leave with submitted proof shows `Proof submitted`.
- Non-sick leave is neutral or hidden according to page variant.
- Time Off Request missing proof uses stronger treatment than History.
- History details modal shows proof summary above comment/note details.
- Narrow/mobile card rendering does not drop proof status or overlap text.

Focused verification command:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/ProofStatusBadge-test.js components/__tests__/ReviewApplicationsProofStatus-test.js components/__tests__/HistoryProofStatus-test.js --runInBand --watchAll=false
```

Repo-wide caveat from README:

- `npx tsc --noEmit` has known unrelated pre-existing failures in `app/applications/Regulations.tsx`, `app/setPassword.tsx`, `components/applications/ReviewModal.tsx`, and `components/FreeStyle/RequiredFormControl.tsx`. Use focused Jest for this plan unless those are cleaned up separately.

## Frontend Task Decomposition

1. Add proof status derivation helper.
2. Add `ProofStatusBadge`.
3. Add `ProofStatusSummary`.
4. Update pending review card to display proof badge.
5. Update review modal to show proof summary.
6. Update history card to show proof badge and submitted metadata.
7. Update history details modal to show proof summary.
8. Add focused Jest coverage.
9. Run focused verification and document any unrelated typecheck blockers.

## Out Of Scope

- Proof approval/rejection workflow.
- File preview inside cards.
- Proof file version history.
- Batch HR operations.
- New proof management page.
- Missing-proof filter controls or backend filter parameters.
- Backend file download/view endpoint unless explicitly approved later.
