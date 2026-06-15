# Review Comment Migration Frontend Plan

Issue: MAN-32

Scope: planning only. Do not implement until the user approves.

## Goal

Support manager review comments for both Approve and Decline after the backend
migrates rejection-only `rejectReason` semantics to neutral `reviewComment`
semantics.

After migration:

- Approve can submit an optional review comment.
- Decline requires a review comment.
- Review comments display on Time Off Requests, My Applications, and History.
- UI copy uses neutral wording, not rejection-only wording.
- Frontend no longer depends on `rejectReason`.
- Only `reviewComment` may be trimmed for blank validation. Usernames,
  applicants, and current-handler values must not be trimmed or normalized by
  this work.

## Current Frontend State

Relevant files:

- `model/LeaveApplication.ts`
- `request/LeaveApplicationRequest.ts`
- `service/ApplicationService.ts`
- `components/applications/ReviewModal.tsx`
- `components/applications/ReviewOfApplicationCard.tsx`
- `components/applications/ApplicationCardforE.tsx`
- `components/applications/HistoryApplicationCard.tsx`

Current behavior:

- `LeaveApplication` has `rejectReason`.
- `ReviewModal` stores modal text in a local `rejectReason` state.
- Approve calls `permitReview(id)` without sending any comment.
- Decline calls `rejectReview(id, rejectReason)` and requires the text.
- Employee/history detail views display `Reject Reason` only when `rejectReason` exists.

## Target Frontend Contract

Backend request body for both approve and decline:

```ts
interface ReviewDecisionPayload {
  reviewComment?: string;
}
```

Backend response field:

```ts
class LeaveApplication {
  reviewComment?: string;
}
```

Frontend should stop reading or writing `rejectReason` after the migration.

## Frontend Implementation Steps

1. Update model:
   - Replace `rejectReason` with `reviewComment` in `model/LeaveApplication.ts`.

2. Update request wrapper:
   - Change `permitReview(id)` to `permitReview(id, reviewComment?: string)`.
   - For approve, trim only the comment for blank detection. If the trimmed
     comment is empty, send an empty JSON object or no `reviewComment` field.
     Do not send whitespace-only comments.
   - Change `rejectReview(id, reviewComment)` to send JSON body `{ reviewComment }`.
   - Use `Content-Type: application/json`, not `text/plain`, for the migrated review endpoints.
   - Do not trim `user.username`, `application.applicant`, sick-proof applicant
     values, or My Applications query parameters.

3. Update service wrapper:
   - Mirror the request wrapper signatures in `service/ApplicationService.ts`.
   - Keep methods as thin wrappers.

4. Update review modal:
   - Rename state from `rejectReason` to `reviewComment`.
   - Label can remain `Comment` or become `Review Comment`; placeholder should be neutral, for example `Add a review comment...`.
   - Approve button submits optional `reviewComment`.
   - Decline button requires nonblank `reviewComment` after trimming; whitespace-only input must not pass validation.
   - Reset modal comment state when the selected application changes or when the modal closes.
   - Await the approve/decline request before closing the modal or refreshing.
   - While the request is in flight, disable Approve and Decline and show a
     loading state to avoid duplicate submissions.
   - If the request fails, keep the modal open, preserve the typed comment, and
     show a concise error message.

5. Update Time Off Requests card:
   - Keep employee application `reason` visible as `Comment`.
   - Add or adjust displayed review text only if useful before decision; for pending review cards it is usually empty.

6. Update employee application card:
   - Replace `Reject Reason` section with `Review Comment`.
   - Show `Review Comment` for both approved and rejected applications when `reviewComment` exists.
   - Details modal should include `Review Comment` if present.
   - Keep employee `Comment` as the request reason.
   - Update the detail-entry visibility calculation from `rejectReason` to
     `reviewComment` so approved applications with review comments have an
     obvious details entry.

7. Update history card:
   - Replace `Reject Reason` section with `Review Comment`.
   - Show it for both approved and rejected applications when present.
   - Keep editable `Note` as a separate post-decision admin note.

8. Mobile/responsive behavior:
   - Keep the review modal textarea full width.
   - On narrow screens, allow Approve and Decline buttons to wrap or stack with stable touch-friendly heights.
   - Long review comments should be summarized with the existing line-clamp pattern and fully visible in details modals.
   - Loading and error states in the modal must not push action buttons off small screens.

9. Update tests:
   - Review modal approve sends optional `reviewComment`.
   - Review modal approve with whitespace sends no comment.
   - Review modal decline requires `reviewComment`.
   - Review modal decline with whitespace is blocked.
   - Review modal request failure keeps the modal open and keeps the entered comment.
   - Review modal disables actions while submit is pending.
   - Request tests verify JSON request bodies for approve/decline.
   - Employee card and history card show `Review Comment` for approved and rejected examples.
   - Details trigger visibility uses `reviewComment`.
   - Existing tests that assert `Reject Reason` should migrate to `Review Comment`.
   - Regression test or fixture should preserve applicant value
     `Harsimranjit Kaur ` with its trailing space through approve/decline UI calls.

## Cross-Stack Assumptions

- Backend response field is `reviewComment`.
- Backend approve endpoint accepts missing or blank `reviewComment`.
- Backend decline endpoint rejects missing or blank `reviewComment`.
- The database has been migrated from `reject_reason` to `review_comment` by the user before running the migrated backend.
- Frontend and backend should ship together because the old reject endpoint uses
  `text/plain` and the migrated endpoint uses JSON.
- No proactive email/push notification is included. Employees will see review
  comments through My Applications and History unless product separately requests
  decision notifications.

## Verification

Suggested focused frontend verification:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/ApplicationCardforEDeleteVisibility-test.js components/__tests__/HistoryApplicationCardSummary-test.js components/__tests__/ApplicationHistoryRequest-test.js components/__tests__/ReviewModal-test.js --runInBand --watchAll=false
```

Manual UI checks:

- Open Time Off Requests, enter no comment, click Approve: approval succeeds.
- Open Time Off Requests, enter a comment, click Approve: approved application later shows Review Comment.
- Open Time Off Requests, click Decline with empty comment: validation blocks the action.
- Open Time Off Requests, enter a comment, click Decline: rejected application later shows Review Comment.
- Check My Applications and History on desktop and mobile widths to confirm text wraps cleanly and details expose the full comment.
