# Sick Leave Proof Upload Cross-Stack Plan

Issue: MAN-27 / `901e2491-77ca-4307-96e7-32c9babca73f`

Scope: planning only. Do not write code and do not execute database changes.

Frontend repo: `/Users/marktwain/Projects/OPBOA`

Backend repo: `/Users/marktwain/Projects/OPBAdministrationBackend`

## Goal

Sick leave application cards need a separate proof submission entry with clear submitted/unsubmitted indicators. If proof is not submitted, the employee card must show an immediately visible English prompt. Employees can upload proof files, and successful upload must mark the proof as submitted immediately. The upload entry remains available after submission so employees can replace/reupload proof. Employees and admins do not need in-system proof preview/download.

Sick leave also needs two email notifications using the existing backend mail implementation:

- After an employee submits a sick leave application, email that employee asking them to submit proof for the relevant leave time within three days.
- After an employee successfully uploads proof, email HR saying who submitted proof for which leave time and asking HR to check the OPB site for the leave/proof-submitted status. HR recipients for this workflow are `raynold` and `agnes`. This does not add in-system proof preview/download.

## Recommended Approach

Persist proof-submission metadata in a normalized child table, `opb_leave_application_proof`, store uploaded files under the already configured `uploads.sick-proof-dir` path, and return proof status fields on the existing `LeaveApplication` API shape. This keeps `opb_leave_application` focused on fields shared by all leave types, while proof remains a one-to-zero-or-one child resource of a leave application.

Use one current proof row per leave application, not a full proof history table. Current requirements only need the latest submitted state and latest saved-file metadata. If future requirements need every reupload version, add a separate proof upload history table later.

## Backend Plan

### API Endpoints

Add one upload endpoint under the existing leave application boundary:

```http
POST /api/process/application/{applicationID}/sick-proof
Content-Type: multipart/form-data
```

Request parts:

```text
proof: File, required
applicant: string, optional but recommended until real request authentication is enforced
```

`applicant` should be the logged-in frontend username. Because current backend security broadly permits process endpoints and does not enforce JWT request identity, service-level validation should reject the upload when a nonblank `applicant` does not match the leave application's `applicant`. If/when JWT enforcement exists, replace this with token identity.

Response: return the updated `LeaveApplication` entity/DTO using the same shape as existing application list responses, with the new proof fields included. Returning the full application lets the frontend update one card without immediately refetching the full list.

Example success response:

```json
{
  "id": 123,
  "applicant": "employee1",
  "leaveType": "SICK",
  "submitTime": "2026-06-01T12:30:00-07:00",
  "start": "2026-06-03T09:00:00-07:00",
  "end": "2026-06-03T17:00:00-07:00",
  "currentHandler": "raynold,agnes",
  "status": "pending",
  "reason": "Feeling sick",
  "rejectReason": null,
  "note": null,
  "canDelete": true,
  "sickProofRequired": true,
  "sickProofSubmitted": true,
  "sickProofUploadedAt": "2026-06-01T13:05:27-07:00",
  "sickProofOriginalFilename": "doctor-note.pdf"
}
```

Existing read endpoints must include these fields:

- `GET /api/process/application?applicant=...`
- `GET /api/process/application?handler=...`
- `GET /api/process/application`
- `GET /api/process/application/history?...`
- `PUT /api/process/application/leave-application`

For newly submitted leave applications, initialize proof state as:

- `sickProofRequired = true` when `leaveType` equals `SICK`, case-insensitive.
- `sickProofSubmitted = false`.
- Insert one `opb_leave_application_proof` row with `status = "REQUIRED"` for sick leave applications.
- Do not insert a proof row for non-sick leave applications.
- proof metadata fields remain `null` until a successful upload.

### DTO / Entity Changes

Add a new backend JPA entity, for example `LeaveApplicationProofDO`, mapped to `opb_leave_application_proof`.

Fields:

- `applicationId: Integer`
- `proofType: String`
- `status: String`
- `uploadedAt: ZonedDateTime`
- `originalFilename: String`
- `storedFilename: String`
- `contentType: String`
- `fileSizeBytes: Long`
- `createdAt: ZonedDateTime`
- `updatedAt: ZonedDateTime`

