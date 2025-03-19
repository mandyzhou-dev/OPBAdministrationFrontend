import axios, { AxiosResponse } from "axios";
export class StatutoryHolidayRequest {
    getHolidays = async (): Promise<string[]> => {
        try {
            const response: AxiosResponse<string[]> = await axios.get(
                process.env.EXPO_PUBLIC_API_URL + "api/shift/statutory-holidays"
            );
            return response.data;
        } catch (e) {
            throw new Error("Request Failure: " + (e as Error).message);
        }
    };
}