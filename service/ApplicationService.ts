import { LeaveApplication } from "@/model/LeaveApplication";
import { LeaveApplicationRequest } from "@/request/LeaveApplicationRequest";
export const getReviewApplicationByHandler = async (handler: string): Promise<LeaveApplication[]> => {
    const leaveApplicationRequest = new LeaveApplicationRequest()
    const applicationArray = await leaveApplicationRequest.getApplication(handler,"")
    return applicationArray;

}
export const getApplicationByApplicant = async(applicant:string):Promise<LeaveApplication[]>=>{
    const leaveApplicationRequest = new LeaveApplicationRequest()
    const applicationArray = await leaveApplicationRequest.getApplication("",applicant)
    return applicationArray;
}
export const permitReview=async(id:number):Promise<Object>=>{
    const leaveApplicationRequest = new LeaveApplicationRequest()
    return leaveApplicationRequest.permitReview(id);
}
export const rejectReview = async(id:number,rejectReason:string):Promise<Object>=>{
    const leaveApplicationRequest = new LeaveApplicationRequest()
    return leaveApplicationRequest.rejectReview(id,rejectReason);
}
export const getAllApplication = async():Promise<LeaveApplication[]>=>{
    const leaveApplicationRequest = new LeaveApplicationRequest()
    return leaveApplicationRequest.getAllApplications();
}
export const addNote = async(id:number, note:string):Promise<Object>=>{
    const leaveApplicationRequest = new LeaveApplicationRequest()
    return leaveApplicationRequest.addNote(id,note);
}