Backend `LeaveApplication` response fields:

- `sickProofRequired: boolean`
- `sickProofSubmitted: boolean`
- `sickProofUploadedAt: ZonedDateTime | null`
- `sickProofOriginalFilename: String | null`

Do not expose the stored path or stored filename to the frontend because the system does not support viewing proof.

Backend derivation:

- `sickProofRequired = leaveType.equalsIgnoreCase("SICK")`
- `sickProofSubmitted = proof row exists and proof.status == "SUBMITTED"`
- `sickProofUploadedAt = proof.uploadedAt`
- `sickProofOriginalFilename = proof.originalFilename`
- If a legacy sick leave application has no proof row, treat it as `sickProofRequired = true`, `sickProofSubmitted = false`.

### Validation

Service-level validation for upload:

- `applicationID` must exist, otherwise `404 Not Found`.
- The leave application must be sick leave: `leaveType.equalsIgnoreCase("SICK")`, otherwise `400 Bad Request`.
- If `applicant` is supplied, it must match the application applicant exactly after trimming, otherwise `403 Forbidden`.
- File must be present and nonempty, otherwise `400 Bad Request`.
- File size should be capped at `10 MB` for this workflow even though Spring multipart config currently allows larger requests. Medical proof is normally small, and a feature-local limit avoids accidental large uploads.
- Allowed extensions and MIME types:
  - PDF: `.pdf`, `application/pdf`
  - PNG: `.png`, `image/png`
  - JPEG: `.jpg`, `.jpeg`, `image/jpeg`
  - WebP: `.webp`, `image/webp`
  - HEIC/HEIF: `.heic`, `.heif`, `image/heic`, `image/heif`
- Reject executable, archive, Office document, and unknown binary formats.
- Normalize and sanitize the original filename for metadata only. Never use the client filename directly as the storage filename.

### File Storage

Use the already configured Spring property:

```yaml
uploads:
  sick-proof-dir: {{sickProofDir}}
```

Implementation should inject it with:

```java
@Value("${uploads.sick-proof-dir}")
```

Storage path approach:

```text
{sick-proof-dir}/{applicationID}/{yyyyMMddHHmmssSSS}_{uuid}.{ext}
```

Example:

```text
/configured/sick-proof-dir/123/20260601130527123_7f6a4b0e-9d42-4b19-bc4b-620ad0d64bb0.pdf
```

Rules:

- Resolve and normalize paths with `Path`.
- Create the `{applicationID}` subdirectory if missing.
- Confirm the final normalized target path starts with normalized `sick-proof-dir`.
- Use `Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING)` only for the generated unique target.
- Store only the generated relative filename/subpath and metadata in DB.
- Do not delete older proof files on reupload unless a future retention policy requires cleanup. Reupload updates DB metadata to the latest proof and leaves older files on disk.

### Service / Repository Responsibilities

Add a focused service method on `LeaveApplicationService` or a small collaborator such as `SickLeaveProofStorageService`:

```java
LeaveApplication uploadSickProof(Integer applicationID, String applicant, MultipartFile proof)
```

Responsibilities:

- `LeaveApplicationController`: bind multipart request and delegate.
- `LeaveApplicationService`: load application, enforce sick leave/applicant/state validation, coordinate application/proof persistence, and return response DTO/entity enriched with proof status.
- `SickLeaveProofStorageService` if added: file validation, extension/MIME mapping, safe path generation, directory creation, physical file write.
- `LeaveApplicationEmailNotificationService` or an updated `EmailNotificationConsumer`: build and send sick-proof reminder and HR proof-submitted emails through `WebhookEmailService`. The proof-submitted email must resolve HR recipients independently of `currentHandler`.
- `LeaveApplicationRepository`: continue owning `opb_leave_application`.
- `LeaveApplicationProofRepository`: own `opb_leave_application_proof`, including lookup by `applicationId`, save/update, and optional bulk lookup for application lists.
- `LeaveApplication.fromDO` / mapping layer: map common application fields from `LeaveApplicationDO` and proof response fields from `LeaveApplicationProofDO`.

