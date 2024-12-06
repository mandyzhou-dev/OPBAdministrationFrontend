import { LeaveApplication } from "@/model/LeaveApplication";
import axios, { Axios, AxiosResponse } from "axios";

export class LeaveApplicationRequest{
    putLeaveApplication = async(putLeaveAplication:object):Promise<LeaveApplication>=>{
        try{
            const response:AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL+'api/process/application/leave-application',
            putLeaveAplication);
            return response.data;
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    
    }

    getApplication = async(handler:string,applicant:string):Promise<LeaveApplication[]>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/process/application',
            {
                params:{
                    handler:handler,
                    applicant:applicant
                }
            });
            return response.data;
        }catch(e){
            throw new Error("Request Failure" +(e as Error).message)
        }
    }

    getAllApplications = async():Promise<LeaveApplication[]>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/process/application');
            return response.data;
        }catch(e){
            throw new Error("Request Failure" +(e as Error).message)
        }
    }
    permitReview = async(id:number):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/process/application/'+id+'/permit',);
            return response.data;
        }catch(e){
            console.log(id);
            throw new Error("Post Failure" +(e as Error).message)
        }
    }

    rejectReview = async(id:number,rejectReason:string):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/process/application/'+id+'/reject',
            rejectReason,{
                headers:{
                    'Content-type':'text/plain'
                }
            })
            return response.data
        }catch(e){
            throw new Error("Post Failure"+(e as Error).message)
        }
    }

    addNote = async(id:number, note:string):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL+'api/process/application/'+id+'/note',
            note,{
                headers:{
                    'Content-type':'text/plain'
                }
            })
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    deleteApplication = async(id:number):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.delete(process.env.EXPO_PUBLIC_API_URL+'api/process/application/'+id,)
            return response.data;
        }catch(e){
            throw new Error("Delete Failure"+(e as Error).message)
        }
    }

}