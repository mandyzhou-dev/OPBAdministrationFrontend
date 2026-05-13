# Shift Status and Paid Sick Leave Cross-Stack Notes

## Purpose

This document records the cross-stack decisions from the shift status / paid sick leave work so the next frontend, backend, or full-stack pass can start from the same contract. It is documentation only; it does not imply database or business-code changes.

## Existing Documentation Layout

- Frontend project: `/Users/marktwain/Projects/OPBOA`
  - `docs/feature_spec/`: feature-level notes.
  - `docs/patch_doc/`: implementation patch notes and handoff details.
  - `plans/`: pre-implementation architecture and task plans.
  - `.codex/skills/`: repo-local Codex skills for repeatable project workflows.
- Backend project: `/Users/marktwain/Projects/OPBAdministrationBackend`
  - `Readme.md`: project setup and backend development notes.
  - `docs/`: backend API and implementation notes.
  - `plans/`: pre-implementation backend architecture plans.
  - `.codex/skills/`: repo-local Codex skills; existing skills document login and employee probation/email workflows.

## Product and Architecture Decisions

- Supported manual status targets for this feature are exactly `no_show`, `paid_sick_leave`, and `unpaid_sick_leave`.
- No `Mark as active` or `Reset status` action is included in the current product scope.
- Existing statuses such as `active` and `cancelled` remain part of the broader shift model where already used.
- `cancelled`, `no_show`, `paid_sick_leave`, and `unpaid_sick_leave` are non-worked statuses.
- Worked-hours statistics and KPI calculations must exclude all non-worked statuses.
- Paid sick leave quota is five calendar days per employee per calendar year after the employee passes the existing 90-day probation rule.
- `bigDay == null` means the employee is not eligible for paid sick leave, matching probation / not eligible behavior.
- Quota is counted by distinct Vancouver local calendar day. Multiple paid sick leave shifts for the same employee on the same Vancouver local date consume one day, not multiple days.
- Business date, quota year, and statistics day boundaries use `America/Vancouver`. Database and Java transport values may remain UTC/global instants, but backend business logic must convert instants to Vancouver local date/year and must not depend on the database session timezone.
- Production `shift.status` is confirmed as `varchar(32)` with no enum/check constraint, so the current feature requires no SQL.

## Frontend Contract

- Schedule cells render status color for both Manager and employee views:
  - `no_show`: gray.
  - `unpaid_sick_leave`: gray.
  - `paid_sick_leave`: pale purple.
- Managers can open the existing shift cell/detail interaction and use a status dropdown for the three manual status targets.
- Employees can see the color state but cannot see or use the status mutation controls.
- Selecting a status must open a confirmation modal; the frontend only sends the PATCH request after the user confirms Yes.
- The detail UI should show paid sick leave quota as `X/5` for eligible employees.
- The paid sick leave option is hardlocked when the employee is not eligible due to probation / missing `bigDay`, or when the employee has already used five paid sick leave calendar days in the current Vancouver year.
- When the selected date already has another paid sick leave shift for that employee, the UI copy should make clear that quota is counted once per calendar day.

## Backend API Contract

- Status update:
  - Method/path: `PATCH /api/shift/shiftarrangement/{id}/status`
  - Body shape: `{ "status": "no_show|paid_sick_leave|unpaid_sick_leave", "operatorUsername": "..." }`
  - Access: Manager-only.
  - Validation: reject status values outside the three current manual targets.
- Paid sick leave quota:
  - Method/path: `GET /api/shift/shiftarrangement/{id}/paid-sick-leave-quota?operatorUsername=...`
  - Access: Manager-only because it supports a Manager editing workflow.
  - Response should expose current used count, annual limit, eligibility, and a reason suitable for hardlock copy.
- Implementation boundary:
  - Controller handles route mapping and request/response DTOs.
  - Service owns Manager authorization, status validation, probation eligibility, quota calculation, and statistics/KPI status filtering.
  - Repository exposes targeted queries for shift lookup and paid sick leave usage; service-level code performs Vancouver local-date distinct counting when UTC/global instants are involved.
  - Use a small `ShiftStatus` constant/enum boundary if one is not already present, rather than scattering string literals.

## CORS and Security Preflight Checklist

When adding or changing a backend endpoint, especially a non-GET method such as PATCH, update all CORS/security layers together:

- Spring Security request authorization must allow the intended method/path for the authenticated role or permit-list shape already used by the project.
- Security CORS allowed methods must include the HTTP method, such as `PATCH`.
- MVC CORS configuration must include the same method and allow `OPTIONS` preflight where required.
- Add or update a preflight test that sends `OPTIONS` with `Origin`, `Access-Control-Request-Method`, and any required request headers.
- In browser verification, inspect Network for both successful `OPTIONS` and the following real `PATCH`.

Example manual preflight check:

```bash
curl -i -m 5 -X OPTIONS 'http://localhost:8080/api/shift/shiftarrangement/2811/status' \
  -H 'Origin: http://localhost:8081' \
  -H 'Access-Control-Request-Method: PATCH' \
  -H 'Access-Control-Request-Headers: content-type'
```

## Verification Commands Captured From This Work

Backend targeted verification:

```bash
mvn test -Dtest=SecurityConfigurationTest,ShiftArrangementControllerCorsTest
mvn package
```

Frontend targeted verification:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.tmp npx jest --runTestsByPath components/__tests__/ShiftStatus-test.js --runInBand --watchAll=false
TMPDIR=/Users/marktwain/Projects/OPBOA/.tmp EXPO_METRO_CACHE_DIRECTORY=/Users/marktwain/Projects/OPBOA/.tmp/metro-cache npx expo export --platform web --output-dir .expo-build-test
git diff --check
```

Known frontend TypeScript status at handoff: `npx tsc --noEmit` still reports pre-existing failures in untouched files including `app/applications/Regulations.tsx`, `app/setPassword.tsx`, `components/applications/ReviewModal.tsx`, and `components/FreeStyle/RequiredFormControl.tsx`.

## Risks and Follow-Up Notes

- Do not operate on the database directly. Current SQL judgment is no SQL required because production `status` is plain `varchar(32)` without enum/check constraints.
- If a future environment introduces a database enum/check constraint for `shift.status`, that environment will need user/DBA-run SQL before the new status values can be used.
- Backend authorization currently depends on the project’s existing Manager/operator patterns; future hardening should avoid expanding scope beyond the established auth model unless explicitly requested.
- Browser testing must include real CORS behavior; server-side unit tests alone do not prove the frontend origin can PATCH successfully.
- Any future change to business-day semantics must explicitly preserve `America/Vancouver` local date/year behavior for quota and statistics unless the user changes the business rule.
