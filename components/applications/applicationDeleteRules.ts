import { LeaveApplication } from "@/model/LeaveApplication";

const DELETABLE_STATUSES = new Set(["pending", "draft"]);

const DELETE_UNAVAILABLE_MESSAGES: Record<string, string> = {
    approved: "Approved applications can't be deleted.",
    rejected: "Rejected applications can't be deleted.",
    cancelled: "Cancelled applications can't be deleted.",
    pending: "Pending applications can't be deleted.",
    draft: "Draft applications can't be deleted.",
};

export const normalizeLeaveApplicationStatus = (status?: string | null): string => {
    return status?.trim().toLowerCase() ?? "";
};

export const isLeaveApplicationDeletable = (status?: string | null): boolean => {
    return DELETABLE_STATUSES.has(normalizeLeaveApplicationStatus(status));
};

export const resolveCanDelete = (
    application: Pick<LeaveApplication, "status" | "canDelete">
): boolean => {
    if (typeof application.canDelete === "boolean") {
        return application.canDelete;
    }

    return isLeaveApplicationDeletable(application.status);
};

export const getDeleteUnavailableMessage = (status?: string | null): string => {
    const normalizedStatus = normalizeLeaveApplicationStatus(status);
    return DELETE_UNAVAILABLE_MESSAGES[normalizedStatus] ?? "This application can't be deleted.";
};
