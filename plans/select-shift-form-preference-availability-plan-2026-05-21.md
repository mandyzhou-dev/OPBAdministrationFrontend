# Select Shift Form Preference Availability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `select shift form` so managers can quickly see employees who prefer the selected day and cannot select employees who already have a shift that day.

**Architecture:** Add a small backend read contract that returns per-employee scheduling availability for one selected date, then render that contract in the existing React Native Web form. Keep the preference table and shift tables unchanged; this is a response DTO and UI state/rendering change, not a database migration.

**Tech Stack:** Expo / React Native Web, Gluestack UI, Ant Design DatePicker, Axios, Jest; Spring Boot 3.2.3, Maven, Spring Web, Spring Data JPA, MySQL.

---

## Context Read

- Frontend README: `/Users/marktwain/Projects/OPBOA/README.md`
- Backend README: `/Users/marktwain/Projects/OPBAdministrationBackend/Readme.md`
- Frontend target file: `/Users/marktwain/Projects/OPBOA/components/shift/SelectShiftForm.tsx`
- Existing preference request files:
  - `/Users/marktwain/Projects/OPBOA/service/ShiftBoardService.ts`
  - `/Users/marktwain/Projects/OPBOA/request/ShiftBoardRequest.ts`
- Existing backend preference endpoint:
  - `GET /api/shift/shiftboard/getBoardByDate?date=...`
  - Controller: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/controller/ShiftBoardController.java`
  - Service: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/service/EmployeePreferWorkdayBoardService.java`
- Existing shift duplicate behavior:
  - `PUT /api/shift/shiftarrangement/batchCreateByDate`
  - Service checks `getShiftArrangementDOByUsernameAndStartBetween(username, start, end)` before creating.

## Current API Assessment

Existing API already provides preference data, but only as `string[]` usernames:

```ts
GET /api/shift/shiftboard/getBoardByDate?date=<ISO ZonedDateTime>
Response: string[]
Example: ["alice", "bob"]
```

This is enough to determine `preferred`, but it is not enough to determine `alreadyScheduled` without either:

- making one request per employee, which is inefficient and not currently exposed; or
- fetching visible shifts through a manager-specific schedule endpoint, which couples this form to a different visibility use case and still requires client-side merging.

Plan decision: add a dedicated compact backend response for this form. Do not change the existing preference endpoint because other screens already use it.

No table, column, constraint, or data migration is required. If an implementation attempt discovers that the current schema does not support the queries below, stop and post the required SQL in the issue for the user to execute.

## Backend API Contract

Add:

```text
GET /api/shift/shiftarrangement/candidatesByDate
```

Query params:

```text
date: required ZonedDateTime ISO string; same input style as existing shiftboard date.
groupName: optional string; current form values are "surrey" and "coquitlam". Preserve current UI behavior by not filtering candidates by this value unless the user separately confirms group-scoped candidate lists.
role: optional string; default "tester".
```

Response:

```json
[
  {
    "username": "alice",
    "name": "Alice Chen",
    "groupName": "surrey",
    "preferred": true,
    "alreadyScheduled": false,
    "existingShiftId": null,
    "existingShiftStatus": null
  },
  {
    "username": "bob",
    "name": "Bob Lee",
    "groupName": "surrey",
    "preferred": true,
    "alreadyScheduled": true,
    "existingShiftId": 123,
    "existingShiftStatus": "active"
  }
]
```

Field naming and defaults:

- `username: string` - required; stable selection value.
- `name: string` - required; display label. If backend value is null, return `username` as fallback.
- `groupName: string | null` - nullable because user records may not all have a group.
- `preferred: boolean` - required; default `false` when no preference row exists for the date.
- `alreadyScheduled: boolean` - required; default `false` when no shift exists for that employee on the selected business date.
- `existingShiftId: number | null` - null when `alreadyScheduled === false`.
- `existingShiftStatus: string | null` - null when `alreadyScheduled === false`.

Compatibility:

- Keep `GET /api/shift/shiftboard/getBoardByDate` unchanged.
- Keep `PUT /api/shift/shiftarrangement/batchCreateByDate` unchanged.
- The new endpoint is additive and can be adopted by `SelectShiftForm` without breaking `MyPreferShift` or schedule tables.

Business date rule:

- Use `America/Vancouver` calendar-day boundaries for the selected date.
- Query shifts from start of selected Vancouver day through the next day exclusive.
- Treat any shift found on that date as `alreadyScheduled`, matching the current duplicate-prevention intent. Do not filter out non-active statuses unless product explicitly changes duplicate behavior later.
- Prefer status priority for UI: `Already scheduled > Selected > Preferred > Normal available`.

