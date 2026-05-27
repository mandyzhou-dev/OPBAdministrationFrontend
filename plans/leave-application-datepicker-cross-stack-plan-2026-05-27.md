# Leave Application DatePicker Cross-Stack Plan

Date: 2026-05-27
Issue: MAN-19

## Goal

Change the employee leave application form from manual date text input to DatePicker-based selection. Dates before the current Vancouver business date must be unavailable. For `SICK` leave, the user may select only dates where the applicant already has a scheduled shift.

Time remains a required HR context field for one-day leave and should stay as the existing manual time-range input. Do not upgrade it to a TimePicker and do not split it into separate start/end controls. Keep the original format guidance visible to employees, using `Format: HHmm-HHmm`.

No database schema, field, constraint, or data migration is required. This plan uses existing leave application and shift arrangement tables.

## Current Code References

Frontend:

- Leave form to change: `/Users/marktwain/Projects/OPBOA/app/applications/NewApplication.tsx`
- Existing DatePicker pattern to reuse: `/Users/marktwain/Projects/OPBOA/components/shift/SelectShiftForm.tsx`
- Existing multi-date DatePicker pattern: `/Users/marktwain/Projects/OPBOA/app/applications/MyPreferShift.tsx`
- Existing request style: `/Users/marktwain/Projects/OPBOA/request/LeaveApplicationRequest.ts`
- Existing shift date request style: `/Users/marktwain/Projects/OPBOA/request/ShiftRequest.ts`

Backend:

- Leave submit endpoint: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/controller/LeaveApplicationController.java`
- Leave service: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/service/LeaveApplicationService.java`
- Leave request DTO: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/dto/PutLeaveApplicationDTO.java`
- Shift lookup repository: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/repository/ShiftArrangementRepository.java`
- Existing scheduling availability example: `GET /api/shift/shiftarrangement/candidatesByDate`

## Frontend Plan

### DatePicker Component Pattern

Reuse the Ant Design `DatePicker` pattern already used in `components/shift/SelectShiftForm.tsx`:

```tsx
import { DatePicker, Flex } from "antd";
import dayjs, { Dayjs } from "dayjs";
```

Use `DatePicker` for the one-day date field and `DatePicker.RangePicker` for the range case. Keep the current Gluestack `FormControl`, `Card`, alerts, duration selection, reason textarea, and submit button.

For one-day leave, keep the existing Gluestack manual time-range input. Use label `Time` and keep a small helper prompt such as `Format: HHmm-HHmm` near the input so employees know the expected range format.

Do not introduce `react-datepicker` or MUI `DatePicker`; the shift forms already use Ant Design DatePicker and dayjs.

### Frontend State

Replace string date state with dayjs state:

- `dateValue: Dayjs | null`
- `rangeValue: [Dayjs | null, Dayjs | null] | null`
- `sickLeaveAvailability: LeaveDateAvailability | null`
- `availabilityLoading: boolean`
- `availabilityError: string | null`

- `timeValue: string`
- `leaveTypeValue: string`
- `durationValue: "oneday" | "range"`

Add frontend interfaces:

```ts
export interface LeaveDateAvailabilityDate {
  date: string; // YYYY-MM-DD, America/Vancouver business date
  scheduled: boolean;
  shiftIds: number[];
}

export interface LeaveDateAvailability {
  applicant: string;
  from: string;
  to: string;
  businessZone: "America/Vancouver";
  dates: LeaveDateAvailabilityDate[];
}
```

### Date Rules

Use an explicit Vancouver "today" helper for the UI minimum date. If the project does not already initialize dayjs timezone plugins, add this near the leave form or a shared date utility:

```ts
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const BUSINESS_ZONE = "America/Vancouver";
const getVancouverToday = () => dayjs().tz(BUSINESS_ZONE).startOf("day");
```

The AntD `disabledDate` function should always block:

```ts
current.isBefore(getVancouverToday(), "day")
```

When `leaveTypeValue !== "SICK"`, only the past-date rule applies.

When `leaveTypeValue === "SICK"`, also block days not present as `scheduled: true` in the fetched availability map. The date picker cannot call the server from `disabledDate`; fetch availability before rendering disabled decisions.

Recommended availability loading window:

- For first render or leave type change to `SICK`, fetch from today through today plus 90 days.
- If the user navigates beyond the loaded range, extend the range in month-sized chunks. If implementing panel-change detection is too much for the first pass, keep the first pass to 90 days and show helper text that sick leave can be selected for currently loaded scheduled dates only.

Submit must also validate selected dates using the availability map:

- One-day sick leave: selected `YYYY-MM-DD` must be `scheduled: true`.
- Range sick leave: every inclusive date in the selected range must be `scheduled: true`.
- If the map is stale or missing any selected day, call the backend eligibility endpoint for the exact selected date range before submitting.

