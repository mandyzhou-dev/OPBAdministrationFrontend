export interface LeaveDateAvailabilityDate {
    date: string;
    scheduled: boolean;
    shiftIds: number[];
}

export interface LeaveDateAvailability {
    applicant: string;
    from: string;
    to: string;
    businessZone: "America/Vancouver";
    dates: LeaveDateAvailabilityDate[];
}

export interface PutLeaveApplicationPayload {
    applicant: string;
    start: string;
    end: string;
    leaveType: string;
    reason: string;
}
