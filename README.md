# OPBOA Frontend

Expo / React Native Web frontend for the OPB administration system.

## Schedule Shift Status Display

Schedule shift cells use the existing `shift.status` value for non-active status display and Manager-only manual status actions.

- Manual Schedule status targets currently include:
  - `no_show`: `Mark as no show`
  - `paid_sick_leave`: `Mark as paid sick leave`
  - `unpaid_sick_leave`: `Mark as unpaid sick leave`
  - `personal_leave`: `Mark as personal leave`
- The manager dropdown is rendered in `ShiftDetailModal` only when `useAuth().isManager === true`.
- Selecting a manual status opens the existing confirmation dialog and then reuses `PATCH /api/shift/shiftarrangement/{id}/status` after confirmation.
- Non-`active` shift cells directly show the status detail text in the cell:
  - `paid_sick_leave`: `Paid sick leave`
  - `unpaid_sick_leave`: `Unpaid sick leave`
  - `no_show`: `No show`
  - `personal_leave`: `Personal leave`
- `paid_sick_leave` keeps the existing light purple cell color.
- `unpaid_sick_leave`, `no_show`, and `personal_leave` use the grey cell treatment:
  - Background: `#9CA3AF`
  - Text: `#111827`
- Employee views are read-only for these states, but employees can see both the cell color and status detail text.
- Paid sick leave quota and option hardlock apply only to `paid_sick_leave`. Do not reuse quota/probation locking for `personal_leave`, `no_show`, or `unpaid_sick_leave`.
- `personal_leave` intentionally uses snake_case as a shift status. Do not confuse it with employee leave application type values such as `personalleave`.
- API shape, backend database schema, and SQL are unchanged for the frontend status addition.

Related implementation files:

- `components/shift/ShiftCell.tsx`
- `components/shift/ShiftDetailModal.tsx`
- `constants/ShiftStatus.ts`
- `request/ShiftRequest.ts`
- `service/ShiftService.ts`
- `components/__tests__/ShiftStatus-test.js`
- `components/__tests__/ShiftCellStatusDetail-test.js`

