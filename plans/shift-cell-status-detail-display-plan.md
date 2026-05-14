# Frontend Plan: Shift Cell Status Detail Display

Date: 2026-05-14

Project directory: `/Users/marktwain/Projects/OPBOA`

Current phase: planning only. Do not write feature code, do not change backend code, and do not change the database.

## 1. Confirmed Scope

The approved UI change is limited to the Schedule shift cell display:

- For non-`active` schedule cells, show a small status detail label inside the cell.
- `paid_sick_leave` displays `Paid sick leave` and keeps the existing pale purple background.
- `unpaid_sick_leave` displays `Unpaid sick leave` and keeps the existing grey background.
- `no_show` displays `No show` and keeps the existing grey background.
- Manager status dropdown, confirmation modal, paid sick leave quota hardlock, and status update API behavior stay unchanged.
- Employee view remains read-only: employees can see the color and status text, but cannot operate status controls.
- No hover tooltip is required as the primary explanation because narrow/mobile screens do not support hover reliably.

## 2. Existing Frontend Context

Relevant files:

- `components/shift/ShiftCell.tsx`
- `components/shift/ShiftDetailModal.tsx`
- `constants/ShiftStatus.ts`
- `model/Shift.ts`
- `components/__tests__/ShiftStatus-test.js`
- `docs/patch_doc/shift-status-paid-sick-leave-frontend.md`
- `docs/feature_spec/shift-status-paid-sick-leave-cross-stack.md`

Current behavior observed from code:

- `ShiftCell.tsx` already reads `workerShift?.status`, normalizes it with `normalizeShiftStatus()`, and applies `SHIFT_STATUS_COLORS` / `SHIFT_STATUS_TEXT_COLORS` to the Gluestack `Badge`.
- `constants/ShiftStatus.ts` already contains the display labels in `SHIFT_STATUS_LABELS`:
  - `no_show` -> `No show`
  - `paid_sick_leave` -> `Paid sick leave`
  - `unpaid_sick_leave` -> `Unpaid sick leave`
- `ShiftDetailModal.tsx` already owns Manager-only status changes, confirmation dialog flow, quota loading, and hardlock behavior.
- This follow-up only needs `ShiftCell` display changes and focused test coverage.

## 3. Minimal Implementation Approach

### 3.1 ShiftCell Display

Update `components/shift/ShiftCell.tsx` so each rendered shift badge computes whether a status detail should be shown:

```ts
const showStatusDetail =
  shiftStatus === "paid_sick_leave" ||
  shiftStatus === "unpaid_sick_leave" ||
  shiftStatus === "no_show";
```

When `showStatusDetail` is true, render a third line inside the existing `VStack` using `SHIFT_STATUS_LABELS[shiftStatus]`.

Recommended layout:

- Keep the existing name line.
- Keep the existing time line.
- Add a compact status line below the time line.
- Use `BadgeText` or existing Gluestack `Text` styling consistent with current cell content.
- Use the existing `statusTextColor` so text contrast remains aligned with the grey/purple backgrounds.

Do not add a new tooltip or external legend for this scope.

### 3.2 Desktop and Narrow Cell Behavior

The status detail should be readable without reshaping the whole schedule grid:

- Use smaller text than the name/time text, for example Gluestack `size="xs"` if supported by the chosen text component.
- Prefer a one-line label on desktop-width cells.
- Allow wrapping on narrow cells by avoiding strict `numberOfLines={1}` or ellipsis-only behavior for the status line.
- Keep the label inside the existing badge/cell, not in an overlay.
- If height is tight, increase the badge height slightly only as much as needed for three compact lines. Avoid changing table structure or ScheduleTable data flow.

Suggested style direction:

```tsx
{showStatusDetail && (
  <BadgeText
    size="xs"
    style={[
      statusTextColor ? { color: statusTextColor } : undefined,
      { fontWeight: "600", lineHeight: 14 }
    ]}
  >
    {SHIFT_STATUS_LABELS[shiftStatus]}
  </BadgeText>
)}
```

Exact syntax should follow the project's Gluestack/React Native Web style conventions during implementation.

### 3.3 Permission Behavior

