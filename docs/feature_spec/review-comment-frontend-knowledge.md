# Review Comment Frontend Knowledge

Date: 2026-06-15
Issue: MAN-32

This note records the frontend decisions from the `rejectReason -> reviewComment` migration. Use it when changing leave application approval, decline, My Applications, or History review-comment behavior.

## Contract

- `rejectReason` is retired from the frontend model and UI. Do not add new frontend reads or writes of that field.
- `LeaveApplication` carries `reviewComment?: string`.
- Approve calls `POST /api/process/application/{id}/permit` through `permitReview(id, reviewComment?)`.
- Decline calls `POST /api/process/application/{id}/reject` through `rejectReview(id, reviewComment)`.
- Both decision endpoints use JSON bodies. Do not send the old `text/plain` reject payload.
- Approve may send `{}` or omit `reviewComment` when the textarea is blank or whitespace-only.
- Decline must have a nonblank `reviewComment` after trimming the comment value.

## ReviewModal Rules

- Keep the textarea label/copy neutral: use `Comment` or `Review Comment`, not rejection-only wording.
- Only trim the review comment for blank detection and submit payload cleanup.
- Approve is optional: whitespace-only input should submit as no comment.
- Decline is required: whitespace-only input should be blocked in the modal before the request.
- Await the approve/decline request before closing the modal or refreshing parent data.
- While the request is in flight, disable both decision buttons and show a stable loading label.
- If the request fails, keep the modal open, preserve the typed comment, and show a concise inline error.
- Reset local comment/error/loading state when the modal closes or a different application is selected.

## Display Rules

- My Applications and History should display `Review Comment` for both approved and rejected records when `reviewComment` exists.
- Keep employee-submitted `reason` displayed as `Comment`; do not merge it with `reviewComment`.
- Keep History `note` separate. It is a post-decision admin note, not the approval/decline decision comment.
- Details modal content should include full `Comment` and full `Review Comment` when present.
- Details-entry emphasis/visibility must consider `reviewComment`, so approved applications with conditional approval comments are discoverable.

## Identity And Whitespace Safety

- Do not trim or normalize identity/query values as part of review-comment work:
  - `user.username`
  - `application.applicant`
  - sick-proof applicant values
  - `employeeUsername`
  - other applicant/handler/query parameters
- Preserve usernames exactly, including trailing spaces such as `Harsimranjit Kaur `.
- If a future change needs normalization, make it an explicit cross-stack migration with tests and product approval. Do not do it opportunistically while touching review comments.

## Reusable Implementation Checklist

1. Update `model/LeaveApplication.ts` first so call sites compile against `reviewComment`.
2. Update `request/LeaveApplicationRequest.ts` and `service/ApplicationService.ts` as thin wrappers around the JSON decision contract.
3. Update `components/applications/ReviewModal.tsx` for optional approve, required decline, await-before-close, loading, and error behavior.
4. Update `ApplicationCardforE` and `HistoryApplicationCard` display labels and details modals.
5. Search app/model/request/service/components for `rejectReason` and remove live references.
6. Add or update focused tests before relying on manual checks.

## Focused Tests

Keep coverage for:

- Request JSON bodies for approve/decline.
- Approve with comment.
- Approve with whitespace-only comment.
- Decline with blank or whitespace-only comment blocked.
- Request failure keeps modal open and preserves input.
- Buttons disabled while submitting.
- My Applications and History show `Review Comment` for approved and rejected examples.
- Details trigger/visibility uses `reviewComment`.
- `employeeUsername` / trailing-space username values are preserved exactly.

Effective verification command:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/ApplicationCardforEDeleteVisibility-test.js components/__tests__/HistoryApplicationCardSummary-test.js components/__tests__/ApplicationHistoryRequest-test.js components/__tests__/ReviewModal-test.js --runInBand --watchAll=false
```

Known verification caveat from this pass: `npx tsc --noEmit` is blocked by unrelated existing project errors in `app/applications/Regulations.tsx`, `app/setPassword.tsx`, and `components/FreeStyle/RequiredFormControl.tsx`.