Effective focused verification command for manual Schedule statuses:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest --runInBand --watchAll=false components/__tests__/ShiftStatus-test.js components/__tests__/ShiftCellStatusDetail-test.js
```

Known typecheck caveat as of the `personal_leave` frontend pass: `npx tsc --noEmit` still fails on unrelated pre-existing errors in `app/applications/Regulations.tsx`, `app/setPassword.tsx`, and `components/FreeStyle/RequiredFormControl.tsx`. Use focused Jest for this flow until the repo-wide TypeScript blockers are cleaned up.

## Cross-Stack Planning Notes

Reusable Fullstack Architect notes for Application History planning, UI scope control, API boundaries, database-change handling, and verification are captured in [plans/fullstack-architect-reusable-notes-2026-05-20.md](plans/fullstack-architect-reusable-notes-2026-05-20.md).

The same notes now include the Select Shift Form candidate availability workflow: confirm UI intent first, produce the plan before implementation, define the front/back DTO contract first, and never apply DB schema/data changes directly. If a schema change is needed, agents must give the user complete SQL to execute.

The same notes also include the sick leave proof upload planning lessons: future cross-stack plans must separate `Backend Plan`, `Frontend Plan`, `API Contract`, `DB Change Required`, cross-module email/file-upload behavior, and separate Backend_Dev / Frontend_Dev task lists. UI details belong in the frontend/UI section, and database SQL must be complete and user-executed when schema or data changes are required.

The same notes also include MAN-36 Schedule `personal_leave` lessons: keep the status naming contract explicit, update backend presentation query allow-lists for every visible status, scope paid sick leave quota only to `paid_sick_leave`, state the no-DB-change conclusion, and record final color decisions after product review.

Related plan:

- [plans/select-shift-form-preference-availability-plan-2026-05-21.md](plans/select-shift-form-preference-availability-plan-2026-05-21.md)
- [plans/sick-leave-proof-upload-cross-stack-plan-2026-06-01.md](plans/sick-leave-proof-upload-cross-stack-plan-2026-06-01.md)
- [plans/mark-as-personal-leave-frontend-plan-2026-06-18.md](plans/mark-as-personal-leave-frontend-plan-2026-06-18.md)
- [docs/feature_spec/shift-status-paid-sick-leave-cross-stack.md](docs/feature_spec/shift-status-paid-sick-leave-cross-stack.md)

## Frontend Knowledge Notes

- Select shift form candidate-status UI guidance is captured in [docs/feature_spec/select-shift-form-frontend-knowledge.md](docs/feature_spec/select-shift-form-frontend-knowledge.md). It covers requirement confirmation, candidate DTO semantics, row status priority, disabled selection/submit guards, label and legend design, mobile layout, and focused tests.
- Leave application DatePicker guidance is captured in [docs/feature_spec/leave-application-datepicker-frontend-knowledge.md](docs/feature_spec/leave-application-datepicker-frontend-knowledge.md), with the matching repo-local skill at `.codex/skills/opboa-leave-datepicker-workflow/SKILL.md`. It covers the Ant Design `DatePicker` / `RangePicker` + dayjs pattern, Vancouver business-date rules, sick leave availability disabling, final helper-text style, fixed test-date fixtures, and focused tests.
- Cross-stack DatePicker architecture guidance is captured in [docs/feature_spec/leave-application-datepicker-cross-stack-architecture.md](docs/feature_spec/leave-application-datepicker-cross-stack-architecture.md), with the matching repo-local skill at `.codex/skills/opb-leave-datepicker-cross-stack-architecture/SKILL.md`. It covers MAN-19 requirement evolution, normal/sick leave rules, Vancouver business-date contract, availability API, non-adopted TimePicker/start-end split direction, and final acceptance points.
- Employee application card guidance is captured in [docs/feature_spec/employee-application-card-frontend-knowledge.md](docs/feature_spec/employee-application-card-frontend-knowledge.md). It covers MAN-25 delete visibility rules, the `Details + i` details-entry pattern, summary-card vs details-modal content split, backend delete validation as the required fallback, focused verification, and known unrelated blockers.
- Review comment migration guidance is captured in [docs/feature_spec/review-comment-frontend-knowledge.md](docs/feature_spec/review-comment-frontend-knowledge.md). It covers the `rejectReason -> reviewComment` frontend contract, approve/decline JSON payloads, ReviewModal submit/error behavior, My Applications and History display rules, identity-parameter no-trim constraints, and focused verification.
- Schedule manual status guidance is captured in [docs/patch_doc/shift-status-paid-sick-leave-frontend.md](docs/patch_doc/shift-status-paid-sick-leave-frontend.md). It covers the manager status dropdown, `personal_leave`, cell detail display, status colors, paid sick leave quota boundaries, API payload, browser checks, focused Jest command, and known TypeScript caveat.

### Review Comment Migration

Leave application decisions use neutral `reviewComment` semantics. The frontend no longer reads or writes `rejectReason`.

- Model/API: `LeaveApplication` uses `reviewComment?: string`. `permitReview(id, reviewComment?)` and `rejectReview(id, reviewComment)` send JSON request bodies to the backend.
- Approve: review comment is optional. Trim only the comment for blank detection; whitespace-only comments are omitted from the JSON body.
- Decline: review comment is required. Trim only the comment for blank validation before sending `{ reviewComment }`.
- ReviewModal: await the approve/decline request before closing or refreshing. Disable decision buttons while submitting. On failure, keep the modal open, preserve the typed comment, and show a concise error.
- Display: My Applications and History show `Review Comment` for approved and rejected applications. Details entry visibility must use `reviewComment` so approved records with comments have an obvious details path.
- Identity values: do not trim or normalize `user.username`, `application.applicant`, sick-proof applicant values, `employeeUsername`, or other identity/query parameters. Preserve trailing-space usernames such as `Harsimranjit Kaur ` exactly.

Effective focused verification command:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/ApplicationCardforEDeleteVisibility-test.js components/__tests__/HistoryApplicationCardSummary-test.js components/__tests__/ApplicationHistoryRequest-test.js components/__tests__/ReviewModal-test.js --runInBand --watchAll=false
```

### Leave Application DatePicker

The employee leave form uses Ant Design date controls for leave dates:

- One-day leave uses `DatePicker`; range leave uses `DatePicker.RangePicker`.
- Date state should stay as `Dayjs | null` or `[Dayjs | null, Dayjs | null] | null`; backend eligibility requests use date-only `YYYY-MM-DD`.
- `America/Vancouver` is the business-date zone. Dates before Vancouver today are disabled; Vancouver today is selectable.
- Normal leave only applies the past-date rule.
- `SICK` leave also uses `GET /api/process/application/leave-date-availability?applicant=<username>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>` and disables dates whose `scheduled` value is not `true`.
- Submit-time frontend validation must re-check sick leave selections against the availability map and refetch the exact selected range if the loaded map is missing or stale.
- Fixed dates such as `2026-05-27` in Jest tests are deterministic fixtures for request/availability assertions; production dates are computed dynamically from Vancouver today.
- Time remains the original manual one-day range input. Do not replace it with a TimePicker and do not split it into start/end inputs. The label is `Time`; helper text under the input is `Format: HHmm-HHmm`.
- Sick leave availability text belongs under the date field as small helper text, not as a separate row/card.

