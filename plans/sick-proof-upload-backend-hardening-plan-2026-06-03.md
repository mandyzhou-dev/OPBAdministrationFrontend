# Sick Proof Upload Backend Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor sick leave proof upload so the backend uses server-authoritative file validation, safe storage, after-commit side effects, and realistic multipart tests instead of patching one upload edge case at a time.

**Architecture:** Keep the existing endpoint and response contract, but split upload into clear backend responsibilities: request binding, ownership/application validation, file policy/detection, safe storage, proof metadata persistence, and after-commit email event publishing. Do not trust browser multipart MIME as an allow decision; use extension plus file signature detection and store normalized metadata only.

**Tech Stack:** Spring Boot 3.2.3, Spring MVC multipart, Spring Data JPA, JUnit 5, Mockito, Spring MockMvc, Java NIO `Path`/`Files`.

---

## Scope And Non-Goals

This is a backend cleanup plan for `/Users/marktwain/Projects/OPBAdministrationBackend`. It should not change the frontend UI. The existing frontend may keep calling:

```http
POST /api/process/application/{applicationID}/sick-proof
multipart/form-data parts:
- proof
- applicant
```

Do not expose stored proof paths in normal frontend `LeaveApplication` API responses. The stored absolute path may continue to be included only in the internal HR email body because the user explicitly requested that email content.

Do not add preview/download support. Do not add proof version history. Do not execute database migrations unless the implementation discovers the current table is missing; if SQL is needed, post the SQL for the user instead of running it.

## Current Issues To Correct

- `SickLeaveProofStorageService` still treats image MIME from `MultipartFile.getContentType()` as authoritative. Browser/client MIME is metadata, not proof.
- File validation, storage naming, and stored metadata are mixed in one service without an explicit policy object or result type for detected file type.
- `LeaveApplicationService.uploadSickProof(...)` writes the file and updates DB in a transaction, but does not define cleanup if DB persistence fails after the file was written.
- Email events are queued inside `@Transactional` methods. A consumer can observe and send email before the DB transaction commits.
- Tests rely heavily on `MockMultipartFile` service tests. They need controller-level multipart tests and a real sample PDF regression path.
- Error responses are too generic for debugging: many distinct validation failures return the same `Please choose a PDF or image file.` message.
- Frontend `request/LeaveApplicationRequest.ts` currently sets `Content-Type: multipart/form-data` manually. Backend cannot fix that directly, but controller tests should still prove backend behavior with normal multipart requests and the issue should be flagged if boundary problems persist.

## Target File Responsibilities

Backend files to modify or create:

- Create `src/main/java/ca/openbox/process/service/proof/SickProofFileType.java`
  - Enum for allowed proof types: PDF, PNG, JPEG, WEBP, HEIC, HEIF.
  - Own extension list, canonical content type, and byte-signature matching.
- Create `src/main/java/ca/openbox/process/service/proof/SickProofValidationResult.java`
  - Immutable value object containing original filename, sanitized filename, extension, detected file type, canonical content type, file size.
- Create `src/main/java/ca/openbox/process/service/proof/SickProofFilePolicy.java`
  - Server-authoritative validation: present/nonempty, max size, extension, signature match, clear error messages.
  - Reads only a bounded prefix for signature detection.
- Modify `src/main/java/ca/openbox/process/service/SickLeaveProofStorageService.java`
  - Delegate validation to `SickProofFilePolicy`.
  - Generate storage names using detected type extension.
  - Return canonical content type rather than raw client MIME.
  - Add best-effort delete method for cleanup.
- Modify `src/main/java/ca/openbox/process/service/StoredSickLeaveProof.java`
  - Keep stored relative filename, absolute stored path, sanitized original filename, canonical content type, file size.
- Modify `src/main/java/ca/openbox/process/service/LeaveApplicationService.java`
  - Keep business validation here: application exists, sick leave only, applicant match, proof row state.
  - Use after-commit publishing for sick proof email events.
  - Delete newly stored file if DB save fails after physical write.
- Create `src/main/java/ca/openbox/process/service/components/AfterCommitEventPublisher.java`
  - Tiny component/wrapper around `TransactionSynchronizationManager` so event queueing is testable.
- Modify `src/main/java/ca/openbox/process/service/components/ApplicationStatusChangeMessageQueue.java`
  - No behavioral expansion beyond existing queue API unless needed by tests.
