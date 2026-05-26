# Copy Shifts Statutory Holiday Frontend Plan

Date: 2026-05-26

Issue: MAN-18, "Fix copy shifts inserting assignments on statutory holidays"

Scope: frontend plan only. No implementation until approved.

## Why This Is Split From Backend

The previous plan was written as one cross-stack plan because the bug crosses the frontend/backend boundary: the UI starts the copy flow, but the illegal insert happens in backend persistence. That made a single API contract discussion useful, but it was not ideal for handoff because frontend and backend developers need separate responsibility lists and test targets.

This frontend plan is now separated from the backend plan. It intentionally treats backend validation as authoritative and focuses on manager-facing warning, partial-success feedback, TypeScript response modeling, and responsive modal behavior.

Backend companion plan:

- `/Users/marktwain/Projects/OPBAdministrationBackend/plans/copy-shifts-statutory-holiday-backend-plan-2026-05-26.md`

## Current Frontend Context

Relevant files:

- `components/shift/CopyDialogModal.tsx`
- `service/ShiftService.ts`
- `request/ShiftRequest.ts`
- `model/CopyStatus.ts`
- `service/StatutoryHolidayService.ts`
- `request/StatutoryHolidayRequest.ts`
- `model/StatutoryHoliday.ts`
- Existing statutory holiday usage examples:
  - `components/shift/SelectShiftForm.tsx`
  - `components/shift/ScheduleTable.tsx`
  - `app/applications/MyPreferShift.tsx`

Current copy flow:

1. `CopyDialogModal` receives `srcWeekStart`.
2. The manager selects a target Sunday after the source week.
3. `copyWeekScheduleTo(groupName, srcWeekStart, dstWeekStart)` calls `ShiftRequest.copyWeekSchedule(...)`.
4. `ShiftRequest` posts `POST /api/shift/preset` with `groupName`, `srcWeekStart`, `tgtWeekStart`, and `mode: "SKIP"`.
5. The modal closes immediately after success and shows a short toast with `created` and `skipped`.

Current frontend gap: the copy modal does not fetch statutory holidays, warn about holidays inside the selected target week, or show persistent detail when backend skips holiday shifts.

## Frontend Responsibility

Frontend is responsible for UX and transparency only:

- Warn the manager when the selected target week contains statutory holiday dates.
- Keep the target week selectable; do not disable the whole week.
- Submit the same week-level request to the backend.
- Display backend `skippedDetails` in a persistent modal result when statutory holiday skips occur.
- Preserve existing success/error behavior when there are no holiday skips.

Frontend is not responsible for enforcing the invariant. It must not filter copied shifts client-side or assume a warning prevents illegal inserts. The backend remains the source of truth.

## API Interaction Contract

### Existing request, unchanged

Keep `ShiftRequest.copyWeekSchedule(...)` request shape unchanged:

```http
POST /api/shift/preset
Content-Type: application/json
```

```json
{
  "groupName": "surrey",
  "srcWeekStart": "2026-05-17",
  "tgtWeekStart": "2026-05-24",
  "mode": "SKIP"
}
```

No frontend request field is added.

### Response consumed by frontend

Continue reading existing fields:

```ts
created?: number;
skipped?: number;
overwritten?: number;
```

Add optional skipped detail support:

```ts
export interface CopySkippedShift {
  username?: string;
  groupName?: string;
  sourceDate?: string;
  targetDate?: string;
  reason?: "STATUTORY_HOLIDAY" | string;
  message?: string;
}

export class CopyStatus {
  created: number | undefined;
  skipped: number | undefined;
  overwritten: number | undefined;
  skippedDetails?: CopySkippedShift[];
}
```

Expected partial-success response:

```json
{
  "created": 8,
  "skipped": 2,
  "overwritten": 0,
  "skippedDetails": [
    {
      "username": "alice",
      "groupName": "surrey",
      "sourceDate": "2026-05-18",
      "targetDate": "2026-05-25",
      "reason": "STATUTORY_HOLIDAY",
      "message": "Skipped because 2026-05-25 is a statutory holiday."
    }
  ]
}
```

Frontend must tolerate `skippedDetails` being missing, null, or an empty array for backward compatibility while backend and frontend are deployed independently.

## Component Plan

### `model/CopyStatus.ts`

Add `CopySkippedShift` and optional `skippedDetails`.

Keep the existing `CopyStatus` class shape to avoid unnecessary caller churn.

### `CopyDialogModal.tsx`

State additions:

- `statutoryHolidays`: fetched holiday DTOs from `getStatutoryHoliday()`.
- `copyResult`: `CopyStatus | null`, used only after successful copy with holiday skips.
- `showPartialResult`: derived from `copyResult?.skippedDetails`.

Derived values:

- Normalize all statutory holidays to `YYYY-MM-DD` strings once.
- Memoize `targetWeekHolidays` from `dstWeekStart` through `dstWeekStart.add(6, "day")`.
- Use string comparison for date-only checks; do not repeatedly call `dayjs(date).isSame(...)` inside render.

