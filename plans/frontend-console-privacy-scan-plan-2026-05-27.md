# Frontend Console Privacy Scan Plan

## Objective

Scan the frontend project for `console.log` and similar debug output that may expose employee private information, especially home address and phone number fields. This is a review-only task: do not change code during the scan.

## Scope

Project root:

- `/Users/marktwain/Projects/OPBOA`

Primary source paths to scan:

- `app/`
- `components/`
- `constants/`
- `model/`
- `request/`
- `service/`
- `util/`
- root config/source files such as `app.json`, `babel.config.js`, `expo-env.d.ts`, `tsconfig.json`

Exclude generated, dependency, cache, and local runtime artifacts unless a source import points to them:

- `node_modules/`
- `dist/`
- `.expo/`
- `.expo-tmp/`
- `.chrome-profile/`
- `.tmp/`
- `.jest-tmp/`
- `.screenshots/`
- `.git/`

## Search Keywords

### Debug Output APIs

Use `rg --line-number --column` from `/Users/marktwain/Projects/OPBOA`.

```bash
rg --line-number --column --glob '!node_modules/**' --glob '!dist/**' --glob '!.expo/**' --glob '!.expo-tmp/**' --glob '!.chrome-profile/**' --glob '!.tmp/**' --glob '!.jest-tmp/**' --glob '!.screenshots/**' --glob '!.git/**' '\bconsole\.(log|debug|info|warn|error|trace|table|dir)\b|\bdebugger\b'
```

Also check common indirect debug patterns:

```bash
rg --line-number --column --glob '!node_modules/**' --glob '!dist/**' --glob '!.expo/**' --glob '!.expo-tmp/**' --glob '!.chrome-profile/**' --glob '!.tmp/**' --glob '!.jest-tmp/**' --glob '!.screenshots/**' --glob '!.git/**' 'JSON\.stringify\(|alert\(|window\.alert\(|LogBox|logger|debug\('
```

### Privacy Field Keywords

Run a privacy-field search to understand which fields and models exist, then cross-check any hits near debug output:

```bash
rg --line-number --column --glob '!node_modules/**' --glob '!dist/**' --glob '!.expo/**' --glob '!.expo-tmp/**' --glob '!.chrome-profile/**' --glob '!.tmp/**' --glob '!.jest-tmp/**' --glob '!.screenshots/**' --glob '!.git/**' -i 'address|home.?address|street|city|province|postal|zip|phone|telephone|mobile|cell|contact|emergency|email|sin|ssn|dob|birth|birthday|family|relative|spouse|dependent'
```

Use the model files as a field dictionary, especially:

- `model/User.ts`
- `model/Employment.ts`
- `model/RegisterInfo.ts`
- `model/TerminateInfo.ts`
- application and resignation models under `model/`
- request DTOs under `request/`

## Review Method

1. Collect all debug-output hits with file, line, column, and surrounding context.
2. For each hit, inspect the full statement, including multiline arguments and variables passed into helper functions.
3. Trace each logged variable back to its source:
   - API responses from `service/` or `request/`
   - React state values
   - component props
   - form values
   - model or DTO objects
4. Classify whether the log can print a full employee object, registration object, employment object, application object, API response, form payload, or error object containing request/response data.
5. Cross-check the logged object shape against privacy keywords. Do not rely only on the literal log line; `console.log(user)` is risky if `User` includes phone/address fields.
6. Treat `console.warn`, `console.error`, and `console.info` the same as `console.log` if they include object payloads or API errors. Error objects can expose `config`, `request`, `response`, or form data.
7. If a log is inside tests under `components/__tests__/`, mark it separately as test-only. It is lower risk, but still report if it prints real fixture-like personal data.
8. Do not modify code, database schema, DTO fields, constraints, or data. If a finding appears to require backend or database changes, stop and report the required SQL for user execution before any implementation.

## Judgment Standard

Report as a finding when any debug output:

- Directly logs privacy fields such as address, phone, mobile, contact, emergency contact, birth date, family member, email, SIN/SSN, or full employee identity records.
- Logs a whole object that may contain privacy fields, such as `user`, `employee`, `employment`, `registerInfo`, `formData`, `payload`, `response.data`, `application`, or `resignationApplication`.
- Logs API errors where the error object may include request body, response body, headers, or config containing employee private data.
- Logs arrays or tables of employees, applications, schedules, or form submissions that include or can include private fields.

Do not report as a privacy leak when:

- The log only prints static non-sensitive strings.
- The log prints UI-only status values, route names, booleans, counts, or dates with no employee identity or private fields.
- The line is in generated/dependency/cache output that is excluded from scope.

Use severity:

- `High`: Directly logs phone/address/private identifiers or full API/form payloads containing those fields.
- `Medium`: Logs whole employee/user/application objects where privacy fields are plausible but not confirmed from the local type.
- `Low`: Debug output exists but appears limited to non-sensitive metadata; recommend cleanup only if project policy forbids debug logs.

## Final Report Format

Frontend_Dev should post the result in this structure:

```md
## Console Privacy Scan Result

Scope: `/Users/marktwain/Projects/OPBOA`
Excluded: `node_modules/`, `dist/`, `.expo/`, `.expo-tmp/`, `.chrome-profile/`, `.tmp/`, `.jest-tmp/`, `.screenshots/`, `.git/`
Code changes made: No
Database changes needed: No

### Findings

| Severity | File:Line | Output API | Logged value | Privacy risk | Evidence |
| --- | --- | --- | --- | --- | --- |
| High/Medium/Low | `path/to/file.tsx:123` | `console.log` | `response.data` | May include employee phone/address | Explain traced source/type |

If no issues are found:

No `console.log` or similar debug output was found that directly logs, or plausibly logs, employee home address, phone number, or related private fields.

### Debug Output Inventory

List all reviewed debug-output hits, including safe ones, with a one-line reason for each classification.

### Follow-Up Recommendation

State whether Frontend_Dev should remove/redact any specific lines in a separate implementation step. Do not include code patches in the scan report unless separately requested.
```
