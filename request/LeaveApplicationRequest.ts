import { LeaveApplication } from "@/model/LeaveApplication";
import axios, { Axios, AxiosResponse } from "axios";

export class LeaveApplicationRequest{
    putLeaveApplication = async(putLeaveAplication:object):Promise<LeaveApplication>=>{
        try{
            const response:AxiosResponse = await axios.put('http://localhost:8080/api/process/application/leave-application',
            putLeaveAplication);
            return response.data;
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    
    }
}