- Keep `src/main/java/ca/openbox/infrastructure/email/service/WebhookEmailService.java`
  - Continue using Jackson serialization; do not revert to manual JSON string building.
- Add or modify tests:
  - `src/test/java/ca/openbox/process/service/proof/SickProofFilePolicyTest.java`
  - `src/test/java/ca/openbox/process/service/SickLeaveProofStorageServiceTest.java`
  - `src/test/java/ca/openbox/process/service/LeaveApplicationServiceSickProofTest.java`
  - `src/test/java/ca/openbox/process/controller/LeaveApplicationControllerSickProofMultipartTest.java`
  - `src/test/java/ca/openbox/process/service/components/AfterCommitEventPublisherTest.java`

## Accepted File Rules

Backend acceptance is:

- Size: `0 < size <= 10 * 1024 * 1024` bytes.
- Extension: case-insensitive `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.heic`, `.heif`.
- Content: must match the expected signature for the extension:
  - PDF: `%PDF-`
  - PNG: `89 50 4E 47 0D 0A 1A 0A`
  - JPEG: `FF D8 FF`
  - WebP: `RIFF....WEBP`
  - HEIC/HEIF: ISO BMFF `ftyp` at byte offset 4 with compatible brands such as `heic`, `heix`, `hevc`, `hevx`, `mif1`, `msf1`
- Client MIME is not used to allow the file. It may be logged or stored only after normalization, but stored metadata should use the detected canonical content type.
- Extension and signature must agree. For example, a PNG renamed to `.pdf` is rejected even if image content is otherwise valid.

Recommended validation messages:

- Missing part/null/empty: `Proof file is required.`
- Too large: `Proof file must be 10 MB or less.`
- Missing or unsupported extension: `Proof file must be a PDF, PNG, JPG, WebP, HEIC, or HEIF file.`
- Signature mismatch: `Proof file content does not match its file extension.`
- Storage path/config problem: `Sick proof storage is not configured correctly.`
- Storage write problem: `Failed to store sick leave proof.`

## Task 1: Add Server-Authoritative File Policy

**Files:**
- Create: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/service/proof/SickProofFileType.java`
- Create: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/service/proof/SickProofValidationResult.java`
- Create: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/service/proof/SickProofFilePolicy.java`
- Test: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/java/ca/openbox/process/service/proof/SickProofFilePolicyTest.java`

- [ ] **Step 1: Write failing tests for allowed real signatures**

Create tests covering:

```java
@Test
void acceptsPdfBySignatureWhenClientMimeIsMissing() {
    MockMultipartFile file = new MockMultipartFile("proof", "doctor.PDF", null, "%PDF-1.6\ncontent".getBytes());

    SickProofValidationResult result = new SickProofFilePolicy().validate(file);

    assertEquals("pdf", result.extension());
    assertEquals("application/pdf", result.canonicalContentType());
}

@Test
void acceptsPngBySignature() {
    byte[] png = new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00};
    MockMultipartFile file = new MockMultipartFile("proof", "note.png", "application/octet-stream", png);

    SickProofValidationResult result = new SickProofFilePolicy().validate(file);

    assertEquals("png", result.extension());
    assertEquals("image/png", result.canonicalContentType());
}

@Test
void acceptsJpegBySignature() {
    byte[] jpg = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00};
    MockMultipartFile file = new MockMultipartFile("proof", "note.jpeg", "", jpg);

    SickProofValidationResult result = new SickProofFilePolicy().validate(file);

    assertEquals("jpeg", result.extension());
    assertEquals("image/jpeg", result.canonicalContentType());
}
```

- [ ] **Step 2: Write failing tests for signature mismatch and unsupported files**

Add tests for:

```java
@Test
void rejectsPdfExtensionWhenContentIsNotPdf() {
    MockMultipartFile file = new MockMultipartFile("proof", "note.pdf", "application/pdf", "not pdf".getBytes());

    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> new SickProofFilePolicy().validate(file));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("Proof file content does not match its file extension.", exception.getReason());
}

@Test
void rejectsUnsupportedExtension() {
    MockMultipartFile file = new MockMultipartFile("proof", "note.exe", "application/octet-stream", "MZ".getBytes());

    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> new SickProofFilePolicy().validate(file));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("Proof file must be a PDF, PNG, JPG, WebP, HEIC, or HEIF file.", exception.getReason());
}
```

