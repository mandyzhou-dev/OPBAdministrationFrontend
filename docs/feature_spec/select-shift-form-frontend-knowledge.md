# Select Shift Form Frontend Knowledge

Use this note when changing the manager select shift form or similar candidate-status UIs.

## Requirement Confirmation

- Treat user-proposed visuals as candidate solutions, not fixed implementation requirements, unless the user explicitly confirms them.
- Confirm the manager workflow goal first. For this feature, the goal is to help managers quickly see who prefers the selected work date and who cannot be selected because they already have a shift.
- Do not implement from the first UI sketch alone. Wait for the reviewed plan and approved UI direction before coding.
- Keep backend as the source of truth for availability. Frontend disabled behavior improves UX but must not replace backend duplicate-shift guards.

## Candidate Contract

The select shift form should use candidate DTO data instead of merging unrelated frontend lists when the backend can provide row status directly.

Expected row fields:

```ts
export interface ShiftCandidate {
  username: string;
  name: string;
  groupName?: string | null;
  preferred: boolean;
  alreadyScheduled: boolean;
  existingShiftId?: number | null;
  existingShiftStatus?: string | null;
}
```

Field semantics:

- `preferred === true`: employee prefers to work on the selected date.
- `alreadyScheduled === true`: employee already has a shift on the selected date and must be disabled.
- Defensive reads should use strict checks, for example `candidate.preferred === true`, so older mocks or partial data default to false.

## Status Priority

Render row state in this order:

```text
Already scheduled > Selected > Preferred > Normal available
```

Rules:

- If `alreadyScheduled` is true, show only `Already scheduled` as the primary status.
- If a candidate is both preferred and already scheduled, do not let the preferred signal compete with the disabled state.
- Selected state must be visually distinct from preferred. Do not use green as the selected-state color.
- Normal available candidates should stay quiet and selectable.

## Disabled Guards

Already scheduled rows need both UI and data guards:

- Render the row as disabled and non-hovering.
- Disable the checkbox/control when the UI library supports it.
- Filter disabled usernames out of checkbox-group change events.
- Filter disabled usernames again before submit, so stale local state cannot submit an already scheduled employee.
- Keep the backend duplicate-shift guard in place.

## Labels, Legend, and Visual Design

Do not use an isolated green dot as the main signal. It is ambiguous and easy to confuse with online, available, or selected states.

Preferred pattern:

- Use a direct text label such as `Prefers this day`.
- A small dot or icon may be used only inside the label as secondary visual help.
- Add a compact legend above the candidate list: `Preferred = employee prefers to work this day`.
- Tooltips are optional, but the core meaning must be visible without hover.

Suggested tag styles:

- Preferred tag: `22px` high, `0 8px` padding, `12px` text, `#166534` text, `#DCFCE7` background, `#BBF7D0` border, `6px` radius.
- Already scheduled tag: `22px` high, `0 8px` padding, `12px` text, `#475569` text, `#E2E8F0` background, `#CBD5E1` border, `6px` radius.
- Already scheduled row: `#F8FAFC` background, `#94A3B8` text, `#E2E8F0` border, `not-allowed` cursor on web, no hover highlight.

## Mobile Layout

- Keep candidate name, status tag, and checkbox in one row when there is room.
- Use `min-width: 0`, shrinking, ellipsis, or wrapping so long names and status tags do not overlap the checkbox.
- Let the status tag wrap below the name only on narrow widths.
- Preserve at least a `44px` row hit area.
- Verify long names with `Prefers this day`, `Already scheduled`, and selected controls on a narrow viewport.

## Focused Tests

Keep pure row-state logic testable outside the full form when component testing is heavy.

Minimum focused cases:

- Preferred only returns `Prefers this day` and remains enabled.
- Already scheduled only returns `Already scheduled` and is disabled.
- Preferred plus already scheduled returns only `Already scheduled` and is disabled.
- Normal available has no status tag and remains enabled.
- Selected available wins over preferred when not already scheduled.
- Disabled selected usernames are filtered before submit.

Run focused verification after changes:

```bash
npx jest components/__tests__/SelectShiftFormCandidateState-test.js --runInBand
git diff --check
```

Run `npx tsc --noEmit` when practical. If existing unrelated TypeScript errors block the full check, report them separately and confirm whether any diagnostics reference the files touched by the feature.
