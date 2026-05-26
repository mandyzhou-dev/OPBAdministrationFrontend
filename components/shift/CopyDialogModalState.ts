import { CopySkippedShift, CopyStatus } from "@/model/CopyStatus";
import { StatutoryHoliday } from "@/model/StatutoryHoliday";
import dayjs, { Dayjs } from "dayjs";

export interface TargetWeekHoliday {
    date: string;
    name?: string;
}

export interface SkippedDetailsGroup {
    targetDate: string;
    count: number;
}

const toDateOnlyString = (value: Date | string | undefined): string | null => {
    if (!value) return null;
    if (typeof value === "string") {
        return value.substring(0, 10);
    }
    return dayjs(value).format("YYYY-MM-DD");
};

export const getTargetWeekHolidays = (statutoryHolidays: StatutoryHoliday[], dstWeekStart: Dayjs): TargetWeekHoliday[] => {
    const weekDates = new Set(
        Array.from({ length: 7 }, (_, index) => dstWeekStart.add(index, "day").format("YYYY-MM-DD"))
    );
    const seenDates = new Set<string>();

    return statutoryHolidays.reduce<TargetWeekHoliday[]>((holidays, holiday) => {
        const holidayDate = toDateOnlyString(holiday.statutoryDate);
        if (!holidayDate || !weekDates.has(holidayDate) || seenDates.has(holidayDate)) {
            return holidays;
        }

        seenDates.add(holidayDate);
        holidays.push({
            date: holidayDate,
            name: holiday.holidayName || undefined,
        });
        return holidays;
    }, []);
};

export const buildHolidayWarningText = (targetWeekHolidays: TargetWeekHoliday[]): string => {
    const holidayText = targetWeekHolidays
        .map((holiday) => holiday.name ? `${holiday.name} (${holiday.date})` : holiday.date)
        .join(", ");

    return `Target week includes statutory holiday(s): ${holidayText}. Copied shifts on those dates will be skipped.`;
};

export const getStatutoryHolidaySkippedDetails = (copyStatus: CopyStatus | null | undefined): CopySkippedShift[] => {
    return (copyStatus?.skippedDetails || []).filter((detail) => detail.reason === "STATUTORY_HOLIDAY");
};

export const groupSkippedDetailsByTargetDate = (details: CopySkippedShift[]): SkippedDetailsGroup[] => {
    const countsByDate = details.reduce<Record<string, number>>((counts, detail) => {
        const targetDate = detail.targetDate || "Unknown date";
        counts[targetDate] = (counts[targetDate] || 0) + 1;
        return counts;
    }, {});

    return Object.keys(countsByDate)
        .sort()
        .map((targetDate) => ({
            targetDate,
            count: countsByDate[targetDate],
        }));
};
