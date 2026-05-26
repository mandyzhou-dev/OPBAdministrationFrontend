export interface CopySkippedShift {
    username?: string;
    groupName?: string;
    sourceDate?: string;
    targetDate?: string;
    reason?: "STATUTORY_HOLIDAY" | string;
    message?: string;
}

export class CopyStatus{
    created:number | undefined;
    skipped:number |undefined;
    overwritten:number |undefined;
    skippedDetails?: CopySkippedShift[];

        constructor () {

    }
}
