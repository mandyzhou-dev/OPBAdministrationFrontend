# Frontend Plan: Schedule Mark As Personal Leave

## Scope

Add a manager-only Schedule status action: `Mark as personal leave`.

This is a planning document only. Do not implement code until the user approves the frontend/backend contract.

## Current Project Context

- Project: Expo / React Native Web frontend.
- Schedule entry route: `app/(tabs)/index.tsx` renders `components/shift/ScheduleTable.tsx`.
- Shift cells: `components/shift/ShiftCell.tsx`.
- Shift detail/action modal: `components/shift/ShiftDetailModal.tsx`.
- Shift status constants and labels: `constants/ShiftStatus.ts`.
- Shift API wrapper: `request/ShiftRequest.ts`.
- Shift service facade: `service/ShiftService.ts`.
- Shift model: `model/Shift.ts`.
- Existing manual status actions:
  - `no_show`
  - `paid_sick_leave`
  - `unpaid_sick_leave`
- Existing Schedule cell status display:
  - Non-active statuses show a status detail line in the cell.
  - `paid_sick_leave` uses light purple.
  - `no_show` and `unpaid_sick_leave` use grey.
- Existing paid sick leave has quota-specific UI and lock behavior. Personal leave should not reuse that quota logic.

## Proposed Frontend Contract

Use this new shift status value:

```ts
type ShiftStatus =
  | "active"
  | "cancelled"
  | "no_show"
  | "paid_sick_leave"
  | "unpaid_sick_leave"
  | "personal_leave";

type ManualShiftStatus =
  | "no_show"
  | "paid_sick_leave"
  | "unpaid_sick_leave"
  | "personal_leave";
```

Label mapping:

```ts
personal_leave: "Personal leave"
```

Manager dropdown option:

```ts
{ label: "Mark as personal leave", value: "personal_leave" }
```

Important naming note: the employee leave application form currently uses `personalleave` as a leave application type. This plan intentionally uses `personal_leave` for shift status because existing manual shift status values use snake_case. Do not rename the leave application type in this task.

## Frontend Interaction

Location:

- Schedule tab -> click an editable shift cell -> `ShiftDetailModal`.
- Add `Mark as personal leave` to the same status action dropdown that already contains no-show and sick-leave actions.

Behavior:

- Visible only in the existing manager status action section.
- Select action -> open existing confirmation dialog.
- Confirmation copy:

```text
Mark {employeeName} shift on {YYYY-MM-DD} as Personal leave?
```

- On confirm, call the existing status update path:

```http
PATCH {EXPO_PUBLIC_API_URL}api/shift/shiftarrangement/{shiftId}/status
Content-Type: application/json

{
  "status": "personal_leave",
  "operatorUsername": "<current logged-in username>"
}
```

- On success, close modal and refresh Schedule via the existing `onClose` / `onUpdated` path.
- On failure, keep current failure behavior: show alert title `Status update failed` and use backend `message`/`error` when available.

## Visual Display

Add `personal_leave` to status display:

- `SHIFT_STATUS_LABELS.personal_leave = "Personal leave"`.
- `normalizeShiftStatus` must preserve `personal_leave`; unknown values still fall back to `active`.
- `NON_WORKED_SHIFT_STATUSES` should include `personal_leave`.
- `ShiftCell` should show the status detail line for `personal_leave`, the same way it does for `paid_sick_leave`, `unpaid_sick_leave`, and `no_show`.

Required color:

```ts
SHIFT_STATUS_COLORS.personal_leave = "#9CA3AF";
SHIFT_STATUS_TEXT_COLORS.personal_leave = "#111827";
```

Rationale: product decision is to use the same grey treatment as `no_show`, keeping personal leave aligned with the existing non-paid/non-worked Schedule status styling.

## Mobile Responsiveness

- Do not add new cards or large explanatory text.
- Reuse the existing Select and AlertDialog so mobile behavior stays consistent.
- Ensure the new label can wrap or fit inside the existing select item and confirmation dialog.
- In Schedule cells, keep the status detail as the existing small `BadgeText` line; avoid adding a wider pill that would stretch the cell.

## Error Handling

Expected backend errors:

- `400 INVALID_SHIFT_REQUEST`: status is not an allowed manual target.
- `403`: operator is not a manager.
- `404`: shift was not found.
- Generic network/request error.

Frontend handling:

- Keep the modal open on failed update.
- Show existing alert fallback: `Failed to update shift status. Please try again.`
- Prefer backend `message` when present.
- No frontend quota check for `personal_leave`.

## Frontend Files To Change After Approval

- `constants/ShiftStatus.ts`
  - Add `personal_leave` to `ShiftStatus`.
  - Add `personal_leave` to `ManualShiftStatus`.
  - Add label, dropdown option, non-worked list, color, text color.
  - Preserve value in `normalizeShiftStatus`.
- `components/shift/ShiftCell.tsx`
  - Include `personal_leave` in `showStatusDetail`.
- `components/shift/ShiftDetailModal.tsx`
  - No structural change expected if `MANUAL_SHIFT_STATUS_OPTIONS` drives the dropdown.
  - Confirm that paid sick leave locking remains scoped only to `paid_sick_leave`.
- `request/ShiftRequest.ts`
  - Type update only through `ManualShiftStatus`; endpoint shape remains unchanged.
- `service/ShiftService.ts`
  - Type update only through `ManualShiftStatus`; endpoint shape remains unchanged.

## Frontend Tests

Update or add focused Jest tests:

- `components/__tests__/ShiftStatus-test.js`
  - Manual actions include `personal_leave`.
  - Non-worked statuses include `personal_leave`.
  - Personal leave color/text color are defined.
  - Paid sick leave quota lock still applies only to `paid_sick_leave`.
- `components/__tests__/ShiftCellStatusDetail-test.js`
  - Shift cell renders `Personal leave` detail for `personal_leave`.
- If feasible, add/extend a modal test to verify selecting `personal_leave` calls `updateShiftStatus(id, "personal_leave", username)` without quota gating.

Suggested focused verification:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest --runInBand --watchAll=false components/__tests__/ShiftStatus-test.js components/__tests__/ShiftCellStatusDetail-test.js
```

Known repo context from README: repo-wide TypeScript checks may have unrelated existing failures. Use focused Jest for this scoped change unless those unrelated type errors are cleaned up.

## Dependencies On Backend

Frontend implementation should wait for Backend_Dev to accept and return `personal_leave` through:

- `PATCH /api/shift/shiftarrangement/{id}/status`
- Schedule presentation queries used by:
  - `GET /api/presentor/shift/{username}/findVisibleShifts`
  - `GET /api/presentor/shift/{username}/getMyShiftByStartDateScope`

If backend accepts the PATCH but does not include `personal_leave` in presentation query filters, marked shifts may disappear from the Schedule UI.

## Database Impact

No frontend database change.

Cross-stack database conclusion: no required table, column, constraint, or data migration is needed because shift status is already stored in `opb_shift_arrangement.status` as `varchar(32)`.
