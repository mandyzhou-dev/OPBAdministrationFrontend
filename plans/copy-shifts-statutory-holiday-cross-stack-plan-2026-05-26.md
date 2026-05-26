# Copy Shifts Statutory Holiday Cross-Stack Plan

Date: 2026-05-26

Issue: MAN-18, "Fix copy shifts inserting assignments on statutory holidays"

Scope: technical plan only. Do not implement until approved.

## Summary Recommendation

Make the backend copy endpoint the source of truth for statutory holiday validation, and add frontend warnings/result detail so manager-facing behavior matches the existing manual assignment UI.

The best fix is to update `POST /api/shift/preset` so `WeekScheduleService.copyWeekSchedule(...)` skips any generated target shift whose target business date is a statutory holiday in `America/Vancouver`. The frontend should keep using the existing holiday endpoint to warn the manager that the selected target week contains holidays and should display which copied shifts were skipped after the copy completes.

This is a service/DTO/UI contract change only. No table, field, constraint, or data migration is needed.

## Current Flow And Likely Failure Point

### Frontend

- Copy modal: `/Users/marktwain/Projects/OPBOA/components/shift/CopyDialogModal.tsx`
- Request wrapper: `/Users/marktwain/Projects/OPBOA/request/ShiftRequest.ts`
- Service wrapper: `/Users/marktwain/Projects/OPBOA/service/ShiftService.ts`
- Response model: `/Users/marktwain/Projects/OPBOA/model/CopyStatus.ts`

Current copy behavior:

1. `CopyDialogModal` receives `srcWeekStart`.
2. The target week picker only allows Sundays after the source week.
3. On Copy, frontend calls `copyWeekScheduleTo(groupName, srcWeekStart, dstWeekStart)`.
4. `ShiftRequest.copyWeekSchedule(...)` posts:

```json
{
  "groupName": "surrey",
  "srcWeekStart": "2026-05-17",
  "tgtWeekStart": "2026-05-24",
  "mode": "SKIP"
}
```

5. Frontend currently shows only `created` and `skipped` from `CopyStatus`.

The copy modal does not load statutory holidays and cannot warn about target-week holidays today. This differs from `SelectShiftForm`, which loads `GET /api/shift/statutory-holidays` and disables statutory holiday dates in the manual assignment date picker.

### Backend

- Controller: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/controller/copy/ShiftPresetController.java`
- Service: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/service/copy/WeekScheduleService.java`
- Request DTO: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/dto/PresetRequestDTO.java`
- Response DTO: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/dto/PresetResultDTO.java`
- Holiday data: `StatutoryHolidayService`, `StatutoryHolidayRepository`, `StatutoryHolidayDO`

Current backend copy behavior:

1. Converts source and target week starts from `LocalDate` to `America/Vancouver` start-of-day, then to UTC.
2. Rejects target weeks earlier than the source week.
3. Rejects the whole request if the target group already has any shift in the target week.
4. Loads source week shifts by group.
5. Generates target shifts by applying `offsetDays` to each source shift.
6. Saves every generated target shift with `shiftArrangementRepository.saveAll(generatedShiftDOs)`.
7. Returns `created = generatedShiftDOs.size()`, `skipped = 0`, `overwritten = 0`.

Likely failure point: step 5/6 generates and saves shifts for all copied source shifts without checking whether each generated target business date is a statutory holiday. The existing manual assignment holiday guard is frontend-only, so it does not protect this backend copy path.

## Validation Ownership

### Backend: authoritative rule

The backend must own the statutory holiday invariant because copied shifts are persisted by backend service logic, and frontend disabled dates are only UX. `WeekScheduleService` should reject or skip holiday target dates before any insert. This keeps behavior consistent for all clients and future tools.

Recommended service rule:

- Define target business date as `generatedShift.start.withZoneSameInstant(ZoneId.of("America/Vancouver")).toLocalDate()`.
- Load statutory holidays for the target date range once per copy request.
- If a generated shift's target business date is in that holiday set, do not save that generated shift.
- Count it as skipped and return a structured skipped detail with reason `STATUTORY_HOLIDAY`.