Creation flow:

1. Save `LeaveApplicationDO`.
2. If `leaveType` is `SICK`, create `LeaveApplicationProofDO(applicationId = saved.id, proofType = "SICK_LEAVE_PROOF", status = "REQUIRED")`.
3. Return `LeaveApplication` with `sickProofRequired = true`, `sickProofSubmitted = false`.

Upload flow:

1. Load `LeaveApplicationDO` by `applicationID`.
2. Validate it exists, belongs to the applicant when applicant is supplied, and is `SICK`.
3. Load the proof row by `applicationID`; if a legacy sick leave row is missing, create it as `REQUIRED`.
4. Write the file under `uploads.sick-proof-dir`.
5. Update the proof row to `status = "SUBMITTED"`, set `uploadedAt`, `originalFilename`, `storedFilename`, `contentType`, and `fileSizeBytes`.
6. Return `LeaveApplication` enriched from the application row and proof row.

Read flow:

- Existing application list/history endpoints should keep their response shape but enrich each application with proof fields.
- Implementation may use a bulk `findByApplicationIdIn(...)` proof query to avoid N+1 lookups for list/history responses.

### Error Handling

Use `ResponseStatusException` with clear messages:

- `400`: missing file, empty file, unsupported type, file too large, non-sick leave application.
- `403`: applicant mismatch.
- `404`: application not found.
- `500`: storage write failure after logging the exception.

For storage failures, do not update the proof row to `SUBMITTED`. Save proof metadata only after the file write succeeds.

For email failures, do not roll back leave submission or proof upload. The current email queues are in-memory and non-durable, so this plan treats notification delivery as best effort, consistent with the existing leave/resignation notification flows.

### Security / Access Assumptions

Current backend security permits broad `/process/**` access and frontend stores user data in `localStorage`. The practical near-term guard is service-level applicant validation using the submitted `applicant` field. This is not as strong as JWT-backed identity, but it is consistent with the current codebase. Future hardening should validate the applicant from the authenticated principal and remove the request-body/query applicant trust.

Because this adds a browser-facing `POST multipart/form-data` endpoint, verify:

- `SecurityConfiguration` permits `POST /process/**` already.
- CORS allows `POST` and multipart requests from the frontend origin.
- Add or update controller/CORS tests if existing preflight tests do not cover this route.

### Email Notification Plan

Use the existing active backend mail path:

- `WebhookEmailService.sendEmail(recipient, subject, content)`
- Existing leave queue/consumer pattern in `ApplicationStatusChangeMessageQueue` and `EmailNotificationConsumer`
- `UserRepository.getUserDOByUsernameAndActiveIsTrue(...)` to resolve employee and HR emails

Do not use `ca.openbox.process.service.EmailService` for this feature; its Graph/SMTP send implementations are commented out. The active application flows use `WebhookEmailService`.

#### Employee reminder after sick leave submission

Trigger: after `PUT /api/process/application/leave-application` successfully saves a new application, only when `leaveType` is `SICK` case-insensitive.

Recipient: the applicant's active user email from `opb_user.email`.

Recommended subject:

```text
Sick Leave Proof Required
```

Recommended body:

```text
Please submit proof within 3 days for your sick leave from {start} to {end}. Please log on to https://openbox.brimon.ca/ to upload your proof.
```

Date formatting should follow the existing leave notification formatter: `MMM d, yyyy h:mm a`, `Locale.US`.

Delivery behavior:

- Saving the leave application remains the source of truth; email failure must not roll back the application.
- Prefer queue-based/asynchronous delivery consistent with the current leave notification consumer.
- If the applicant has no active user row or no email, log and skip this reminder rather than failing submission.

Implementation options:

- Minimal change: extend the existing leave notification consumer so a queued sick leave submission sends both the current handler review email and the applicant proof reminder.
- Cleaner change: replace the single-purpose queue payload with a small event DTO such as `LeaveApplicationEmailEvent` with `type = LEAVE_SUBMITTED` or `SICK_PROOF_UPLOADED`, then keep one leave-email consumer responsible for all leave-related mail.