## Backend File Plan

Create:

- `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/dto/ShiftCandidateDTO.java`

Modify:

- `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/controller/ShiftArrangementController.java`
- `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/service/ShiftArrangementService.java`
- `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/shift/repository/ShiftArrangementRepository.java`

Optional if ordering/filter support needs it:

- `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/user/repository/UserPresentationRepository.java`

Do not modify:

- `opb_employee_prefer_workday` schema.
- `opb_shift_arrangement` schema.
- Existing shiftboard endpoints.

## Backend Tasks

### Task 1: Add Response DTO

- [ ] Create `ShiftCandidateDTO` with Lombok `@Data`, `@AllArgsConstructor`, and fields:

```java
private String username;
private String name;
private String groupName;
private boolean preferred;
private boolean alreadyScheduled;
private Integer existingShiftId;
private String existingShiftStatus;
```

- [ ] Use primitive booleans so JSON always returns `true` or `false`, never null.

### Task 2: Add Shift Date Query

- [ ] Add repository method in `ShiftArrangementRepository`:

```java
List<ShiftArrangementDO> getShiftArrangementDOByStartBetween(ZonedDateTime start, ZonedDateTime end);
```

- [ ] Use this for one query per selected date instead of one query per employee.

### Task 3: Add Candidate Builder Service

- [ ] In `ShiftArrangementService`, inject `UserPresentationRepository` and `EmployeePreferWorkdayBoardService`.
- [ ] Add method:

```java
public List<ShiftCandidateDTO> getCandidatesByDate(ZonedDateTime date, String groupName, String role)
```

- [ ] Implementation details:
  - Convert `date` to `America/Vancouver` `LocalDate`.
  - Build `dayStart = localDate.atStartOfDay(BUSINESS_ZONE)`.
  - Build `dayEnd = dayStart.plusDays(1).minusNanos(1)`.
  - Load active employees by role. Prefer existing `findByRolesContainingAndActiveOrderByNameAsc(role, 1)`.
  - Do not filter employee candidates by `groupName` in this change. Current `SelectShiftForm` loads all active `tester` users with `getUserByRole("tester")`; preserve that row scope. The selected group remains the shift `groupName` submitted to `batchCreateByDate`.
  - Load preferred username list via `employeePreferWorkdayBoardService.getPreferredEmployeesBydate(date)`.
  - Load all shifts for the date via `getShiftArrangementDOByStartBetween(dayStart, dayEnd)`.
  - Build a `Map<String, ShiftArrangementDO>` by username. If more than one shift exists for the same username on that day, keep the first by lowest id.
  - Return candidates sorted by employee name ascending.

### Task 4: Add Controller Endpoint

- [ ] In `ShiftArrangementController`, add:

```java
@CrossOrigin(origins = "http://localhost:8081", allowCredentials = "true")
@GetMapping("/candidatesByDate")
public List<ShiftCandidateDTO> getCandidatesByDate(
        @RequestParam(value = "date") ZonedDateTime date,
        @RequestParam(value = "groupName", required = false) String groupName,
        @RequestParam(value = "role", required = false, defaultValue = "tester") String role
) {
    return shiftArrangementService.getCandidatesByDate(date, groupName, role);
}
```

- [ ] No Spring Security method expansion is expected for a GET endpoint if existing GET shift endpoints already work, but verify CORS in browser network during QA.

### Task 5: Backend Verification

- [ ] Run targeted compile/test:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn test
```

- [ ] Manually verify response with existing local backend config:

```bash
curl "http://localhost:8080/api/shift/shiftarrangement/candidatesByDate?date=2026-05-21T09:30:00-07:00&groupName=surrey"
```

Expected:

- HTTP 200.
- Each object has `preferred` and `alreadyScheduled` booleans.
- Employees with existing shifts on that Vancouver date return `alreadyScheduled: true`.

## Frontend Data Contract

Add TypeScript interface:

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

Frontend should default defensively when reading older/mocked data:

```ts
const preferred = candidate.preferred === true;
const alreadyScheduled = candidate.alreadyScheduled === true;
```

Selection value remains `username`.

## Frontend File Plan

Create:

- `/Users/marktwain/Projects/OPBOA/model/ShiftCandidate.ts`

Modify:

- `/Users/marktwain/Projects/OPBOA/request/ShiftRequest.ts`
- `/Users/marktwain/Projects/OPBOA/service/ShiftService.ts`
- `/Users/marktwain/Projects/OPBOA/components/shift/SelectShiftForm.tsx`

Test:

- `/Users/marktwain/Projects/OPBOA/components/__tests__/SelectShiftFormCandidateState-test.js`

## Frontend Component Hierarchy

Keep the existing page structure:

```text
SelectShiftFrom
  Alert area
  Date Card
    Antd DatePicker
  Group Card
    RadioGroup
  Assignment Card
    Assignment header
    Preferred legend
    CheckboxGroup
      ShiftCandidateRow
        Employee name
        Status tag
        Checkbox indicator
  Submit Card
    Submit Button
