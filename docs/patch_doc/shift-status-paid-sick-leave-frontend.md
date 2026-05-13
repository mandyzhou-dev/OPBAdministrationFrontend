# Shift Status and Paid Sick Leave Frontend Notes

Date: 2026-05-13

This document records the frontend decisions and verification notes for the Schedule shift status / paid sick leave change. It is a handoff document for future OPBOA frontend work; it does not define new business scope.

---

## 1. Scope

The change adds Manager-only status operations to the existing Schedule shift detail flow:

- Mark as no show.
- Mark as paid sick leave.
- Mark as unpaid sick leave.

The frontend must not expose a Reset status / Mark as active action. If reset is needed later, it should be treated as a new product decision and implemented with backend support.

---

## 2. Key Files

- `components/shift/ScheduleTable.tsx`
- `components/shift/ShiftCell.tsx`
- `components/shift/ShiftDetailModal.tsx`
- `constants/ShiftStatus.ts`
- `model/Shift.ts`
- `model/PaidSickLeaveQuota.ts`
- `request/ShiftRequest.ts`
- `service/ShiftService.ts`
- `util/useAuth.ts`
- `components/__tests__/ShiftStatus-test.js`

---

## 3. UI Behavior

### Schedule / ShiftCell

- `ShiftCell` reads `shift.status` from the schedule data.
- Status colors are visible to all users, including employees.
- `no_show` and `unpaid_sick_leave` display as grey.
- `paid_sick_leave` displays as light purple.
- `active` keeps the existing group-based badge styling.
- `cancelled` is treated as a non-worked display status and may use grey styling.

### ShiftDetailModal

- The existing modal remains the entry point for editing a shift.
- Status controls are rendered only when `useAuth().isManager === true`.
- The status dropdown contains only:
  - `no_show`
  - `paid_sick_leave`
  - `unpaid_sick_leave`
- Selecting any status opens a confirmation dialog.
- The status update request is sent only after the user confirms Yes.
- Cancel closes the confirmation dialog without calling the backend.
- Successful status update closes the modal and triggers the existing schedule reload callback.

### Employee and Team Leader Access

- Employees can see status colors but cannot operate status changes.
- Team leaders may retain existing `canEdit` behavior for schedule time/group editing, but status operations must stay Manager-only.
- Do not use `canEdit` as the status permission check; use `isManager`.

---

## 4. Paid Sick Leave Quota UI

The frontend does not calculate authoritative paid sick leave quota. It asks the backend for quota and uses the response only for display and UI hardlock.

Quota response model:

```ts
export interface PaidSickLeaveQuota {
  username: string;
  year: number;
  usedDays: number;
  quotaDays: number;
  probation: boolean;
  eligible: boolean;
  targetDateAlreadyCounted: boolean;
  canMarkPaidSickLeave: boolean;
  message?: string;
}
```

UI rules:

- Show `Paid sick leave used: X/5` to Manager.
- If `probation === true` or `eligible === false`, hardlock paid sick leave and show probation / not eligible messaging.
- If `canMarkPaidSickLeave === false`, hardlock paid sick leave and show quota-used-up messaging.
- If `targetDateAlreadyCounted === true`, allow marking paid sick leave even when quota is otherwise full, because the backend counts the Vancouver calendar day only once.
- No show and unpaid sick leave are not blocked by probation or paid sick leave quota.

---

## 5. Backend API Contract

Base URL comes from `EXPO_PUBLIC_API_URL`. In local development this is usually:

```text
http://localhost:8080/
```

### Update Shift Status

```text
PATCH /api/shift/shiftarrangement/{id}/status
```

Request body:

```json
{
  "status": "paid_sick_leave",
  "operatorUsername": "manager_username"
}
```

Allowed `status` values from the frontend:

- `no_show`
- `paid_sick_leave`
- `unpaid_sick_leave`

### Get Paid Sick Leave Quota

```text
GET /api/shift/shiftarrangement/{id}/paid-sick-leave-quota?operatorUsername=manager_username
```

Expected response fields match `PaidSickLeaveQuota`.

### Schedule Data