Effective focused verification command:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.tmp/jest npx jest components/__tests__/NewApplicationHelperText-test.js components/__tests__/LeaveDateAvailabilityRules-test.js components/__tests__/ApplicationHistoryRequest-test.js --runInBand
```

### Copy Shifts And Statutory Holidays

Reusable frontend guidance for the copy-shifts statutory holiday flow is captured in [plans/copy-shifts-statutory-holiday-frontend-plan-2026-05-26.md](plans/copy-shifts-statutory-holiday-frontend-plan-2026-05-26.md).

- The copy modal is a UX layer only: it may warn, preview, and show result feedback, but final statutory holiday enforcement must remain backend-authoritative.
- Keep the copy request shape compatible. The frontend should continue sending the existing week-level request and tolerate an optional `skippedDetails` response field.
- Target Week statutory holiday feedback belongs inline inside the Target Week section, under the date picker and above the `To:` date. Do not add a separate large card or disable the whole target week.
- Inline warning style should stay lightweight: amber background/border/text, compact padding, `6px` border radius, and copy that includes holiday name plus `YYYY-MM-DD` when available.
- If the copy response includes `skippedDetails` with `reason: "STATUTORY_HOLIDAY"`, keep the modal open and show a persistent compact grouped summary by `targetDate`. Do not rely only on a short toast for partial success.
- If no statutory holiday skipped details are returned, preserve the existing auto-close plus success toast behavior.
- Normalize date-only comparisons to `YYYY-MM-DD` strings and memoize target-week holiday/skipped-detail derivations. Avoid render-time browser-local `Date` comparisons for this flow.
- Copy loading button width should remain stable, using at least `minWidth: 72px`.

Effective verification command for this change:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest --runInBand --watchAll=false components/__tests__/CopyDialogModalStatutoryHoliday-test.js components/__tests__/SelectShiftFormCandidateState-test.js components/__tests__/ShiftCellStatusDetail-test.js
```

Known typecheck caveat as of 2026-05-26: `npx tsc --noEmit` fails on unrelated pre-existing errors in `app/applications/Regulations.tsx`, `app/setPassword.tsx`, `components/applications/ReviewModal.tsx`, and `components/FreeStyle/RequiredFormControl.tsx`. The copy-modal files were not listed in those typecheck errors during the MAN-18 verification pass.

### Sick Leave Proof Upload

Reusable frontend guidance for sick leave proof upload:

- Keep proof submission visible inside the employee application card. The proof strip belongs below the application status pill and above the comment summary, not in the details modal or card footer.
- Use two clear proof states on sick leave cards:
  - Required: show a compact amber proof strip with `Proof required` and the current required prompt.
  - Submitted: show a compact green proof strip with `Proof submitted`, the uploaded filename when available, and a reupload action.
- Do not hide the upload entry after submission. The same card must continue offering `Upload again` so employees can replace proof without admin intervention.
- Keep the card copy compact. The helper text should stay short, for example `PDF or image files up to 10 MB.`; detailed accepted MIME/extension handling belongs in the file input and validation code.
- Use a browser file input for the current React Native Web implementation. The hidden input should use web-safe `data-testid` selectors, not React Native `testID`, because Gluestack / React Web may pass unknown props to DOM and trigger console warnings.
- Build the request with `FormData`: append the selected file as `proof` and the current logged-in username as `applicant`, then post to `api/process/application/{id}/sick-proof`.
- Validate before upload when possible: allow PDF and common image formats, reject unsupported files inline, and keep the frontend 10 MB limit aligned with the backend.
- After a successful upload, use the backend response as the source of truth. Replace the matching card with the returned updated `LeaveApplication` instead of guessing local proof state.
- Keep `LeaveApplication` model fields aligned with the backend contract: `sickProofRequired`, `sickProofSubmitted`, `sickProofUploadedAt`, and `sickProofOriginalFilename`.
- For mobile or narrow cards, let the proof strip wrap naturally: the text group and upload button may stack, the button should remain touch-friendly, and long filenames should stay single-line with middle ellipsis where supported.
- Keep success feedback lightweight. A short success alert/toast is fine, but the card itself must immediately switch to the submitted state.

Related implementation files:

- `components/applications/ApplicationCardforE.tsx`
- `app/applications/MyApplications.tsx`
- `request/LeaveApplicationRequest.ts`
- `service/ApplicationService.ts`
- `model/LeaveApplication.ts`

Effective verification command for this flow:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/ApplicationCardforESickProof-test.js components/__tests__/ApplicationCardforEDeleteVisibility-test.js components/__tests__/MyApplicationsSickProofFlow-test.js components/__tests__/MyApplicationsDeleteFlow-test.js components/__tests__/LeaveApplicationSickProofRequest-test.js --runInBand --watchAll=false
```

Known typecheck caveat as of 2026-06-03: `npx tsc --noEmit` still fails on unrelated pre-existing errors in `app/applications/Regulations.tsx`, `app/setPassword.tsx`, `components/applications/ReviewModal.tsx`, and `components/FreeStyle/RequiredFormControl.tsx`. Use focused Jest verification for this frontend flow until those repo-wide type issues are cleaned up.
