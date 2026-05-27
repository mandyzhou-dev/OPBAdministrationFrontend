import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LeaveDateAvailability } from "@/model/LeaveDateAvailability";

dayjs.extend(utc);
dayjs.extend(timezone);

export const BUSINESS_ZONE = "America/Vancouver";
export type LeaveAvailabilityMap = Map<string, boolean>;

export const getVancouverToday = (now?: string | Date | Dayjs): Dayjs => {
    const current = now ? dayjs(now) : dayjs();
    return current.tz(BUSINESS_ZONE).startOf("day");
}

export const formatBusinessDate = (date: Dayjs): string => {
    return date.format("YYYY-MM-DD");
}

export const buildAvailabilityMap = (availability: Pick<LeaveDateAvailability, "dates"> | null): LeaveAvailabilityMap | null => {
    if (!availability) {
        return null;
    }
    return new Map(availability.dates.map((date) => [date.date, date.scheduled]));
}

export const isSickLeave = (leaveType: string): boolean => {
    return leaveType === "SICK";
}

export const isLeaveDateDisabled = (
    current: Dayjs | null,
    leaveType: string,
    availability: LeaveAvailabilityMap | null,
    today: Dayjs = getVancouverToday(),
): boolean => {
    if (!current) {
        return false;
    }

    if (current.isBefore(today, "day")) {
        return true;
    }

    if (!isSickLeave(leaveType)) {
        return false;
    }

    return availability?.get(formatBusinessDate(current)) !== true;
}

export const areAllDatesScheduled = (
    start: Dayjs | null,
    end: Dayjs | null,
    availability: LeaveAvailabilityMap | null,
): boolean => {
    if (!start || !end || !availability) {
        return false;
    }

    let current = start.startOf("day");
    const last = end.startOf("day");
    while (!current.isAfter(last, "day")) {
        if (availability.get(formatBusinessDate(current)) !== true) {
            return false;
        }
        current = current.add(1, "day");
    }
    return true;
}
