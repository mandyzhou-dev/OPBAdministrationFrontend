import { PaidSickLeaveQuota } from "@/model/PaidSickLeaveQuota";

export type ShiftStatus =
  | "active"
  | "cancelled"
  | "no_show"
  | "paid_sick_leave"
  | "unpaid_sick_leave";

export type ManualShiftStatus =
  | "no_show"
  | "paid_sick_leave"
  | "unpaid_sick_leave";

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  active: "Active",
  cancelled: "Cancelled",
  no_show: "No show",
  paid_sick_leave: "Paid sick leave",
  unpaid_sick_leave: "Unpaid sick leave",
};

export const MANUAL_SHIFT_STATUS_OPTIONS: Array<{
  label: string;
  value: ManualShiftStatus;
}> = [
  { label: "Mark as no show", value: "no_show" },
  { label: "Mark as paid sick leave", value: "paid_sick_leave" },
  { label: "Mark as unpaid sick leave", value: "unpaid_sick_leave" },
];

export const NON_WORKED_SHIFT_STATUSES: ShiftStatus[] = [
  "cancelled",
  "no_show",
  "paid_sick_leave",
  "unpaid_sick_leave",
];

export const SHIFT_STATUS_COLORS: Record<ShiftStatus, string | undefined> = {
  active: undefined,
  cancelled: "#9CA3AF",
  no_show: "#9CA3AF",
  paid_sick_leave: "#DDD6FE",
  unpaid_sick_leave: "#9CA3AF",
};

export const SHIFT_STATUS_TEXT_COLORS: Record<ShiftStatus, string | undefined> = {
  active: undefined,
  cancelled: "#111827",
  no_show: "#111827",
  paid_sick_leave: "#312E81",
  unpaid_sick_leave: "#111827",
};

export const normalizeShiftStatus = (status?: string | null): ShiftStatus => {
  if (
    status === "cancelled" ||
    status === "no_show" ||
    status === "paid_sick_leave" ||
    status === "unpaid_sick_leave"
  ) {
    return status;
  }
  return "active";
};

export const isPaidSickLeaveAllowed = (
  quota?: PaidSickLeaveQuota | null
): boolean => {
  if (!quota) {
    return false;
  }
  return quota.eligible && !quota.probation && quota.canMarkPaidSickLeave;
};
