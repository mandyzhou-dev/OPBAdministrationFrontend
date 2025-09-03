import { ResignationStatus } from "@/constants/ResignationStatus";

export class ResignationApplication{
    id: number| undefined;
    applicant: string | undefined;
    submittedAt: Date|undefined;
    lastWorkingDay:string|undefined;
    status:ResignationStatus|undefined;
    reason: string|undefined;  
    note:string|undefined;
    reviewBy: string|undefined;
    constructor () {

    }
}