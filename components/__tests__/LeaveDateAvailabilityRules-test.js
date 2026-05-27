import dayjs from "dayjs";

describe("leave date availability rules", () => {
  const {
    BUSINESS_ZONE,
    buildAvailabilityMap,
    getVancouverToday,
    isLeaveDateDisabled,
    areAllDatesScheduled,
  } = require("@/util/leaveDateAvailability");

  it("blocks dates before Vancouver today and allows today for non-sick leave", () => {
    const today = getVancouverToday("2026-05-27T12:00:00-07:00");

    expect(BUSINESS_ZONE).toBe("America/Vancouver");
    expect(isLeaveDateDisabled(dayjs("2026-05-26"), "personalleave", null, today)).toBe(true);
    expect(isLeaveDateDisabled(dayjs("2026-05-27"), "personalleave", null, today)).toBe(false);
  });

  it("blocks unscheduled sick leave dates and allows scheduled dates", () => {
    const today = getVancouverToday("2026-05-27T12:00:00-07:00");
    const availability = buildAvailabilityMap({
      dates: [
        { date: "2026-05-28", scheduled: true, shiftIds: [101] },
        { date: "2026-05-29", scheduled: false, shiftIds: [] },
      ],
    });

    expect(isLeaveDateDisabled(dayjs("2026-05-28"), "SICK", availability, today)).toBe(false);
    expect(isLeaveDateDisabled(dayjs("2026-05-29"), "SICK", availability, today)).toBe(true);
    expect(isLeaveDateDisabled(dayjs("2026-05-30"), "SICK", availability, today)).toBe(true);
  });

  it("checks every date in a sick leave range", () => {
    const availability = buildAvailabilityMap({
      dates: [
        { date: "2026-05-27", scheduled: true, shiftIds: [101] },
        { date: "2026-05-28", scheduled: true, shiftIds: [102] },
        { date: "2026-05-29", scheduled: false, shiftIds: [] },
      ],
    });

    expect(areAllDatesScheduled(dayjs("2026-05-27"), dayjs("2026-05-28"), availability)).toBe(true);
    expect(areAllDatesScheduled(dayjs("2026-05-27"), dayjs("2026-05-29"), availability)).toBe(false);
  });
});
