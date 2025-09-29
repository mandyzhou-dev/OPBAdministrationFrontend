import { Employment } from "@/model/Employment";
import { TerminateInfo } from "@/model/TerminateInfo";
import { EmploymentRequest } from "@/request/EmploymentRequest";

export const terminate = async(username:string, terminateInfo:TerminateInfo):Promise<Object>=>{
    const employmentRequest = new EmploymentRequest()
    return employmentRequest.terminate(username,terminateInfo);
}
export const getEmploymentByUsername = async(username:string):Promise<Employment>=>{
    const employmentRequest = new EmploymentRequest()
    return employmentRequest.getEmploymentByUsername(username);
}