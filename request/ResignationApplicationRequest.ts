import { ResignationApplication } from "@/model/ResignationApplication";
import axios, { AxiosResponse } from "axios";

export class ResignationApplicationRequest{
    postResignationApplication = async(postResignationApplication:object):Promise<ResignationApplication>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/resignations',
            postResignationApplication);
            return response.data;
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    getAllResignations = async():Promise<ResignationApplication[]>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/resignations');
            return response.data;
        }catch(e){
            throw new Error("Request Failure" +(e as Error).message)
        }
    }
}