```

Implementation guidance:

- `ShiftCandidateRow` can be an extracted local component in `SelectShiftForm.tsx` for the first implementation. Extract to its own file only if the file becomes hard to read.
- Use candidate data as the source of truth for rows; stop building rows from `userList + preferredWorkers`.
- Remove the standalone `BadgeIcon as={CircleIcon}` outside the row flow.
- Keep `checkedUsers` as `string[]`.

## Frontend State and Fetch Logic

Replace:

```ts
const [userList, setUserList] = React.useState<User[]>([])
const [preferredWorkers, setPreferredWorkers] = React.useState<string[]>([])
```

With:

```ts
const [candidates, setCandidates] = React.useState<ShiftCandidate[]>([])
```

Fetch candidates when `workDate` changes. Refetching on `checkedGroup` is optional and harmless if the backend accepts `groupName`, but it must not change candidate row scope unless group filtering is explicitly approved.

```ts
useEffect(() => {
  setCheckedUsers((current) =>
    current.filter((username) => {
      const candidate = candidates.find((item) => item.username === username);
      return candidate ? !candidate.alreadyScheduled : true;
    })
  );
}, [candidates]);
```

Service call:

```ts
getShiftCandidatesByDate(moment(workDate.toDate()), checkedGroup).then(setCandidates)
```

After a successful submit:

- Clear selected users.
- Refetch candidates for the same date so submitted employees become disabled.

## Frontend Row Logic

For each candidate:

```ts
const isAlreadyScheduled = candidate.alreadyScheduled === true;
const isSelected = checkedUsers.includes(candidate.username);
const isPreferred = candidate.preferred === true;
const isDisabled = isAlreadyScheduled;
```

Status priority:

```ts
if (isAlreadyScheduled) return "Already scheduled";
if (isSelected) return "Selected";
if (isPreferred) return "Prefers this day";
return null;
```

Click/selection guard:

- Pass `isDisabled={isAlreadyScheduled}` to `Checkbox` if Gluestack supports it.
- Also guard `CheckboxGroup` `onChange` by filtering out disabled usernames:

```ts
const disabledUsernames = new Set(
  candidates
    .filter((candidate) => candidate.alreadyScheduled === true)
    .map((candidate) => candidate.username)
);