The cleaner event DTO is preferred if Backend_Dev is already touching this area, because the proof-upload HR email is a different event from a normal leave submission.

#### HR notification after proof upload

Trigger: after `POST /api/process/application/{applicationID}/sick-proof` successfully writes the file and saves the proof row with `status = "SUBMITTED"`.

Recipients: fixed HR usernames `raynold` and `agnes`, resolved through the existing active-user lookup and `WebhookEmailService` email path.

Do not resolve this notification from the leave application's `currentHandler`. `currentHandler` is workflow routing state used by review/list queries, and approved applications may have `currentHandler` set to the applicant. Using it for proof-upload email would send the notification to the wrong person and would also encourage mutating workflow state just to control email delivery.

Implementation method: add a dedicated recipient resolver for the `SICK_PROOF_UPLOADED` event, for example `sendToSickProofHrRecipients(...)` or `resolveSickProofHrRecipients()`, with the HR username list `["raynold", "agnes"]`. Reuse the existing user lookup behavior that tries the raw username token first and trimmed fallback second, so both exact usernames and comma-separated formatting remain robust. Keep `sendToHandlers(...)` only for leave-submission review notifications.

Recommended subject:

```text
Sick Leave Proof Submitted - {applicant}
```

Recommended body:

```text
{applicant} has submitted proof for sick leave from {start} to {end}. Please log on to https://openbox.brimon.ca/ to check the leave application status.
```

Delivery behavior:

- Only send after the file write and DB metadata save both succeed.
- Reuploads should also send the HR notification because the upload entry remains available and HR should know a new proof was submitted.
- Email failure must not undo a successful proof upload. Log the failure and keep the response successful if storage and DB update succeeded.
- Keep the existing 20-second spacing between multiple recipient emails unless Backend_Dev refactors the consumer more broadly.

Email testing expectations:

- Sick leave submission queues/sends an employee proof reminder.
- Non-sick leave submission does not send a proof reminder.
- Proof upload queues/sends HR notification to `raynold` and `agnes` after metadata save.
- Proof upload notification does not use `currentHandler`, including approved applications whose `currentHandler` is the applicant.
- Applicant missing email does not fail sick leave submission.
- One invalid HR email lookup does not prevent the other HR email from being attempted where practical.
- Email body includes applicant and formatted leave start/end times.

## Frontend Plan

### Component Hierarchy

Use the existing employee applications flow:

```text
app/applications/MyApplications.tsx
  -> components/applications/ApplicationCardforE.tsx
      -> SickProofSubmissionSection.tsx (new focused component)
```

Keep proof UI inside the sick leave card, not in the details modal, because the unsubmitted prompt must be immediately visible.

### TypeScript Model / Request Changes

Extend `model/LeaveApplication.ts`:

```ts
sickProofRequired?: boolean;
sickProofSubmitted?: boolean;
sickProofUploadedAt?: Date | string;
sickProofOriginalFilename?: string;
```

Add request method in `request/LeaveApplicationRequest.ts`:

```ts
uploadSickProof(applicationId: number, applicant: string, file: File | BlobLike): Promise<LeaveApplication>
```

Add service wrapper in `service/ApplicationService.ts`:

```ts
uploadSickProof(applicationId: number, applicant: string, file: File | BlobLike): Promise<LeaveApplication>
```

For web, use an `<input type="file">`-style file selection or Ant Design `Upload` if compatible with the Expo web setup. Since `expo-document-picker` is not currently in `package.json`, do not add native document picking unless mobile-native upload is explicitly required. The current app is React Native Web, so web upload is the practical first target.

Build `FormData`:

```text
proof: selected file
applicant: current localStorage user.username
```

Set `Content-Type` by letting axios/browser generate the multipart boundary; do not hard-code a manual multipart boundary.

### Card UI States And Visual Treatment

Only render the proof section when `leaveType` is `SICK` or `sickProofRequired === true`.

