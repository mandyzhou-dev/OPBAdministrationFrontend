import { Employment } from "@/model/Employment";
import { TerminateInfo } from "@/model/TerminateInfo";
import axios, { AxiosResponse } from "axios";
export class EmploymentRequest {
    terminate = async (username:string, terminateInfo:TerminateInfo): Promise<Object> => {
        try {
            const response: AxiosResponse<Object> = await axios.post(
                process.env.EXPO_PUBLIC_API_URL + 'api/employment/'+username+'/terminate',
                terminateInfo
            );
            return response.data;
        } catch (e) {
            throw new Error("Post Failure: " + (e as Error).message);
        }
    };

    getEmploymentByUsername = async (username:string): Promise<Employment> => {
        try {
            const response: AxiosResponse = await axios.get(
                process.env.EXPO_PUBLIC_API_URL + 'api/employment/'+username+'/employment');
            return response.data;
        } catch (e) {
            throw new Error("Get Failure: " + (e as Error).message);
        }
}
}