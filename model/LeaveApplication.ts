export class LeaveApplication{
    id: number| undefined;
    applicant: string | undefined;
    start: Date | undefined;
    end: Date | undefined;
    leaveType: string|undefined;
    submitTime: Date|undefined;
    currentHandler:string|undefined;
    status:string|undefined;
    rejectReason:string|undefined;
    reason: string|undefined;  
    note:string|undefined;
    constructor () {

    }
}