The sick proof UI should be a compact in-card treatment bar, not a large upload panel. Place it directly below the application `status` pill and above the `Comment` section with `marginTop: 12px`. Do not put it in the Details modal and do not move it to the card footer.

Shared proof bar structure:

- Container: `padding: 10px 12px`, `borderRadius: 8px`, `borderWidth: 1px`.
- Keep the proof bar visually subordinate to the main application status and leave type.
- Proof pill height: `24px`, horizontal padding `8px`, radius `999px`, matching the existing application status pill proportions.
- Wide layout: `HStack` with text group and button, `justifyContent: "space-between"`.
- Narrow layout or wrapped content: switch to `VStack`; button becomes `width: "100%"`.
- Keep the proof section around 92px tall where possible. Do not show file previews, download/view links, or the full accepted-format list in the card.

Unsubmitted state:

- Status pill: `Proof required`
- Container colors: background `#FFFBEB`, border `#FCD34D`.
- Pill colors: background `#FEF3C7`, text `#92400E`.
- Main prompt text: `Please upload your sick leave proof.`
- Prompt text style: color `#78350F`, `fontSize: 14px`, `fontWeight: 600`, `lineHeight: 20px`.
- Helper text: `PDF or image files up to 10 MB.`
- Helper style: small secondary text, preferably `fontSize: 12px`.
- Upload entry/button: `Upload proof`.

Submitted state:

- Status pill: `Proof submitted`
- Container colors: background `#F0FDF4`, border `#86EFAC`.
- Pill colors: background `#DCFCE7`, text `#166534`.
- Supporting text: `Proof uploaded. You can upload again if needed.`
- Supporting text style: color `#166534`, `fontSize: 13px`; keep it lighter than the main application status.
- If `sickProofUploadedAt` exists: show `Last uploaded: YYYY-MM-DD HH:mm`.
- Upload entry/button remains visible with label `Upload again`.

Upload button:

- Use outline/secondary styling, not a solid primary button.
- Desktop height: `36px`.
- Touch/narrow layout: `minHeight: 44px`.
- Labels: `Upload proof`, `Upload again`, and loading `Uploading...`.

Filename display:

- Show selected/latest filename below the helper text when useful.
- Style: `fontSize: 12px`, color `#4B5563`, `maxWidth: "100%"`.
- Use `numberOfLines={1}` and `ellipsizeMode="middle"` so long names do not push the button or hide the extension.

Uploading state:

- Disable the upload button.
- Show `Uploading...`.
- Keep the proof bar dimensions stable enough that cards do not jump heavily in a wrapped grid.

Success state:

- Replace the application in `applicationList` with the upload response.
- Show a short success toast: `Proof uploaded successfully.`
- The card should immediately switch to `Proof submitted` without waiting for a full page reload.

Error state:

- Unsupported file type before upload: `Please choose a PDF or image file.`
- Too large before upload: `File size must be 10 MB or less.`
- Backend validation error: show backend message where available, otherwise `Failed to upload proof. Please try again.`
- Do not use a blocking alert for upload errors.
- Show inline error text at the bottom of the proof bar.
- Error text style: color `#B91C1C`, `fontSize: 12px`, `marginTop: 6px`.
- Keep selected card interactive after failure.

Accepted file types remain PDF, PNG, JPG/JPEG, WEBP, HEIC, and HEIF in the file selector and validation logic. The card copy intentionally says only `PDF or image files up to 10 MB.` to keep the 350px card compact.

### Mobile / Responsive Considerations

- The proof prompt must be visible inside the card without opening Details.
- Use stacked layout on narrow cards: status pill, prompt/helper, file name, upload button.
- Avoid long filenames overflowing; use middle ellipsis and preserve the file extension when possible.
- Upload button min height should stay touch-friendly, at least `44px`.
- Keep the existing card `maxWidth={350}` and wrapped card layout, but allow the proof section to wrap naturally on mobile widths.
- Do not hide the upload entry after submission.

## Data Contract

### LeaveApplication response fields needed by frontend