- [ ] **Step 3: Run tests and verify failure**

Run:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn -Dtest=SickProofFilePolicyTest test
```

Expected: fails because the new classes do not exist.

- [ ] **Step 4: Implement the enum, result record, and policy**

Implementation guidance:

```java
public record SickProofValidationResult(
        String originalFilename,
        String sanitizedOriginalFilename,
        String extension,
        SickProofFileType fileType,
        String canonicalContentType,
        long fileSizeBytes
) {}
```

`SickProofFilePolicy.validate(MultipartFile proof)` should:

- reject null/empty/oversize before reading content
- sanitize original filename with `Path.of(filename).getFileName().toString()` and remove control characters
- extract lower-case extension with `Locale.US`
- read up to 32 bytes from `proof.getInputStream()`
- find `SickProofFileType` from extension
- require the signature matcher for that type to pass

- [ ] **Step 5: Run focused policy tests**

Run:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn -Dtest=SickProofFilePolicyTest test
```

Expected: all policy tests pass.

## Task 2: Refactor Storage Around Validated File Type

**Files:**
- Modify: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/service/SickLeaveProofStorageService.java`
- Modify: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/service/StoredSickLeaveProof.java`
- Test: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/java/ca/openbox/process/service/SickLeaveProofStorageServiceTest.java`

- [ ] **Step 1: Update storage tests**

Add or update tests so storage proves:

- a valid PDF with missing client MIME is stored
- stored filename starts with `{applicationId}/`
- original filename is sanitized
- content type stored is canonical `application/pdf`
- path traversal in original filename does not affect target path
- `deleteStoredProofQuietly(...)` removes a newly written file

Example assertions:

```java
StoredSickLeaveProof stored = service.store(42, new MockMultipartFile("proof", "../Doctor\tNote.PDF", null, "%PDF-1.6\nx".getBytes()));

assertTrue(stored.getStoredFilename().startsWith("42/"));
assertEquals("Doctor Note.PDF", stored.getOriginalFilename());
assertEquals("application/pdf", stored.getContentType());
assertTrue(Files.exists(Path.of(stored.getStoredPath())));

service.deleteStoredProofQuietly(stored);
assertFalse(Files.exists(Path.of(stored.getStoredPath())));
```

- [ ] **Step 2: Run storage tests and verify failure**

Run:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn -Dtest=SickLeaveProofStorageServiceTest test
```

Expected: fails until storage delegates to the new policy and cleanup method exists.

- [ ] **Step 3: Implement storage refactor**

Constructor should accept `SickProofFilePolicy` via Spring injection. Keep a package-private/test constructor if needed:

```java
public SickLeaveProofStorageService(@Value("${uploads.sick-proof-dir}") String sickProofDir,
                                    SickProofFilePolicy filePolicy) {
    this.filePolicy = filePolicy;
    this.sickProofDirectory = normalizeConfiguredDirectory(sickProofDir);
}
```

Generate the stored filename from `validation.extension()`. Return canonical content type from `validation.canonicalContentType()`.

Add:

```java
public void deleteStoredProofQuietly(StoredSickLeaveProof storedProof) {
    if (storedProof == null || storedProof.getStoredPath() == null || storedProof.getStoredPath().isBlank()) {
        return;
    }
    try {
        Path storedPath = Path.of(storedProof.getStoredPath()).toAbsolutePath().normalize();
        if (storedPath.startsWith(sickProofDirectory)) {
            Files.deleteIfExists(storedPath);
        }
    } catch (Exception ignored) {
    }
}
```

- [ ] **Step 4: Run focused storage tests**

Run:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn -Dtest=SickLeaveProofStorageServiceTest test
```

Expected: all storage tests pass.

## Task 3: Publish Upload Email Only After DB Commit And Clean Up On DB Failure

**Files:**
- Create: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/service/components/AfterCommitEventPublisher.java`
- Modify: `/Users/marktwain/Projects/OPBAdministrationBackend/src/main/java/ca/openbox/process/service/LeaveApplicationService.java`
- Test: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/java/ca/openbox/process/service/LeaveApplicationServiceSickProofTest.java`
- Test: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/java/ca/openbox/process/service/components/AfterCommitEventPublisherTest.java`

