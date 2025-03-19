import { StatutoryHolidayRequest } from "@/request/StatutoryHolidayRequest";

export const getStatutoryHolidays = async ():Promise<string[]>=>{
    const statutoryHolidayRequest = new StatutoryHolidayRequest()
    const holidays = await statutoryHolidayRequest.getHolidays();
    return holidays;
}