Submission behavior:

- Before request: clear stale result and error state.
- On success with no `STATUTORY_HOLIDAY` skips: preserve existing behavior, close modal and show toast.
- On success with one or more `STATUTORY_HOLIDAY` skips: keep modal open and show a persistent compact result in the modal body. Do not rely on a 3000ms toast for partial success.
- On existing backend errors (`INVALID_SCHEDULE_RANGE`, `SHIFT_ALREADY_EXISTS`): preserve current error alert behavior.

### Warning Placement And Styling

Place target-week warning inside the existing Target Week card:

- Under the `DatePicker`.
- Above the `To:` date line.
- Do not add a fourth standalone Card.

Use a lightweight inline alert:

- Background: `#FFFBEB`
- Border: `#F59E0B`
- Text: `#92400E`
- Padding: `10-12px`
- Border radius: `6px`
- Margin top: `8px`

Warning copy:

```text
Target week includes statutory holiday(s): Victoria Day (2026-05-18). Copied shifts on those dates will be skipped.
```

If `holidayName` is missing, fall back to the date only:

```text
Target week includes statutory holiday(s): 2026-05-18. Copied shifts on those dates will be skipped.
```

For multiple holidays, join compactly:

```text
Target week includes statutory holiday(s): Victoria Day (2026-05-18), Canada Day (2026-07-01). Copied shifts on those dates will be skipped.
```

### Partial-Success Result UI

When backend returns `skippedDetails` with reason `STATUTORY_HOLIDAY`, display a persistent result inside the modal body.

Summary copy:

```text
Created 8 shifts. Skipped 2 on statutory holiday(s).
```

If all candidates were skipped:

```text
No shifts were created. Skipped 3 on statutory holiday(s).
```

Group details by `targetDate` and keep it compact:

```text
2026-05-25 · 2 shifts skipped
```

Do not render a wide table in the modal. The modal must remain readable on mobile widths.

Close behavior:

- For partial success, the manager manually closes the modal after reading the result.
- For full success with no holiday skips, keep the existing auto-close plus toast flow.

### Button And Responsive Behavior

- Keep existing footer button arrangement.
- Add stable Copy button width while loading; use `minWidth: 72px` so Spinner replacement does not resize the button.
- Keep warning and result text wrapping naturally for mobile.
- Avoid placing warnings near the footer where they compete with error/success state.

## Edge Cases

### Target week has one or more statutory holidays

Show warning for distinct holiday dates in the selected target week. The week remains selectable because only copied shifts landing on those dates will be skipped.

### Source shifts on normal days copied onto holidays

Frontend sends the same request. Backend skips illegal target holiday candidates and returns `skippedDetails`. Frontend shows persistent partial-success detail.

### Multiple holidays in target week

Warning lists each distinct holiday name/date. Result groups skipped shifts by target date, not by employee.

### Partial-week copy

The copy flow remains week-level. If the source week has shifts on only some days, only generated target candidates can be skipped. Frontend warning still describes holidays in the target week because it cannot know which source shifts map to those dates without backend logic.

### Timezone/date-only handling

- Request dates remain `YYYY-MM-DD`.
- Target-week warning uses `YYYY-MM-DD` strings.
- `skippedDetails[].targetDate` is treated as date-only text.
- Do not compare statutory holidays against browser-local Date objects in render.

### Existing backend hard errors

If backend throws `INVALID_SCHEDULE_RANGE` or `SHIFT_ALREADY_EXISTS`, keep the current error alert path and do not show partial-success UI.

## Frontend Test Plan

Add or extend a focused copy modal test file under `components/__tests__`.

Test cases:

1. Fetching statutory holidays and selecting a target week with a holiday shows the inline warning inside the Target Week section.
2. A holiday outside the selected target week does not show the warning.
3. Warning copy includes `holidayName` plus `YYYY-MM-DD` when `holidayName` exists.
4. Warning copy falls back to date only when `holidayName` is missing.
5. Successful response without `STATUTORY_HOLIDAY` skipped details closes the modal and shows the existing toast behavior.
6. Successful response with `STATUTORY_HOLIDAY` skipped details keeps the modal open and shows the persistent summary.
7. Multiple skipped details on the same target date render as one grouped line with the correct skipped count.
8. `INVALID_SCHEDULE_RANGE` and `SHIFT_ALREADY_EXISTS` still show the existing error alert.
9. Copy button remains disabled while request is pending.

Recommended command after implementation:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest --runInBand --watchAll=false components/__tests__/CopyDialogModalStatutoryHoliday-test.js
```

If the new tests share helpers with existing shift tests, also run:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest --runInBand --watchAll=false components/__tests__/SelectShiftFormCandidateState-test.js components/__tests__/ShiftCellStatusDetail-test.js
```

## Database Impact

Frontend changes require no database table, field, constraint, data migration, or SQL.

The frontend only consumes existing holiday data from `GET /api/shift/statutory-holidays` and new optional response detail from `POST /api/shift/preset`.
