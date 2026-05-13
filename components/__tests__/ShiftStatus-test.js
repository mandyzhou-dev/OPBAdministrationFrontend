import {
  MANUAL_SHIFT_STATUS_OPTIONS,
  NON_WORKED_SHIFT_STATUSES,
  SHIFT_STATUS_COLORS,
  isPaidSickLeaveAllowed,
} from "@/constants/ShiftStatus";

describe("ShiftStatus constants", () => {
  it("limits manual status actions to the approved three statuses", () => {
    expect(MANUAL_SHIFT_STATUS_OPTIONS.map((option) => option.value)).toEqual([
      "no_show",
      "paid_sick_leave",
      "unpaid_sick_leave",
    ]);
  });

  it("marks all non-worked statuses used by reporting", () => {
    expect(NON_WORKED_SHIFT_STATUSES).toEqual([
      "cancelled",
      "no_show",
      "paid_sick_leave",
      "unpaid_sick_leave",
    ]);
  });

  it("uses grey for no show/unpaid sick leave and light purple for paid sick leave", () => {
    expect(SHIFT_STATUS_COLORS.no_show).toBe("#9CA3AF");
    expect(SHIFT_STATUS_COLORS.unpaid_sick_leave).toBe("#9CA3AF");
    expect(SHIFT_STATUS_COLORS.paid_sick_leave).toBe("#DDD6FE");
  });

  it("blocks paid sick leave when quota says the employee is not eligible", () => {
    expect(
      isPaidSickLeaveAllowed({
        username: "worker",
        year: 2026,
        usedDays: 5,
        quotaDays: 5,
        probation: false,
        eligible: true,
        targetDateAlreadyCounted: false,
        canMarkPaidSickLeave: false,
      })
    ).toBe(false);
  });
});
