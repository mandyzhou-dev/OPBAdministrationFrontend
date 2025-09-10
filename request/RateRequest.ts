import axios, { AxiosResponse } from "axios";

export class RateRequest {
    getRate = async (): Promise<number> => {
        try {
            const response: AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL + 'api/shift/kpi/target-rate');
            return response.data;
        } catch (e) {
            throw new Error("Request Failure: " + (e as Error).message);
        }
    };

    updateRate = async (targetRate: number): Promise<Object> => {
        try {
            const response: AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL + 'api/shift/kpi/target-rate',{targetRate});
            return response.data;
        } catch (e) {
            throw new Error("Put Failure: " + (e as Error).message);
        }
    };
    getBonusRate = async (): Promise<number> => {
        try {
            const response: AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL + 'api/shift/kpi/bonus-rate');
            return response.data;
        } catch (e) {
            throw new Error("Request Failure: " + (e as Error).message);
        }
    };

    updateBonusRate = async (bonusRate: number): Promise<Object> => {
        try {
            const response: AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL + 'api/shift/kpi/bonus-rate',{bonusRate});
            return response.data;
        } catch (e) {
            throw new Error("Put Failure: " + (e as Error).message);
        }
    };
}