### Request Flow

Add methods to `LeaveApplicationRequest`:

```ts
getLeaveDateAvailability(applicant: string, from: string, to: string): Promise<LeaveDateAvailability>
putLeaveApplication(payload: PutLeaveApplicationPayload): Promise<LeaveApplication>
```

Keep the submit payload compatible with the existing backend:

```ts
interface PutLeaveApplicationPayload {
  applicant: string;
  start: string; // ISO zoned datetime
  end: string;   // ISO zoned datetime
  leaveType: string;
  reason: string;
}
```

Date and time conversion:

- DatePicker stores dayjs date-only choices.
- For one-day leave, parse the existing manual time range from `timeValue` using the current `HHmm-HHmm` format, then compose `start` and `end` from the selected date plus parsed start/end times.
- For range leave, use selected start at `00:00` and selected end at `23:59`, matching current behavior.
- Format submit datetimes with `moment(...).format()` or an equivalent ISO string with local offset, consistent with current code.
- For backend eligibility requests, send date-only strings: `YYYY-MM-DD`.

### Time Input UX

Do not introduce a TimePicker. HR needs the time range as context, but the system should not validate it against scheduled shift start/end.

Keep the existing single manual range input:

- Label the field `Time`.
- Keep visible helper text: `Format: HHmm-HHmm`.
- Keep the field required for one-day leave.
- Do not split the field into separate start/end controls.
- Do not validate the time against scheduled shift start/end.
- Keep existing parsing behavior for the current `HHmm-HHmm` input. If the implementation already supports minor formatting tolerance, preserve it, but do not expand scope beyond the original manual range input.

The backend payload must remain unchanged:

```ts
start = moment(`${selectedDate} ${parsedStartTime}`, "YYYY-MM-DD HH:mm").format();
end = moment(`${selectedDate} ${parsedEndTime}`, "YYYY-MM-DD HH:mm").format();
```

Any parsing or normalization must stay frontend-local. No backend DTO or database change is needed.

### Mobile Layout

Keep DatePicker controls full-width within their card:

- Wrap in the existing `Flex vertical gap="small"` pattern.
- Apply `style={{ width: "100%" }}` or `className` equivalent to DatePicker and RangePicker.
- Keep labels short: `Day`, `Start / End Date`, `Time`.
- Keep the one-day Time input and its `Format: HHmm-HHmm` helper text readable on phones.
- Error/helper text must wrap and not overlap the picker or time input.

## Backend Plan

### New Read Endpoint

Add a read-only endpoint under the leave application boundary because the feature is leave-form validation, even though it reads shifts:

```http
GET /api/process/application/leave-date-availability?applicant=<username>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
```

Response:

```json
{
  "applicant": "employee1",
  "from": "2026-05-27",
  "to": "2026-06-30",
  "businessZone": "America/Vancouver",
  "dates": [
    {
      "date": "2026-05-27",
      "scheduled": true,
      "shiftIds": [123]
    },
    {
      "date": "2026-05-28",
      "scheduled": false,
      "shiftIds": []
    }
  ]
}
```

Controller boundary:

- Add `GET /application/leave-date-availability` to `LeaveApplicationController`.
- Parse `from` and `to` as `LocalDate`.
- Delegate all business logic to `LeaveApplicationService`.

Service boundary:

- Add `getLeaveDateAvailability(String applicant, LocalDate from, LocalDate to)`.
- Validate `applicant` is nonblank.
- Clamp or reject very large ranges. Recommended max: 120 days, returning `400 BAD_REQUEST` for larger ranges.
- Convert each `LocalDate` to `America/Vancouver` day start and next day exclusive.
- Query shifts for the applicant between range start inclusive and range end exclusive.
- Group by Vancouver `LocalDate`.
- Return one DTO item per date in the requested inclusive range.

Repository boundary:

- Reuse existing `ShiftArrangementRepository.getShiftArrangementDOByUsernameAndStartBetween(...)`.
- Prefer querying once for the whole range instead of per day.
- Use start inclusive and end exclusive at the service level where possible. The existing derived repository method is `Between`; if it is inclusive, pass `to.plusDays(1).atStartOfDay(zone).minusNanos(1)` to preserve current style.

DTOs to add under `ca.openbox.process.dto`:

- `LeaveDateAvailabilityDTO`
- `LeaveDateAvailabilityDateDTO`

No JPA entity changes are needed.

### Submit-Time Backend Validation

Frontend disabled dates are UX only. Add authoritative validation in `LeaveApplicationService.addLeaveApplication(...)` or in a dedicated `validateLeaveApplication(...)` called before save:

- Reject any leave application where any selected Vancouver business date is before today's Vancouver date.
- If `leaveType` is `SICK`, require every selected Vancouver business date in the requested leave range to have at least one shift for `applicant`.
- For one-day partial leave, this naturally checks the date of `start`.
- For multi-day range leave, check every inclusive local date from `start` to `end`.
- Return `400 BAD_REQUEST` with clear messages such as:
  - `Leave date cannot be before today`
  - `Sick leave requires an existing scheduled shift for every selected date`

Use `ZoneId.of("America/Vancouver")`, consistent with existing shift, KPI, copy schedule, and paid sick leave logic.

### Date and Timezone Rules

Canonical rules:

- Availability endpoint request dates are date-only `YYYY-MM-DD` in `America/Vancouver`.
- Availability response dates are date-only `YYYY-MM-DD` in `America/Vancouver`.
- Leave submit keeps existing ISO zoned datetimes for `start` and `end`.
- Backend converts submitted `ZonedDateTime` values to Vancouver `LocalDate` for validation.
- Do not compare browser-local `Date` objects to backend instants for business rules.
- Today means current date in `America/Vancouver`, not UTC.

## Task Decomposition

Backend tasks:

1. Add `LeaveDateAvailabilityDTO` and `LeaveDateAvailabilityDateDTO`.
2. Add `LeaveApplicationService.getLeaveDateAvailability(...)`.
3. Add `LeaveApplicationService` validation helpers:
   - `toBusinessDate(ZonedDateTime)`
   - `getBusinessDatesInclusive(start, end)`
   - `assertNotPast(...)`
   - `assertScheduledForSickLeave(...)`
4. Update `addLeaveApplication(...)` to call validation before save.
5. Add `GET /application/leave-date-availability` to `LeaveApplicationController`.
6. Add focused unit tests for availability and submit validation.
7. Add or update controller/CORS tests if the project has coverage for process endpoints.

Frontend tasks:

1. Add leave availability TypeScript interfaces.
2. Add `LeaveApplicationRequest.getLeaveDateAvailability(...)`.
3. Update `NewApplication.tsx` to use AntD `DatePicker` and `RangePicker`.
4. Implement `disabledDate` with base past-date rule and sick-leave schedule rule.
5. Fetch availability when applicant is known and leave type is `SICK`.
6. Revalidate selected sick leave dates before submit if selected dates are outside the loaded availability map.
7. Keep the one-day single time range input with the visible `Format: HHmm-HHmm` helper; compose the existing payload datetimes from the parsed range.
8. Add focused tests for disabled-date rules and submit guards.
9. Verify mobile layout for one-day and range modes.

## Acceptance Criteria

- Leave form no longer exposes manual text inputs for date, start date, or end date.
- One-day Time remains a single manual range input with visible `Format: HHmm-HHmm` guidance.
- Time remains HR context and is not validated against scheduled shift times.
- User cannot select a date before today's Vancouver date.
- Today's Vancouver date is selectable when other rules allow it.
- Non-sick leave can select any today-or-future date.
- Sick leave can select only today-or-future dates where the applicant has at least one scheduled shift.
- Sick leave range submission is blocked if any date in the range has no scheduled shift.
- Backend rejects invalid past dates even if the frontend is bypassed.
- Backend rejects sick leave dates without scheduled shifts even if the frontend is bypassed.
- Existing leave submit response shape remains compatible.
- No database migration or direct database operation is needed.

## Suggested Tests

Backend:

- Availability endpoint returns `scheduled: true` with `shiftIds` for a date with an applicant shift.
- Availability endpoint returns `scheduled: false` for a date without an applicant shift.
- Availability endpoint uses Vancouver local date boundaries for shifts near UTC day boundaries.
- Submitting non-sick leave for yesterday returns `400`.
- Submitting personal leave for today succeeds.
- Submitting sick leave for a scheduled date succeeds.
- Submitting sick leave for an unscheduled date returns `400`.
- Submitting sick leave range with one unscheduled date returns `400`.

Frontend:

- `disabledDate` blocks yesterday and allows today for personal leave.
- `disabledDate` blocks a future unscheduled date for sick leave.
- `disabledDate` allows a future scheduled date for sick leave.
- Changing leave type from `SICK` to personal clears schedule-only blocking.
- One-day submit composes `start` and `end` from DatePicker date plus the existing `HHmm-HHmm` time range input.
- One-day submit blocks empty or unparsable time range input using the existing validation pattern.
- Range submit composes `00:00` and `23:59` on selected dates.
- Mobile viewport: DatePicker, RangePicker, Time input, helper/error text, and submit button do not overlap.

## Notes for Implementers

- Do not use the existing `candidatesByDate` endpoint directly for the leave form. It returns all role candidates for shift assignment UI and is not shaped for one applicant's leave eligibility or submit validation.
- The leave form may still use the same underlying shift repository through the backend service.
- Keep all new API contracts additive.
- If implementation discovers a required database change, stop and post the reason plus complete SQL in the issue for user execution before proceeding.
