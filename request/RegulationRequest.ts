import { Regulation } from "@/model/Regulation";
import axios, { AxiosResponse } from "axios";

export class RegulationRequest {
    getRegulationById = async (regulationId: number): Promise<Regulation> => {
        try {
            const response: AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/regulation/'+regulationId);
            return response.data;
        } catch (e) {
            throw new Error("Request Failure: " + (e as Error).message);
        }
    };

    putRegulationById = async (regulationId: number, regulation: Regulation): Promise<Object> => {
        try {
            const response: AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL+'api/regulation/'+regulationId,
            regulation);
            return response.data;
        } catch (e) {
            throw new Error("Put Failure: " + (e as Error).message);
        }
    };
}
