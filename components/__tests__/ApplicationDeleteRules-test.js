describe("application delete rules", () => {
  const {
    getDeleteUnavailableMessage,
    isLeaveApplicationDeletable,
    normalizeLeaveApplicationStatus,
    resolveCanDelete,
  } = require("@/components/applications/applicationDeleteRules");

  it("normalizes status with trim and lowercase", () => {
    expect(normalizeLeaveApplicationStatus(" Pending ")).toBe("pending");
    expect(normalizeLeaveApplicationStatus("")).toBe("");
    expect(normalizeLeaveApplicationStatus(null)).toBe("");
    expect(normalizeLeaveApplicationStatus(undefined)).toBe("");
  });

  it("allows only pending and draft statuses after normalization", () => {
    expect(isLeaveApplicationDeletable("pending")).toBe(true);
    expect(isLeaveApplicationDeletable("draft")).toBe(true);
    expect(isLeaveApplicationDeletable(" Pending ")).toBe(true);

    expect(isLeaveApplicationDeletable("approved")).toBe(false);
    expect(isLeaveApplicationDeletable("rejected")).toBe(false);
    expect(isLeaveApplicationDeletable("cancelled")).toBe(false);
    expect(isLeaveApplicationDeletable("unknown")).toBe(false);
    expect(isLeaveApplicationDeletable(null)).toBe(false);
    expect(isLeaveApplicationDeletable(undefined)).toBe(false);
  });

  it("prefers explicit canDelete and falls back to normalized status", () => {
    expect(resolveCanDelete({ status: "approved", canDelete: true })).toBe(true);
    expect(resolveCanDelete({ status: "pending", canDelete: false })).toBe(false);
    expect(resolveCanDelete({ status: " draft " })).toBe(true);
    expect(resolveCanDelete({ status: "rejected" })).toBe(false);
  });

  it("returns status-specific unavailable messages", () => {
    expect(getDeleteUnavailableMessage("approved")).toBe("Approved applications can't be deleted.");
    expect(getDeleteUnavailableMessage(" rejected ")).toBe("Rejected applications can't be deleted.");
    expect(getDeleteUnavailableMessage("cancelled")).toBe("Cancelled applications can't be deleted.");
    expect(getDeleteUnavailableMessage("unknown")).toBe("This application can't be deleted.");
    expect(getDeleteUnavailableMessage(null)).toBe("This application can't be deleted.");
  });
});
