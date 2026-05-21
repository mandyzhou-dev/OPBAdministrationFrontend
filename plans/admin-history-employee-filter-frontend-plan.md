# Admin Application History Employee Filter - Frontend Plan

## Scope

Only plan the feature. Do not implement code until the user confirms "ok".

Goal: In the manager/admin Application -> History page, add an employee dropdown filter so managers can view all history or only one employee's history. Keep the frontend/backend contract explicit and keep the dropdown style aligned with the existing Application / Target selection controls where possible.

Current access boundary: this version is still Manager-only. Do not include Team Leader in the UI visibility rules for this issue. However, frontend names, copy, and API wrappers should describe "application history" and "employee visibility" rather than baking in "manager-only forever" semantics, so future Team Leader support can be added by changing visibility and backend permission policy rather than rewriting the History filter feature.

## Repository Context Read

- Frontend README read: `/Users/marktwain/Projects/OPBOA/README.md`.
- Backend README read: `/Users/marktwain/Projects/OPBAdministrationBackend/Readme.md`.
- Frontend stack: Expo / React Native Web, TypeScript, gluestack UI, axios.
- Backend stack: Spring Boot 3.2.3, Maven, Spring Web, Spring Data JPA, Spring Security.

## 1. Current Admin History Data Source, Paging, Sorting, Filtering

Current frontend file:

- `app/applications/History.tsx`

Current behavior:

- On mount, reads `user` from `localStorage`.
- Manager role guard is currently commented out.
- Calls `getAllApplication()` from `service/ApplicationService.ts`.
- `getAllApplication()` calls `LeaveApplicationRequest.getAllApplications()`.
- `LeaveApplicationRequest.getAllApplications()` sends `GET {EXPO_PUBLIC_API_URL}api/process/application`.
- Renders returned `LeaveApplication[]` with `HistoryApplicationCard` inside an `HStack flexWrap="wrap"`.

Current backend source:

- `LeaveApplicationController.getApplicationsByApplicant()` at `GET /process/application`.
- With no `handler` and no `applicant`, it calls `LeaveApplicationService.getAllApplications()`.
- `getAllApplications()` calls `LeaveApplicationRepository.getLeaveApplicationDOByStatusIsNotContainingOrderBySubmitTimeDesc("pending")`.

Current semantics:

- History currently means all leave applications whose `status` does not contain `"pending"`.
- Sort is fixed in repository method: `submitTime DESC`.
- There is no frontend or backend pagination.
- There is no History filter state in the frontend.
- Existing query params on `GET /process/application`:
  - `handler`: used by review list.
  - `applicant`: used by employee My Applications.
- Important incompatibility: current `applicant` path returns all applications for that applicant, including pending, so it should not be reused directly for manager History filtering unless backend adds a separate "history only" endpoint or flag.

## 2. Employee Dropdown Data Source

Existing employee APIs:

- `GET /presentor/user/employees/basic`
  - Frontend wrapper: `getEmployeeBasic()` in `service/UserService.ts`.
  - Backend: `UserPresentor.getEmployeeBasicInfo()`.
  - Current backend implementation is hard-coded to `roles` containing `"tester"` and sorts by active descending. It does not explicitly filter inactive users out.
- `GET /presentor/user/getUserByGroupName?group=surrey`
  - Used by `app/(tabs)/target/index.tsx`.
  - This is group-specific and not suitable for global Application History unless product confirms the History page should be group-scoped.

Recommendation:

- Reuse the existing frontend `User` type shape for dropdown options, but add or refine a backend employee options endpoint so the contract is intentional.
- Preferred endpoint:
  - `GET /api/presentor/user/employees/options?activeOnly=true`
  - If the backend base path is not globally prefixed with `/api`, keep frontend consistent with existing `EXPO_PUBLIC_API_URL + 'api/...'`.
- Request:
  - Query params:
    - `activeOnly`: optional boolean, default `true`.
    - `q`: optional string for backend search later. Not required for first implementation if the list is small.
- Response:

```json
[
  {
    "username": "jane",
    "name": "Jane Doe",
    "roles": "tester",
    "groupName": "surrey",
    "active": 1
  }
]
```

Frontend interface:

```ts
export interface EmployeeOption {
  username: string;
  name: string;
  roles?: string;
  groupName?: string;
  active?: number;
}
```

If Backend_Dev chooses not to add a new endpoint, use `getEmployeeBasic()` only after changing the backend implementation to return active employees only and preferably sorted by `name ASC`. Do not use the group-specific endpoint for History unless the user confirms group-scoped filtering.

## 3. History Filter API Contract

