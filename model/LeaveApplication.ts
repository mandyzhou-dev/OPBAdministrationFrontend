export class LeaveApplication{
    id: number| undefined;
    applicant: string | undefined;
    start: Date | undefined;
    end: Date | undefined;
    leaveType: string|undefined;
    submitTime: Date|undefined;
    currentHandler:string|undefined;
    status:string|undefined;
    canDelete:boolean|undefined;
    sickProofRequired:boolean|undefined;
    sickProofSubmitted:boolean|undefined;
    sickProofUploadedAt:Date|undefined;
    sickProofOriginalFilename:string|undefined;
    rejectReason:string|undefined;
    reason: string|undefined;  
    note:string|undefined;
    constructor () {

    }
}