- [ ] **Step 1: Add failing service tests**

Add tests covering:

```java
@Test
void uploadSickProofDeletesStoredFileWhenProofRowSaveFails() {
    when(leaveApplicationRepository.getLeaveApplicationDOById(77)).thenReturn(sickApplication());
    when(proofRepository.findById(77)).thenReturn(Optional.of(requiredProofRow()));
    StoredSickLeaveProof stored = new StoredSickLeaveProof("77/file.pdf", "/tmp/file.pdf", "file.pdf", "application/pdf", 12L);
    when(storageService.store(any(), any())).thenReturn(stored);
    when(proofRepository.save(any())).thenThrow(new RuntimeException("db down"));

    assertThrows(RuntimeException.class, () -> leaveApplicationService.uploadSickProof(77, "alice", validPdf()));

    verify(storageService).deleteStoredProofQuietly(stored);
    verify(afterCommitEventPublisher, never()).publish(any());
}

@Test
void uploadSickProofPublishesEmailEventThroughAfterCommitPublisher() {
    // arrange successful upload and save
    LeaveApplication result = leaveApplicationService.uploadSickProof(77, "alice", validPdf());

    assertTrue(result.isSickProofSubmitted());
    verify(afterCommitEventPublisher).publish(argThat(event -> event.getType() == LeaveApplicationEmailEventType.SICK_PROOF_UPLOADED));
}
```

- [ ] **Step 2: Implement after-commit publisher**

Use Spring transaction synchronization:

```java
@Component
public class AfterCommitEventPublisher {
    public void publish(LeaveApplicationEmailEvent event) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    ApplicationStatusChangeMessageQueue.put(event);
                }
            });
            return;
        }
        ApplicationStatusChangeMessageQueue.put(event);
    }
}
```

- [ ] **Step 3: Modify `LeaveApplicationService`**

Inject `AfterCommitEventPublisher`. Replace direct `ApplicationStatusChangeMessageQueue.put(...)` calls in transactional leave creation and proof upload with `afterCommitEventPublisher.publish(...)`.

Wrap DB save after file storage:

```java
StoredSickLeaveProof storedProof = sickLeaveProofStorageService.store(applicationID, proof);
try {
    // update proof row and save
} catch (RuntimeException e) {
    sickLeaveProofStorageService.deleteStoredProofQuietly(storedProof);
    throw e;
}
```

- [ ] **Step 4: Run focused service tests**

Run:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn -Dtest=LeaveApplicationServiceSickProofTest,AfterCommitEventPublisherTest test
```

Expected: all focused tests pass.

## Task 4: Add Controller-Level Multipart Regression Tests

**Files:**
- Create: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/java/ca/openbox/process/controller/LeaveApplicationControllerSickProofMultipartTest.java`
- Modify test wiring only if existing controller tests require a shared setup.

- [ ] **Step 1: Write MockMvc multipart tests**

Cover:

- valid PDF upload with missing part content type
- valid PDF upload with `application/octet-stream`
- valid PDF upload with `application/pdf; charset=binary`
- invalid PDF extension with non-PDF bytes returns 400 and clear message
- missing `applicant` returns 400 or 403 according to current controller/service binding

Example pattern:

```java
MockMultipartFile proof = new MockMultipartFile(
        "proof",
        "02-311004.pdf",
        "application/octet-stream",
        "%PDF-1.6\ncontent".getBytes()
);

mockMvc.perform(multipart("/api/process/application/77/sick-proof")
        .file(proof)
        .param("applicant", "alice"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sickProofSubmitted").value(true));
```

- [ ] **Step 2: Run controller tests and verify behavior**

Run:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn -Dtest=LeaveApplicationControllerSickProofMultipartTest test
```

Expected: controller tests pass after the service/policy refactor.

## Task 5: Add User Attachment Regression Coverage

**Files:**
- Test: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/java/ca/openbox/process/service/proof/SickProofFilePolicyTest.java`
- Optional local fixture directory: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/resources/sick-proof/`

- [ ] **Step 1: Download the issue attachment through Multica CLI**

Run from the workspace:

```bash
cd /Users/marktwain/multica_workspaces/f97fe58b-7d53-4083-99c1-0057a60d706b/c245e4c1/workdir
mkdir -p /Users/marktwain/Projects/OPBAdministrationBackend/src/test/resources/sick-proof
multica attachment download 019e8ade-21e6-7b77-93ef-20a5af736121 -o /Users/marktwain/Projects/OPBAdministrationBackend/src/test/resources/sick-proof
```

- [ ] **Step 2: Add a regression test for `02-311004.pdf`**

Test should read the fixture and assert it passes file policy:

```java
byte[] bytes = Files.readAllBytes(Path.of("src/test/resources/sick-proof/02-311004.pdf"));
MockMultipartFile file = new MockMultipartFile("proof", "02-311004.pdf", null, bytes);