Do not overload the current `GET /process/application?applicant=...` behavior for History, because employee My Applications currently depends on that endpoint returning all statuses.

Preferred new endpoint:

- `GET /api/process/application/history`

Query params:

- `operatorUsername`: required while the project lacks reliable authenticated backend identity for this endpoint. Frontend passes current `localStorage.user.username`; backend uses it to verify Manager permission.
- `employeeUsername`: optional string. Empty, missing, or whitespace means all employees.
- `page`: optional number, default `0`.
- `size`: optional number, default `20` or `50`. Recommendation: `20` for mobile-friendly first load.
- `sort`: optional string, default `submitTime,desc`.

Permission/scope contract:

- Current version: backend authorizes only Manager operators.
- The frontend should pass `operatorUsername` but should not decide the data visibility scope itself.
- The API should remain the same if Team Leader is allowed later. In that future case, backend policy can return a narrower visibility scope for Team Leader, such as only employees in the operator's team/group, while Manager keeps organization-wide access.
- If a future Team Leader selects or requests an employee outside their permitted scope, backend should return `403` or an empty page according to the policy chosen then. This issue should not implement that Team Leader filtering rule.

Request examples:

- All history:
  - `GET /api/process/application/history?operatorUsername=manager1&page=0&size=20&sort=submitTime,desc`
- One employee:
  - `GET /api/process/application/history?operatorUsername=manager1&employeeUsername=jane&page=0&size=20&sort=submitTime,desc`
- Clear filter:
  - frontend keeps `operatorUsername` and omits `employeeUsername`, or sends `employeeUsername=`.

Response with pagination:

```json
{
  "content": [
    {
      "id": 123,
      "applicant": "jane",
      "leaveType": "SICK",
      "submitTime": "2026-05-14T09:30:00-07:00",
      "start": "2026-05-20T09:00:00-07:00",
      "end": "2026-05-20T17:00:00-07:00",
      "currentHandler": "jane",
      "status": "approved",
      "reason": "Medical appointment",
      "rejectReason": null,
      "note": ""
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "sort": "submitTime,desc"
}
```

No results response:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0,
  "sort": "submitTime,desc"
}
```

Compatibility:

- Existing `GET /api/process/application` remains unchanged for Review and My Applications.
- New frontend History uses `GET /api/process/application/history`.
- If Backend_Dev decides to avoid pagination for the first implementation, still keep the endpoint and return `content` wrapper now. That avoids another frontend contract change later.

## 4. Frontend Component and State Plan

Files to modify after approval:

- `app/applications/History.tsx`
- `service/ApplicationService.ts`
- `request/LeaveApplicationRequest.ts`
- `service/UserService.ts` and `request/UserRequest.ts` if adding the employee options wrapper.
- Optional reusable component under `components/applications/EmployeeFilterSelect.tsx` or `components/FreeStyle/EmployeeSelect.tsx`.

Naming and copy guidance:

- Use neutral names such as `getApplicationHistory`, `ApplicationHistoryQuery`, `EmployeeFilterSelect`, `canViewApplicationHistory`, and `historyVisibility`.
- Avoid names such as `getManagerHistory`, `ManagerHistoryQuery`, `ManagerEmployeeFilter`, or UI copy that says the feature is permanently only for managers.
- Current menu/page visibility still follows the existing Manager-only Application menu rule. Team Leader must not see History in this version.
- UI copy should be role-neutral where possible, for example "Employee" / "All employees" / "No history records" rather than "Manager employee filter".

Recommended component hierarchy:

- `History`
  - owns state:
    - `selectedEmployeeUsername: string | null`
    - `employeeOptions: EmployeeOption[]`
    - `applications: LeaveApplication[]`
    - `page`, `size`, `totalPages`, `totalElements`
    - `employeesLoading`, `historyLoading`
    - `employeesError`, `historyError`
  - calls:
    - `getEmployeeOptions({ activeOnly: true })`
    - `getApplicationHistory({ operatorUsername, employeeUsername, page, size, sort })`
  - renders:
    - filter toolbar
    - History cards
    - empty/error/loading states
    - pagination or "Load more" control if pagination is implemented in this feature
- `EmployeeFilterSelect`
  - receives `value`, `options`, `loading`, `error`, `onChange`, `onClear`.
  - option value is `username`.
  - labels should be `name` plus username only when helpful, e.g. `Jane Doe (jane)`.

Dropdown behavior:

- Default selection: all employees.
- Empty value: all employees.
- Clear button resets `selectedEmployeeUsername` to `null`, `page` to `0`, and refetches all history.
- Changing employee resets `page` to `0`.
- Loading employee options: show disabled select/input state or small loading text near the control.
- Employee options error: show a concise error and keep History list usable with "All employees".
- History loading: show loading state without clearing existing content if refetching due to filter change, or show a first-load placeholder if list is empty.
- History error: show retry action.
- Empty data:
  - All employees: "No history records."
  - Selected employee: "No history records for this employee."

Style unification:

- The existing My Applications page has a placeholder `Card` with `Range` and an `Input`, not a functional dropdown. It should not be copied.
- Existing gluestack Select usage in `app/(tabs)/target/index.tsx` is the closest real style:
  - `Select`, `SelectTrigger`, `SelectInput`, `SelectIcon`, `SelectPortal`, `SelectBackdrop`, `SelectContent`, `SelectItem`.
- Prefer extracting a small reusable select wrapper only if Frontend_Dev sees immediate reuse between History and Target. Otherwise, keep History local but match the same gluestack visual language.
- Do not put a filter card inside another card. A compact full-width toolbar above the list is enough.

Future Team Leader compatibility:

- Keep the selected filter value as an employee username, not a manager-specific concept.
- Treat the employee options endpoint as the source of selectable employees visible to the current operator. In this version it will return active employees for Manager use; in a later Team Leader version, backend/frontend can narrow the options to the leader's team without changing the History query shape.
- Do not add client-side assumptions that "All employees" always means every employee in the company. In UI code, it should mean "all employees visible to the current operator"; for the current Manager-only release that equals all employees.

Mobile adaptation:

- Use a vertical toolbar on narrow screens: dropdown full width, clear/retry/load-more controls below or beside only when width allows.
- Keep `HistoryApplicationCard` width responsive. Current fixed `width={360}` risks overflow on small screens; plan should include changing to `width="100%"` with `maxWidth={360}` or container-aware styling.
- Avoid controls that require hover.
- Ensure text labels and selected employee names wrap or truncate cleanly.

## 5. Frontend API Types

Add:

```ts
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string;
}