The schedule/visible-shifts response must include `status` for each shift. Without `status`, the frontend cannot display employee-visible grey/purple state colors.

---

## 6. Frontend Implementation Notes

- Keep status labels, colors, non-worked status names, and manual action options centralized in `constants/ShiftStatus.ts`.
- Keep request methods thin in `request/ShiftRequest.ts`; service methods in `service/ShiftService.ts` should remain thin wrappers.
- Preserve existing shift status when editing time/group. Do not reset status to `active` in `modifyShift()`.
- The frontend can block obvious paid sick leave actions for UX, but backend validation remains authoritative.
- Do not calculate worked hours or KPI status exclusions on the frontend. Those values must come from backend statistics/KPI APIs.

---

## 7. Browser Verification Checklist

Jest and Expo export are not enough for changes that add a cross-origin method such as `PATCH`. Always verify in a real browser with DevTools Network open.

Before testing:

- Confirm the backend process has been restarted after backend changes.
- Confirm `EXPO_PUBLIC_API_URL` points to the intended backend.
- Log in as a Manager.

Manual test:

1. Open Schedule.
2. Click a shift cell.
3. Confirm the modal shows the status dropdown and paid sick leave quota.
4. Select `Mark as no show`, cancel, and confirm no request is sent.
5. Select `Mark as no show`, confirm Yes, and verify the cell reloads grey.
6. Repeat for `Mark as unpaid sick leave` and `Mark as paid sick leave`.
7. Log in as an employee and confirm status colors are visible but status controls are not.

Network checks:

- For status update, the browser may first send:

```text
OPTIONS http://localhost:8080/api/shift/shiftarrangement/{id}/status
```

- The preflight request must not return `403`.
- The actual request must be:

```text
PATCH http://localhost:8080/api/shift/shiftarrangement/{id}/status
```

- The PATCH payload must be:

```json
{
  "status": "no_show",
  "operatorUsername": "manager_username"
}
```

If OPTIONS fails before PATCH is sent, investigate backend CORS/Spring Security allowed methods and security allowlist first. Do not debug quota or frontend payload until the preflight passes.

---

## 8. Verification Commands Used

Focused Jest test:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest --runTestsByPath components/__tests__/ShiftStatus-test.js --runInBand --watchAll=false
```

Expo web export:

```bash
mkdir -p .expo-tmp .metro-cache
TMPDIR=/Users/marktwain/Projects/OPBOA/.expo-tmp EXPO_METRO_CACHE_DIRECTORY=/Users/marktwain/Projects/OPBOA/.metro-cache npx expo export --platform web --output-dir .expo-build-test
rm -rf .expo-build-test .expo-tmp .metro-cache
```

Diff whitespace check:

```bash
git diff --check -- components/shift/ShiftCell.tsx components/shift/ShiftDetailModal.tsx model/Shift.ts request/ShiftRequest.ts service/ShiftService.ts constants/ShiftStatus.ts model/PaidSickLeaveQuota.ts components/__tests__/ShiftStatus-test.js
```

TypeScript check:

```bash
npx tsc --noEmit
```

Known existing `tsc` failures at the time of this change:

- `app/applications/Regulations.tsx`
- `app/setPassword.tsx`
- `components/applications/ReviewModal.tsx`
- `components/FreeStyle/RequiredFormControl.tsx`

These were not introduced by the shift status frontend work, but they prevent `npx tsc --noEmit` from being a clean project-wide gate until fixed.

---

## 9. CORS Preflight Lesson

Adding a new frontend method such as `PATCH` can make the browser send an `OPTIONS` preflight request before the real request.

If the backend CORS/Spring Security configuration does not allow the method/path/header combination, the browser reports the feature as failed even though the frontend endpoint and payload are correct. For this feature, the failure shape was:

```text
OPTIONS /api/shift/shiftarrangement/{id}/status -> 403 Invalid CORS request
```

Future browser-facing API additions should include a Network-tab verification step that checks both OPTIONS and the actual request.

---

## 10. Out of Scope

- No database changes.
- No frontend reset-to-active operation.
- No frontend authoritative quota, worked-hours, or KPI calculations.
- No refactor of Schedule modal structure beyond the minimum needed for the status UI.
