import axios, { AxiosResponse } from "axios";

export class RateRequest {
    getRate = async (): Promise<number> => {
        try {
            const response: AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL + 'api/shift/kpi-rate');
            return response.data;
        } catch (e) {
            throw new Error("Get Rate Failure: " + (e as Error).message);
        }
    };

    updateRate = async (rate: number): Promise<Object> => {
        try {
            const response: AxiosResponse = await axios.put(`${process.env.EXPO_PUBLIC_API_URL}api/shift/kpi-rate?rate=${rate}`);
            return response.data;
        } catch (e) {
            throw new Error("Update Rate Failure: " + (e as Error).message);
        }
    };
}