SickProofValidationResult result = new SickProofFilePolicy().validate(file);

assertEquals("pdf", result.extension());
assertEquals("application/pdf", result.canonicalContentType());
```

- [ ] **Step 3: Run the regression test**

Run:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn -Dtest=SickProofFilePolicyTest test
```

Expected: the user-provided PDF passes.

## Task 6: Verify Email Serialization And Delay Still Work

**Files:**
- Keep/modify: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/java/ca/openbox/infrastructure/email/service/WebhookEmailServiceTest.java`
- Keep/modify: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/java/ca/openbox/process/service/components/EmailNotificationConsumerHandlerLookupTest.java`
- Keep/modify: `/Users/marktwain/Projects/OPBAdministrationBackend/src/test/java/ca/openbox/process/service/components/EmailNotificationConsumerTimezoneTest.java`

- [ ] **Step 1: Confirm JSON escaping test exists**

Keep a test equivalent to:

```java
String json = WebhookEmailService.buildEmailJson("hr@example.com", "Subject", "Line 1\nLine 2\t\"quoted\" C:\\proof", "token");

assertDoesNotThrow(() -> new ObjectMapper().readTree(json));
assertTrue(json.contains("\\n"));
```

- [ ] **Step 2: Confirm HR delay test still covers both recipients**

Keep or add verification that sick proof HR emails go to fixed users `raynold` and `agnes`, continue if one send fails, and call the 20-second delay hook between recipients.

- [ ] **Step 3: Run focused email tests**

Run:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn -Dtest=WebhookEmailServiceTest,EmailNotificationConsumerHandlerLookupTest,EmailNotificationConsumerTimezoneTest test
```

Expected: all email tests pass.

## Task 7: Full Verification

- [ ] **Step 1: Run full backend tests**

Run:

```bash
cd /Users/marktwain/Projects/OPBAdministrationBackend
mvn test
```

Expected: build success, no failures, no errors.

- [ ] **Step 2: Manually verify API behavior if local backend config is available**

This step is secondary to the automated MockMvc multipart coverage. If a local backend and database are already available, use the port printed by the Spring Boot startup log and a real sick leave application ID owned by the applicant. Do not create or mutate production data for this manual check.

```bash
curl -i -X POST "http://localhost:8080/api/process/application/77/sick-proof" \
  -F "applicant=alice" \
  -F "proof=@/Users/marktwain/Projects/OPBAdministrationBackend/src/test/resources/sick-proof/02-311004.pdf;type=application/octet-stream"
```

Expected:

- `200 OK`
- JSON contains `"sickProofSubmitted": true`
- JSON contains `"sickProofOriginalFilename": "02-311004.pdf"`
- JSON does not contain stored absolute path
- HR email event includes the stored path after DB commit

If the local backend does not run on port `8080`, substitute only the actual port from the startup log. If application `77` / applicant `alice` does not exist in the local database, skip this manual curl and rely on the controller-level multipart tests from Task 4.

## Frontend Follow-Up Note

If uploads still fail from browser after backend hardening, ask frontend to remove the manual Axios header:

```ts
headers: {
  "Content-Type": "multipart/form-data"
}
```

Axios/browser should set the multipart boundary automatically when posting `FormData`. This is a frontend request-layer cleanup, not a backend validation issue.

## Self-Review Checklist

- The backend remains authoritative for file acceptance.
- Browser/client MIME is not trusted for allow decisions.
- File writes happen before DB metadata update, and new files are cleaned up if DB save fails.
- Email side effects are queued only after transaction commit.
- The existing frontend response contract remains compatible.
- Stored proof path is not leaked to normal API responses.
- Tests cover real signatures, service behavior, controller multipart behavior, and the user-provided PDF.
- Full backend verification command is `mvn test`.
