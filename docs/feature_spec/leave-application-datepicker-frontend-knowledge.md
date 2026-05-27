# Leave Application DatePicker Frontend Knowledge

Date: 2026-05-27
Issue: MAN-19

## Scope

The leave application form date fields are DatePicker-based. The time field is not part of the DatePicker upgrade: it remains the original manual one-day time range input with `Format: HHmm-HHmm` helper text.

Do not expand this feature into TimePicker, split start/end time inputs, database changes, or backend DTO changes unless a new approved requirement explicitly asks for it.

## Implementation Pattern

Reuse the existing project pattern:

- Import `DatePicker` / `Flex` from `antd`.
- Use `dayjs` and `Dayjs` for picker state.
- One-day leave uses `DatePicker`.
- Range leave uses `DatePicker.RangePicker`.
- Keep the existing Gluestack form/card structure around the picker.
- Keep picker width at `100%` so the form works on mobile.

Relevant files:

- `app/applications/NewApplication.tsx`
- `util/leaveDateAvailability.ts`
- `model/LeaveDateAvailability.ts`
- `request/LeaveApplicationRequest.ts`

## Date Rules

The business calendar is `America/Vancouver`.

- Normal leave: disable dates before Vancouver today; allow Vancouver today.
- Sick leave: apply the same past-date rule, plus disable dates that are not scheduled for the applicant.
- Date-only request and response values use `YYYY-MM-DD`.
- Submit payload remains existing ISO datetime fields: `start` and `end`.

The helper utilities should keep this logic out of render code:

- `BUSINESS_ZONE = "America/Vancouver"`
- `getVancouverToday()`
- `formatBusinessDate(date)`
- `buildAvailabilityMap(response)`
- `isLeaveDateDisabled(current, leaveType, availability)`
- `areAllDatesScheduled(start, end, availability)`

## Sick Leave Availability Contract

Frontend calls:

```http
GET /api/process/application/leave-date-availability?applicant=<username>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
```

Expected response shape:

```json
{
  "applicant": "employee1",
  "from": "2026-05-27",
  "to": "2026-06-30",
  "businessZone": "America/Vancouver",
  "dates": [
    { "date": "2026-05-27", "scheduled": true, "shiftIds": [123] },
    { "date": "2026-05-28", "scheduled": false, "shiftIds": [] }
  ]
}
```

For the first pass, load sick leave availability from Vancouver today through today plus 90 days. Before submit, validate the selected one-day date or every date in the selected range. If the selected dates are outside the loaded range or the map does not prove every date is scheduled, refetch the exact selected range before submitting.

Fixed dates in Jest tests, for example `2026-05-27` and `2026-08-25`, are deterministic fixtures. They are used to prove request parameters, response mapping, and helper behavior without depending on the machine's current date. They do not mean the business date or selectable calendar range is hardcoded in production.

## Time Field Final Rule

The final product decision is to keep the original manual time-range field:

- Label: `Time`
- Helper text below input: `Format: HHmm-HHmm`
- Placeholder can remain `HHmm-HHmm`
- Required for one-day leave
- Not shown for range leave
- Do not use TimePicker
- Do not split into `Start time` / `End time`
- Do not validate against scheduled shift start/end

The split-time and TimePicker directions were discussed but rolled back because the existing manual format was already familiar to employees and the DatePicker requirement did not need a time-input redesign.

## Helper Text And UI Style

Final UI requirements:

- Sick leave availability text belongs under the `Day` or `Start / End Date` picker as field helper text.
- Do not render sick leave availability as a standalone white row/card.
- Sick leave helper text uses `fontSize: 14`, `lineHeight: 20`, `color: "#8c8c8c"`, `marginTop: 6`, `marginBottom: 12`.
- The `Time` field uses label `Time` and puts `Format: HHmm-HHmm` below the input with the same small helper-text style.
- Keep about 16px vertical spacing between date and time field groups.

## Tests And Verification

Focused tests added or adjusted:

- `components/__tests__/LeaveDateAvailabilityRules-test.js`
  - Vancouver today logic.
  - Past dates disabled, today allowed.
  - Sick leave scheduled dates allowed and unscheduled/missing dates disabled.
  - Every date in a sick leave range must be scheduled.
- `components/__tests__/ApplicationHistoryRequest-test.js`
  - Request contract for leave date availability.
  - Fixed `YYYY-MM-DD` values are fixtures only; production callers pass dynamically computed dates.
- `components/__tests__/NewApplicationHelperText-test.js`
  - Sick leave helper text is inside the date card.
  - Time label remains `Time`.
  - `Format: HHmm-HHmm` is helper text.
  - No old `Time(Format:HHmm-HHmm)` label.

Focused verification command:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.tmp/jest npx jest components/__tests__/NewApplicationHelperText-test.js components/__tests__/LeaveDateAvailabilityRules-test.js components/__tests__/ApplicationHistoryRequest-test.js --runInBand
```

Known wider verification caveat from this work: `npx tsc --noEmit` had unrelated pre-existing failures in `Regulations.tsx`, `setPassword.tsx`, `ReviewModal.tsx`, and `RequiredFormControl.tsx`.