export interface ApplicationHistoryQuery {
  operatorUsername: string;
  employeeUsername?: string | null;
  page?: number;
  size?: number;
  sort?: string;
}
```

Keep current `LeaveApplication` shape unless Backend_Dev renames fields. Current frontend expects `applicant`, not `employeeUsername`, in each application row.

Optional future-facing type names:

```ts
export interface ApplicationHistoryVisibility {
  canViewHistory: boolean;
  scope: 'ALL_EMPLOYEES' | 'TEAM_MEMBERS';
}
```

This type does not need to be implemented now. It documents the intended boundary: Manager can view all employees; a future Team Leader may view only team members.

## 6. Testing Suggestions

Frontend unit/component tests:

- History initially requests employee options and first page of history.
- Selecting an employee calls history API with `operatorUsername=<managerUsername>` and `employeeUsername=<username>`, then resets page to `0`.
- Clearing the filter calls history API with `operatorUsername=<managerUsername>` and without `employeeUsername`.
- Empty history response renders the correct empty state.
- Employee option load failure does not block all-history view.
- History load failure renders retry.
- Mobile layout does not overflow with long employee names.
- Team Leader does not see the History menu/page in the current release.
- Frontend service/API naming remains role-neutral and does not require renaming if Team Leader is added later.

Frontend manual checks:

- Manager Application -> History all employees.
- Manager selects one employee with approved/rejected records.
- Manager selects employee with no history.
- Clear selection.
- Browser/mobile-width check for dropdown and cards.

## 7. Database / Migration

No database table, field, constraint, or data migration is required for this feature.

Reason: `opb_leave_application.applicant` already stores the employee username used by the current application APIs, and `opb_user.username/name/roles/groupName/active` already supports the employee dropdown.

No SQL is required. Development should not operate on the database for this issue.

Future Team Leader note: if the existing `opb_user.groupName` is accepted as the team boundary, future Team Leader visibility can likely be implemented without a schema change. If the business later needs a many-to-many team membership model or multiple leaders per employee, that should be a separate database-design issue with user-executed SQL.

## Risks / Questions

- The backend currently permits all `GET /**` requests and process endpoints broadly. The plan below asks Backend_Dev to add service-level manager checks for the new History endpoint, but a broader security cleanup may be needed separately.
- Existing roles are string-based and may contain pipe-separated roles such as `Manager|team_leader`; role matching should be consistent with `util/useAuth.ts`.
- Team Leader is explicitly out of scope for this implementation. The design should leave room for Team Leader by keeping role-neutral frontend names and relying on backend visibility policy, but the current UI visibility remains Manager-only.
- Confirm whether inactive employees should appear in the dropdown. Recommendation: active employees only by default; historical records for inactive employees remain visible in "All employees" and can be searched later if needed.