const nextCheckedUsers = selected.filter((username) => !disabledUsernames.has(username));
setCheckedUsers(nextCheckedUsers);
```

- Do not rely only on CSS opacity. The disabled user must not be submitted even if the UI library emits a change event.

## Frontend UI Styling

Preferred tag:

```text
height: 22px
padding: 0 8px
font-size: 12px
color: #166534
background: #DCFCE7
border: 1px solid #BBF7D0
border-radius: 6px
```

Text:

- Use `Prefers this day` as the desktop label.
- On narrow mobile widths, `Prefers today` is acceptable if the full label crowds the row.
- If using a dot, it must be inside the tag before text. It must not float outside the row.

Legend:

```text
Preferred = employee prefers to work this day
font-size: 12px
color: #64748B
```

Already scheduled row:

```text
row background: #F8FAFC
row text: #94A3B8
row border: #E2E8F0
cursor: not-allowed on web
no hover highlight
```

Already scheduled tag:

```text
height: 22px
padding: 0 8px
font-size: 12px
color: #475569
background: #E2E8F0
border: 1px solid #CBD5E1
border-radius: 6px
label: Already scheduled
```

Selected:

- Keep selected visually distinct from preferred.
- Use existing checkbox check indicator plus a neutral or primary `Selected` tag only if it does not clutter the row.
- Do not use green for selected state.

Row layout:

```text
display/flex direction row
left: employee name, flex: 1, min-width: 0
middle/right: fixed status tag slot, align-items: flex-end
far right: checkbox indicator
row min-height: 44px
vertical padding: 10px
horizontal padding: 12px
gap: 8px
```

Mobile adaptation:

- Keep name, tag, and checkbox on one row when possible.
- Use `flexShrink: 1` and ellipsis/wrapping for long names.
- Let the status tag wrap below the name only below small widths if one-line layout becomes cramped.
- Ensure the checkbox hit area remains at least 44px high.
- No text should overlap the checkbox or status tag.

Tooltip:

- Optional only.
- If added, tooltip content can be `Employee prefers working on this date`.
- Do not hide the main preference meaning only in tooltip.

## Frontend Tasks

### Task 6: Add Model and Request Method

- [ ] Create `model/ShiftCandidate.ts` with the interface above.
- [ ] Add `getShiftCandidatesByDate(workDate: string, groupName: string)` to `ShiftRequest`.
- [ ] Add service wrapper `getShiftCandidatesByDate(workDate: Moment, groupName: string): Promise<ShiftCandidate[]>` in `ShiftService.ts`.
- [ ] Format dates with the same `moment(...).format()` style already used by `batchByDate`.

### Task 7: Rewrite SelectShiftForm Data Source

- [ ] Replace `userList` and `preferredWorkers` state with `candidates`.
- [ ] Remove `getUserByRole` and `getPreferredEmployeesBydate` imports from `SelectShiftForm.tsx`.
- [ ] Fetch candidates on `workDate` changes. If implementation also refetches on `checkedGroup`, confirm the endpoint still returns all active tester candidates.
- [ ] Clear disabled selected usernames whenever candidates change.
- [ ] Refetch candidates after successful submit.

### Task 8: Implement Status Tags and Disabled Rows

- [ ] Add local render helpers:
  - `getCandidateStatus(candidate, checkedUsers)`
  - `renderStatusTag(status)`
  - `isCandidateDisabled(candidate)`
- [ ] Render `Already scheduled` above all other states.
- [ ] Render `Prefers this day` only when candidate is preferred and not already scheduled.
- [ ] If a candidate is both preferred and already scheduled, display only `Already scheduled`.
- [ ] Remove the isolated green dot.
- [ ] Ensure disabled rows have no hover-highlight style and cannot be clicked/submitted.

### Task 9: Add Legend and Responsive Layout

- [ ] Add the legend line above the checkbox list.
- [ ] Use a stable row layout with a right-aligned status tag slot and far-right checkbox.
- [ ] Add mobile-safe wrapping or shrinking for names and labels.
- [ ] Keep the existing date/group/submit cards intact; do not redesign the whole page.

### Task 10: Frontend Tests

- [ ] Add a focused Jest test file for pure status logic, or export small helpers from a nearby module if direct component testing is too heavy.
- [ ] Cover:
  - prefer only -> `Prefers this day`, enabled.
  - already scheduled only -> `Already scheduled`, disabled.
  - preferred and already scheduled -> only `Already scheduled`, disabled.
  - normal -> no status tag, enabled.
  - selected -> selected state wins over preferred only when not already scheduled.
  - disabled selected username is filtered out before submit.
- [ ] Run:

```bash
cd /Users/marktwain/Projects/OPBOA
npx jest components/__tests__/SelectShiftFormCandidateState-test.js --runInBand
git diff --check
```

- [ ] If practical, also run:

```bash
npx tsc --noEmit
```

Known frontend note: OPBOA may have unrelated existing TypeScript failures in files outside this feature. Report those separately if they appear.

## End-to-End Verification Checklist

- [ ] Preferred only: candidate has `preferred: true`, `alreadyScheduled: false`; row shows `Prefers this day`; row is selectable.
- [ ] Already scheduled only: candidate has `preferred: false`, `alreadyScheduled: true`; row shows `Already scheduled`; row cannot be selected.
- [ ] Both preferred and already scheduled: row shows only `Already scheduled`; row cannot be selected.
- [ ] Normal available: no tag; row selectable.
- [ ] Selected available: checkbox selected and selected state remains visually distinct from preference green.
- [ ] Disabled click interception: clicking disabled row/checkbox does not add username to `checkedUsers`.
- [ ] Submit guard: request payload excludes any already scheduled username even if stale UI state exists.
- [ ] Date change: candidates refetch and disabled selections are removed.
- [ ] Group change: selected shift group changes without accidentally hiding candidates; if implementation refetches, current selection is reconciled.
- [ ] Mobile: long employee names, `Prefers this day`, `Already scheduled`, and checkbox do not overlap.
- [ ] Backend: no SQL migration was required.
- [ ] Existing preference screen still works because `getBoardByDate`, `getBoardByUser`, and `updateBoard` are unchanged.

## Handoff Notes

- Frontend developer should wait for backend endpoint contract or use mocked `ShiftCandidate[]` only for local rendering tests.
- Backend developer should implement the new endpoint first because frontend disabled state depends on `alreadyScheduled`.
- The old duplicate-shift backend guard must remain. Frontend disabled behavior improves UX but is not the source of truth.
- Do not mention or trigger other agents with `mention://agent` links unless the PM explicitly delegates implementation.
