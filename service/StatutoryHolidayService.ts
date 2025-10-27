import { StatutoryHoliday } from "@/model/StatutoryHoliday";
import { StatutoryHolidayRequest } from "@/request/StatutoryHolidayRequest";

export const getStatutoryHolidays = async ():Promise<string[]>=>{//TODO: refactor this function by getStatutoryHoliday
    const statutoryHolidayRequest = new StatutoryHolidayRequest()
    const holidays = await statutoryHolidayRequest.getHolidays();
    return holidays;
}

export const getStatutoryHoliday = async():Promise<StatutoryHoliday[]>=>{
    const statutoryHolidayRequest = new StatutoryHolidayRequest()
    const statutoryHolidays = await statutoryHolidayRequest.getStatutoryHoliday();
    return statutoryHolidays;
}