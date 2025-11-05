import { ResignationApplication } from "@/model/ResignationApplication";
import axios, { AxiosResponse } from "axios";

export class ResignationApplicationRequest{
    postResignationApplication = async (postResignationApplication: object): Promise<ResignationApplication> => {
        try {
            const response: AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL + 'api/resignations',
                postResignationApplication);
            return response.data;
        } catch (e: any) {
            const backendMessage = e.response?.data?.message;
            throw new Error(backendMessage ??"You already have a pending resignation.To make any changes to your resignation request, please contact the system administrator."
);//Bug fix: Cannot get the backendMessage
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

    reviewApplicationById = async(id:number):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL+'api/resignations/'+id);
            return response.data;
        }catch(e){
            throw new Error("Put Error"+(e as Error).message)
        }
    }
}