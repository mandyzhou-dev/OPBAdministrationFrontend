export interface ShiftCandidate {
    username: string;
    name: string;
    groupName?: string | null;
    preferred: boolean;
    alreadyScheduled: boolean;
    existingShiftId?: number | null;
    existingShiftStatus?: string | null;
}
