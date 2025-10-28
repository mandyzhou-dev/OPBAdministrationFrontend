import { StatutoryHoliday } from "@/model/StatutoryHoliday";
import { StatutoryHolidayRequest } from "@/request/StatutoryHolidayRequest";

export const getStatutoryHoliday = async():Promise<StatutoryHoliday[]>=>{
    const statutoryHolidayRequest = new StatutoryHolidayRequest()
    const statutoryHolidays = await statutoryHolidayRequest.getStatutoryHoliday();
    return statutoryHolidays;
}