### Frontend: UX and transparency

The frontend should not be the source of truth, but it should:

- Load target-week statutory holidays in `CopyDialogModal`.
- Show a warning when the selected target week contains holiday dates.
- After copy, display skipped holiday details so managers can understand partial success.
- Keep the target week selectable even if it contains a holiday, because non-holiday days in the same target week may still be valid.

## API Contract

### Request

Keep the existing endpoint and request body unchanged:

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

No new request field is required.

### Response

Preserve existing fields and add optional detail fields. This is backward compatible for current frontend code that only reads `created`, `skipped`, and `overwritten`.

Recommended Java DTO:

```java
public class PresetResultDTO {
    private Integer created;
    private Integer skipped;
    private Integer overwritten;
    private List<PresetSkippedShiftDTO> skippedDetails;
}
```

Recommended skipped detail DTO:

```java
public class PresetSkippedShiftDTO {
    private String username;
    private String groupName;
    private LocalDate sourceDate;
    private LocalDate targetDate;
    private String reason;
    private String message;
}
```

Recommended reason values:

- `STATUTORY_HOLIDAY`: target business date is a statutory holiday and must not receive a copied shift.
- Future-compatible values can be added later for duplicate/conflict skip reasons if conflict handling is expanded.

Example partial-success response:

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

### Error behavior

Keep existing hard-fail behavior:

- `400 INVALID_SCHEDULE_RANGE` when backend range validation rejects the request. Current backend code rejects target weeks earlier than the source week; the frontend date picker also prevents selecting the same source week.
- `409 SHIFT_ALREADY_EXISTS` when the target week already has schedules under the current all-or-nothing target-week guard.

Holiday handling should not be a hard error for the whole request under current `mode: "SKIP"`. It should be a per-shift skip because a target week can contain both valid days and holiday days.

If future `OVERWRITE` mode is implemented, statutory holiday validation still wins: never delete or insert shifts on statutory holidays.

## Backend Tasks

1. Add a skipped-detail DTO.
   - File: `src/main/java/ca/openbox/shift/dto/PresetSkippedShiftDTO.java`
   - Fields: `username`, `groupName`, `sourceDate`, `targetDate`, `reason`, `message`.
   - Use `LocalDate` for `sourceDate` and `targetDate`.

2. Extend `PresetResultDTO`.
   - Add `List<PresetSkippedShiftDTO> skippedDetails`.
   - Keep `created`, `skipped`, and `overwritten` unchanged.

3. Inject holiday lookup into `WeekScheduleService`.
   - Prefer injecting `StatutoryHolidayRepository` or `StatutoryHolidayService`.
   - If using the repository, add a clear service helper that queries `findByStatutoryDateBetween(tgtWeekStart, tgtWeekStart.plusDays(6))`.
   - Convert the result to `Set<LocalDate>` for O(1) candidate checks.

4. Filter generated shifts before `saveAll`.
   - While generating each candidate, calculate:
     - `sourceBusinessDate = shift.start.withZoneSameInstant(BUSINESS_ZONE).toLocalDate()`
     - `targetBusinessDate = generatedShift.start.withZoneSameInstant(BUSINESS_ZONE).toLocalDate()`
   - If `targetBusinessDate` is a holiday, add a `PresetSkippedShiftDTO` and do not add the generated shift to `generatedShiftDOs`.
   - Save only non-holiday generated shifts.
   - Return:
     - `created = generatedShiftDOs.size()`
     - `skipped = skippedDetails.size()`
     - `overwritten = 0`
     - `skippedDetails = skippedDetails`

5. Keep validation ordering explicit.
   - Request validation remains first.
   - Existing target-week-not-empty check remains as currently implemented for this bugfix.
   - Holiday filtering happens after source shifts are loaded and candidates are generated, before `saveAll`.

6. Centralize date handling.
   - Add `private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Vancouver")` in `WeekScheduleService`.
   - Use `LocalDate` for holiday comparisons.
   - Do not compare formatted strings or UTC dates for holiday decisions.

