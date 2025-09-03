import { ResignationApplication } from "@/model/ResignationApplication";
import axios, { AxiosResponse } from "axios";

export class ResignationApplicationRequest{
    postResignationApplication = async(postResignationApplication:object):Promise<ResignationApplication>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/resignation',
            postResignationApplication);
            return response.data;
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }
}