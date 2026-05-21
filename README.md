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
