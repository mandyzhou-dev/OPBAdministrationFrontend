# OPBOA Frontend

Expo / React Native Web frontend for the OPB administration system.

## Schedule Shift Status Display

Schedule shift cells use the existing `shift.status` value for non-active status display.

- Non-`active` shift cells directly show the status detail text in the cell:
  - `paid_sick_leave`: `Paid sick leave`
  - `unpaid_sick_leave`: `Unpaid sick leave`
  - `no_show`: `No show`
- `paid_sick_leave` keeps the existing light purple cell color.
- `unpaid_sick_leave` and `no_show` keep the existing grey cell color.
- Employee views are read-only for these states, but employees can see both the cell color and status detail text.
- Manager operation logic is unchanged, including the status dropdown, confirmation modal, and paid sick leave quota hardlock.
- API, backend, database, and SQL are unchanged for this display-only frontend update.

Related implementation files:

- `components/shift/ShiftCell.tsx`
- `constants/ShiftStatus.ts`
- `components/__tests__/ShiftCellStatusDetail-test.js`

## Cross-Stack Planning Notes

Reusable Fullstack Architect notes for Application History planning, UI scope control, API boundaries, database-change handling, and verification are captured in [plans/fullstack-architect-reusable-notes-2026-05-20.md](plans/fullstack-architect-reusable-notes-2026-05-20.md).

The same notes now include the Select Shift Form candidate availability workflow: confirm UI intent first, produce the plan before implementation, define the front/back DTO contract first, and never apply DB schema/data changes directly. If a schema change is needed, agents must give the user complete SQL to execute.

Related plan:

- [plans/select-shift-form-preference-availability-plan-2026-05-21.md](plans/select-shift-form-preference-availability-plan-2026-05-21.md)

## Frontend Knowledge Notes

- Select shift form candidate-status UI guidance is captured in [docs/feature_spec/select-shift-form-frontend-knowledge.md](docs/feature_spec/select-shift-form-frontend-knowledge.md). It covers requirement confirmation, candidate DTO semantics, row status priority, disabled selection/submit guards, label and legend design, mobile layout, and focused tests.
- Leave application DatePicker guidance is captured in [docs/feature_spec/leave-application-datepicker-frontend-knowledge.md](docs/feature_spec/leave-application-datepicker-frontend-knowledge.md), with the matching repo-local skill at `.codex/skills/opboa-leave-datepicker-workflow/SKILL.md`. It covers the Ant Design `DatePicker` / `RangePicker` + dayjs pattern, Vancouver business-date rules, sick leave availability disabling, final helper-text style, fixed test-date fixtures, and focused tests.
- Cross-stack DatePicker architecture guidance is captured in [docs/feature_spec/leave-application-datepicker-cross-stack-architecture.md](docs/feature_spec/leave-application-datepicker-cross-stack-architecture.md), with the matching repo-local skill at `.codex/skills/opb-leave-datepicker-cross-stack-architecture/SKILL.md`. It covers MAN-19 requirement evolution, normal/sick leave rules, Vancouver business-date contract, availability API, non-adopted TimePicker/start-end split direction, and final acceptance points.

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