7. Keep database writes untouched for skipped shifts.
   - `saveAll` must receive no candidate whose Vancouver business date is a holiday.

## Frontend Tasks

1. Extend `CopyStatus`.
   - File: `/Users/marktwain/Projects/OPBOA/model/CopyStatus.ts`
   - Add:

```ts
export interface CopySkippedShift {
  username?: string;
  groupName?: string;
  sourceDate?: string;
  targetDate?: string;
  reason?: "STATUTORY_HOLIDAY" | string;
  message?: string;
}
```

   - Add `skippedDetails?: CopySkippedShift[]` to `CopyStatus`.

2. Load statutory holidays in `CopyDialogModal`.
   - Reuse `getStatutoryHoliday()` from `service/StatutoryHolidayService.ts`.
   - Normalize holidays to `YYYY-MM-DD` strings for comparison.
   - Derive target-week holidays from `dstWeekStart` through `dstWeekStart.add(6, "day")`.

3. Add target-week warning UI.
   - If selected target week contains one or more holidays, show a warning in the copy modal before submission.
   - Suggested copy: `Target week includes statutory holiday(s): 2026-05-18. Copied shifts on those dates will be skipped.`
   - Do not disable the entire target week.

4. Render skipped details after copy.
   - If `skippedDetails` contains `STATUTORY_HOLIDAY`, show a clear partial-success message.
   - Summary copy should be compact, for example: `Created 8 shifts. Skipped 2 on statutory holiday(s).`

5. Keep frontend validation non-authoritative.
   - Do not rely on frontend filtering to prevent illegal inserts.
   - Do not remove skipped source shifts from the request; the request remains week-level.

## Edge Cases

### Partial-week copy

The current copy flow copies a source week to a full target week selected by Sunday start. If a source week has shifts on only some days, only those source shifts generate candidates. Holiday checks apply only to generated target candidates, not to every calendar day in the target week.

### Multiple holidays in target week

Backend should load all holidays between `tgtWeekStart` and `tgtWeekStart.plusDays(6)` inclusive and skip every generated candidate whose target business date is in that set. Response `skipped` should count skipped shifts, not distinct holiday dates.

Frontend warning should list distinct holiday dates in the target week.

### Source shifts on normal days copied onto holidays

This is the reported bug. If a normal source-day shift maps to a target holiday date, backend skips that generated shift. Other generated shifts in the same copy request can still be created.

### Source shifts already on statutory holidays

If source data already contains a shift on a source holiday, the copy rule should still check only the generated target business date. If the target date is not a holiday, the copied shift can be created. This plan does not attempt to clean historical source data.

### Timezone and date-only handling

Statutory holiday dates are `LocalDate` values. Compare holidays against Vancouver local business dates, not UTC dates and not browser-local formatted strings.

Backend:

- Convert generated shift `start` to `America/Vancouver` and then `toLocalDate()`.
- Query holidays by `LocalDate` target range.
- Keep source/target week request fields as `LocalDate`.

Frontend:

- Keep request dates formatted as `YYYY-MM-DD`.
- Use `YYYY-MM-DD` string comparison for warning UI.
- Treat backend `skippedDetails[].targetDate` as date-only text.

### User-facing feedback when shifts are skipped

Managers should see partial success, not a generic success that hides skipped holiday shifts. Recommended copy:

- No skips: `Success. Created 10 shifts.`
- Some holiday skips: `Created 8 shifts. Skipped 2 shift(s) on statutory holiday date(s): 2026-05-25.`
- All candidates skipped: `No shifts were created. All 3 copied shift(s) landed on statutory holiday date(s): 2026-05-25.`

Frontend interaction rule:

- No holiday skips: show the existing success behavior.
- One or more holiday skips: show a partial-success result that includes skipped holiday dates.

### Empty source week

If source week has no shifts, current behavior likely returns `created = 0`. Keep that behavior, with `skipped = 0` and `skippedDetails = []`. Frontend may show `No shifts were found to copy` as a later UX improvement, but it is not required for this bug.

### Existing target-week schedules