```ts
interface LeaveApplication {
  id?: number;
  applicant?: string;
  start?: string | Date;
  end?: string | Date;
  leaveType?: string;
  submitTime?: string | Date;
  currentHandler?: string;
  status?: string;
  canDelete?: boolean;
  rejectReason?: string;
  reason?: string;
  note?: string;

  sickProofRequired?: boolean;
  sickProofSubmitted?: boolean;
  sickProofUploadedAt?: string | Date | null;
  sickProofOriginalFilename?: string | null;
}
```

Backend derivation:

- `sickProofRequired = leaveType.equalsIgnoreCase("SICK")`
- `sickProofSubmitted = proof row exists and proof.status == "SUBMITTED"`
- `sickProofUploadedAt = proof.uploadedAt`
- `sickProofOriginalFilename = proof.originalFilename`, sanitized for display only
- For non-sick leave, `sickProofRequired = false` and `sickProofSubmitted = false`.
- For sick leave with no proof row because of legacy data, `sickProofRequired = true` and `sickProofSubmitted = false`.

Frontend rendering rule:

```ts
const isSickLeave = application.sickProofRequired === true || application.leaveType?.toUpperCase() === "SICK";
const proofSubmitted = application.sickProofSubmitted === true;
```

### Upload response

Return the same `LeaveApplication` interface after successful upload. Required post-upload values:

```json
{
  "id": 123,
  "sickProofRequired": true,
  "sickProofSubmitted": true,
  "sickProofUploadedAt": "2026-06-01T13:05:27-07:00",
  "sickProofOriginalFilename": "doctor-note.pdf"
}
```

Other existing fields should remain present so the frontend can replace the card model directly.

## Database Change Required

Yes. This feature requires a new normalized child table for proof-submission state and latest proof metadata. The user must execute SQL. Agents must not execute database changes.

Recommended MySQL migration, step 1: create the proof table:

```sql
CREATE TABLE opb_leave_application_proof (
  application_id INT NOT NULL,
  proof_type VARCHAR(50) NOT NULL DEFAULT 'SICK_LEAVE_PROOF',
  status VARCHAR(20) NOT NULL DEFAULT 'REQUIRED',
  uploaded_at DATETIME(6) NULL,
  original_filename VARCHAR(255) NULL,
  stored_filename VARCHAR(512) NULL,
  content_type VARCHAR(100) NULL,
  file_size_bytes BIGINT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (application_id),
  CONSTRAINT fk_leave_application_proof_application
    FOREIGN KEY (application_id)
    REFERENCES opb_leave_application (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_leave_application_proof_type
    CHECK (proof_type = 'SICK_LEAVE_PROOF'),
  CONSTRAINT chk_leave_application_proof_status
    CHECK (status IN ('REQUIRED', 'SUBMITTED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_leave_application_proof_type_status
  ON opb_leave_application_proof (proof_type, status);
```

Recommended MySQL migration, step 2: backfill existing sick leave records:

Run this after the table is created so existing `SICK` leave applications also get `REQUIRED` proof rows. It is idempotent because it skips applications that already have proof rows.

```sql
INSERT INTO opb_leave_application_proof (
  application_id,
  proof_type,
  status,
  created_at,
  updated_at
)
SELECT
  leave_application.id,
  'SICK_LEAVE_PROOF',
  'REQUIRED',
  CURRENT_TIMESTAMP(6),
  CURRENT_TIMESTAMP(6)
FROM opb_leave_application leave_application
LEFT JOIN opb_leave_application_proof proof
  ON proof.application_id = leave_application.id
WHERE UPPER(leave_application.leave_type) = 'SICK'
  AND proof.application_id IS NULL;
```

Notes:

- This migration does not add sick-only columns to `opb_leave_application`.
- `application_id` is both the primary key and foreign key, so each leave application can have at most one current proof row.
- Non-sick leave applications have no proof row.
- Existing sick leave applications are backfilled as `REQUIRED` by the recommended backfill SQL.
- MySQL 8 enforces `CHECK` constraints. If the deployed MySQL version does not enforce them, backend service validation remains authoritative for `proof_type` and `status`.

Rollback SQL if needed before implementation:

```sql
DROP TABLE IF EXISTS opb_leave_application_proof;
```

## Backend_Dev Task Breakdown

1. Confirm SQL was executed by the user before backend code depending on `opb_leave_application_proof` is deployed.
2. Add `LeaveApplicationProofDO` mapped to `opb_leave_application_proof`.
3. Add `LeaveApplicationProofRepository` with lookup by `applicationId`, save/update, and optional bulk lookup by application IDs.
4. Add proof response fields to `LeaveApplication` and map them from `LeaveApplicationProofDO`, not from `LeaveApplicationDO`.
5. Update sick leave application creation so a proof row is created with `status = "REQUIRED"` after the leave application row is saved.
6. Add upload DTO/response handling if the team prefers DTOs over returning entity directly.
7. Add `SickLeaveProofStorageService` or focused private helpers for validation, safe file naming, and storage under `uploads.sick-proof-dir`.
8. Add `POST /application/{applicationID}/sick-proof` to `LeaveApplicationController`.
9. Add `uploadSickProof` service method with validation, proof row lookup/create for legacy sick leave rows, file write, and proof row update to `SUBMITTED`.
10. Add sick leave submission reminder email behavior using `WebhookEmailService` and the existing leave notification queue/consumer pattern.
11. Add proof-upload HR notification behavior after successful file write and proof row metadata save. For `SICK_PROOF_UPLOADED`, send to the fixed HR usernames `raynold` and `agnes` via a dedicated resolver; do not use or mutate `currentHandler` for this email.
12. Update existing application list/history endpoints to enrich applications with proof fields, preferably with a bulk proof lookup to avoid N+1 queries.
13. Add unit tests for service validation: missing app, non-sick app, applicant mismatch, empty file, unsupported type, oversized file, successful upload, reupload updates the same proof row, and legacy sick leave row without proof row.
14. Add email tests for sick leave reminder, non-sick no-op, HR proof-upload notification to `raynold` and `agnes`, proof-upload notification not using `currentHandler`, missing email handling, and body date formatting.
15. Add controller tests for multipart upload success/failure and CORS/preflight coverage if missing.
16. Run targeted backend verification: leave application service/controller tests and `mvn test` if feasible.

## Frontend_Dev Task Breakdown

1. Extend `LeaveApplication` TypeScript model with proof fields.
2. Add `uploadSickProof` request/service wrapper using `FormData`.
3. Add a focused `SickProofSubmissionSection` component.
4. Render the proof section inside `ApplicationCardforE` only for sick leave applications.
5. Add file picker/upload control with accepted formats `.pdf,.png,.jpg,.jpeg,.webp,.heic,.heif`.
6. Add client-side validation for max 10 MB and supported formats.
7. In `MyApplications`, pass an upload callback to the card and replace the updated application in `applicationList` after success.
8. Implement loading, success, and error states without hiding the upload entry after submission.
9. Ensure mobile/narrow card layout wraps correctly and long filenames do not overflow.
10. Add focused tests for unsubmitted prompt, submitted state, upload button remaining after submitted state, success replacement, and upload error handling.
11. Run targeted frontend Jest tests for application card/request behavior.

## Acceptance Criteria

- Sick leave cards with no proof show `Please upload your sick leave proof.` visibly on the card.
- Sick leave cards with proof show `Proof submitted` and still show an upload/reupload entry.
- Uploading a supported file saves it under `uploads.sick-proof-dir`.
- Successful upload updates the `opb_leave_application_proof` row to `status = "SUBMITTED"` and sets `uploaded_at`.
- Sick leave submission sends the employee a proof reminder email asking for proof within three days and naming the leave time.
- Successful proof upload sends HR users `raynold` and `agnes` an email naming the employee and leave time and asking them to check the OPB site for the leave/proof-submitted status.
- Frontend card updates immediately after successful upload.
- Non-sick leave cards do not show sick proof UI.
- Non-sick leave applications do not create proof rows.
- Employees/admins cannot view/download proof through this feature.
- No database changes are executed by agents; the user receives complete SQL to run.