Do not add new permission logic.

- The status detail is display-only and should be visible to Manager, team leader, and employee views.
- Existing `canEdit` behavior in `ShiftCell` can continue controlling whether clicking opens `ShiftDetailModal`.
- Existing `isManager` behavior in `ShiftDetailModal` must continue controlling whether status mutation controls are shown.

### 3.4 Reuse Existing Constants

Use existing `constants/ShiftStatus.ts` exports:

- `normalizeShiftStatus`
- `SHIFT_STATUS_COLORS`
- `SHIFT_STATUS_TEXT_COLORS`
- `SHIFT_STATUS_LABELS`

No new status values are needed.

## 4. Components and Data Flow

No data flow changes are required.

```text
ScheduleTable
  -> passes workers and shifts map to ShiftCell
ShiftCell
  -> reads shift.status from existing Shift model
  -> normalizes status
  -> applies existing color constants
  -> renders existing name/time plus new status detail text for selected non-active statuses
ShiftDetailModal
  -> unchanged Manager-only status mutation flow
```

The existing backend schedule response already includes `status`; this plan does not require new request fields, response fields, services, repositories, or DTOs.

## 5. Testing and Verification Plan

Focused automated test updates:

- Extend `components/__tests__/ShiftStatus-test.js` to assert the three display labels remain:
  - `No show`
  - `Paid sick leave`
  - `Unpaid sick leave`
- If the existing test setup can render `ShiftCell` cheaply, add a small render test that verifies a `paid_sick_leave` shift exposes `Paid sick leave` text. If rendering `ShiftCell` requires too much setup, keep the focused constants test and verify UI manually.

Manual UI checks:

1. Manager view:
   - Open Schedule.
   - Confirm `paid_sick_leave` cells show pale purple plus `Paid sick leave`.
   - Confirm `unpaid_sick_leave` cells show grey plus `Unpaid sick leave`.
   - Confirm `no_show` cells show grey plus `No show`.
   - Confirm the existing status dropdown, confirmation modal, and quota hardlock behavior still work.
2. Employee view:
   - Confirm the same color and status text are visible.
   - Confirm status controls are not available.
3. Narrow/mobile viewport:
   - Confirm the status label remains inside the cell.
   - Confirm one-line display is used when space allows and wrapping is acceptable when the cell is narrow.
   - Confirm no hover-only explanation is required to understand the cell.

Suggested commands after implementation:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest --runTestsByPath components/__tests__/ShiftStatus-test.js --runInBand --watchAll=false
TMPDIR=/Users/marktwain/Projects/OPBOA/.expo-tmp EXPO_METRO_CACHE_DIRECTORY=/Users/marktwain/Projects/OPBOA/.metro-cache npx expo export --platform web --output-dir .expo-build-test
git diff --check -- components/shift/ShiftCell.tsx components/__tests__/ShiftStatus-test.js
```

`npx tsc --noEmit` is known from prior documentation to have unrelated existing failures in untouched files, so it can be run for awareness but should not be the primary pass/fail gate for this small UI follow-up unless those existing failures have been resolved.

## 6. Backend and SQL Assessment

Backend change required: no.

SQL required: no.

Reason:

- The existing frontend already receives and uses `shift.status`.
- The existing constants already define labels and colors for the requested statuses.
- The existing Manager mutation flow, confirmation modal, quota hardlock, and APIs remain unchanged.
- This plan only adds display text in the existing `ShiftCell` rendering path.

If an implementation pass discovers that some schedule API response path omits `status`, stop and report that as a backend data contract issue before changing backend code. Based on the current documented and implemented shift-status work, no backend or database change is expected.

## 7. Risks and Notes

- Cell height may need a small adjustment because the badge currently shows name and time only. Keep any height change local to `ShiftCell` and avoid restructuring `ScheduleTable`.
- Grey is shared by `no_show` and `unpaid_sick_leave`; the new text label is the primary distinction between those two states.
- Do not display labels for `active`; active cells should remain visually focused on employee and time.
- `cancelled` is outside the user's requested labels for this follow-up. Leave existing cancelled display behavior unchanged unless the PM/user explicitly expands the scope.
