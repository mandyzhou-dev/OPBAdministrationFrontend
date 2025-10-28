import { StatutoryHoliday } from "@/model/StatutoryHoliday";
import { getStatutoryHoliday } from "@/service/StatutoryHolidayService";
import axios, { AxiosResponse } from "axios";
export class StatutoryHolidayRequest {

    getStatutoryHoliday = async():Promise<StatutoryHoliday[]>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL + "api/shift/statutory-holidays");
            return response.data;
        }catch(e){
            throw new Error("Request Failure: " + (e as Error).message);
        }
    }
}