Current backend rejects the whole copy when any target-week schedule exists for the group. Keep this behavior for the statutory holiday fix. Do not combine this bugfix with conflict strategy redesign.

## Test Plan

### Backend unit tests

Add or extend tests around `WeekScheduleService`.

Cases:

1. Target week contains one statutory holiday and one generated candidate lands on it.
   - Repository returns source shifts for normal source week.
   - Holiday repository/service returns the target holiday.
   - Verify `saveAll` receives only non-holiday candidates.
   - Assert `created`, `skipped`, and `skippedDetails`.

2. Multiple holidays in target week.
   - Verify candidates on both dates are skipped.
   - Assert skipped count equals number of skipped shifts, not number of holiday dates.

3. All generated shifts land on holidays.
   - Verify `saveAll` is called with an empty list or not called, depending on implementation preference.
   - Assert `created = 0` and `skipped > 0`.

4. Timezone boundary.
   - Source shift near UTC date boundary should use Vancouver business date for target holiday comparison.
   - Example: generated UTC instant that falls on a different UTC date but same Vancouver local date as holiday should be skipped correctly.

5. Target week already has schedules.
   - Existing `DuplicateKeyException` behavior remains unchanged and holiday filtering is not used to bypass target-week conflict validation.

Recommended command after implementation:

```bash
mvn test -Dtest=WeekScheduleServiceTest,ShiftArrangementServiceTest,ShiftArrangementControllerCorsTest
```

If `WeekScheduleServiceTest` does not exist, create it with Mockito and keep it focused on service behavior.

### Backend API/controller tests

Add a controller serialization test for `POST /shift/preset` if controller tests are already using MockMvc in this module.

Assert response includes:

- `created`
- `skipped`
- `overwritten`
- `skippedDetails[0].reason`
- `skippedDetails[0].targetDate`

No new CORS/security rule is expected because the endpoint is already a browser-facing `POST /shift/**` route.

### Frontend unit tests

Add or extend tests for copy modal helper behavior.

Cases:

1. Target week warning appears when fetched statutory holidays include a date between target Sunday and target Saturday.
2. Target week warning does not appear when holidays are outside the selected target week.
3. When `copyWeekScheduleTo` resolves with no `STATUTORY_HOLIDAY` skipped details, the existing success behavior is preserved.
4. When `copyWeekScheduleTo` resolves with `STATUTORY_HOLIDAY` skipped details, the UI shows a partial-success result with skipped dates.
5. Existing error handling for `INVALID_SCHEDULE_RANGE` and `SHIFT_ALREADY_EXISTS` still displays the backend message.

Recommended command after implementation:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest --runInBand --watchAll=false
```

If the project has unstable global tests, run the targeted new copy modal test file and existing affected test files.

### Manual QA

1. Ensure backend has at least one statutory holiday in `opb_statutory_holiday` inside a future target week.
2. Create source week shifts that map onto both holiday and non-holiday dates.
3. Use Copy This Week To... from the schedule UI.
4. Confirm warning appears before copy.
5. Confirm backend response reports skipped holiday shifts.
6. Confirm schedule view after refresh contains no copied shift on the statutory holiday date and contains valid copied shifts on non-holiday dates.

## Data Modeling

### Existing data model

- `opb_shift_arrangement` stores copied shifts through `ShiftArrangementDO`.
- `opb_statutory_holiday` stores holiday dates as `LocalDate` through `StatutoryHolidayDO`.
- `PresetRequestDTO` already carries source and target week starts as `LocalDate`.

### New DTOs/interfaces only

Backend:

- `PresetSkippedShiftDTO`
- Extended `PresetResultDTO.skippedDetails`

Frontend:

- `CopySkippedShift`
- Extended `CopyStatus.skippedDetails`

## Database And Migration Statement

No table, field, constraint, or data migration is needed for this fix.

Reason: statutory holidays already exist in `opb_statutory_holiday`, copied shifts already write to `opb_shift_arrangement`, and the required behavior is a service-layer validation/filter before insert plus response/UI detail. No SQL should be executed for this plan.
