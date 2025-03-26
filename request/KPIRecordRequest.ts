import axios, { AxiosResponse } from "axios";
import { KPIRecord } from "@/model/KPIRecord";

export class KPIRecordRequest {


    getByYear = async (year: string): Promise<KPIRecord[]> => {
        try {
            const response: AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL + 'api/shift/kpi-record', {
                params: {
                    year: year
                }
            });
            return response.data;
        } catch (e) {
            throw new Error("Get Failure: " + (e as Error).message);
        }
    };

    create = async (record: KPIRecord): Promise<KPIRecord> => {
        try {
            const response: AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL + 'api/shift/kpi-record',
                record);
            return response.data;
        } catch (e) {
            throw new Error("Post Failure: " + (e as Error).message);
        }
    };

    update = async (id: number, record: KPIRecord): Promise<KPIRecord> => {
        try {
            const response: AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL + `api/shift/kpi-record/${id}`,
                record);
            return response.data;
        } catch (e) {
            throw new Error("Put Failure: " + (e as Error).message);
        }
    };
}
