import { PreferWorkdays } from "@/model/PreferWorkdays";
import { ShiftBoardRequest } from "@/request/ShiftBoardRequest"
import moment, { Moment } from "moment";


export const updatePreferWorkdayOfCurrentMonth = async(preferWorkdays:PreferWorkdays):Promise<Object> => {
    const currentMonth = await getCurrentMonth();
    preferWorkdays.currentMonth = currentMonth;
    const shiftBoardRequest  = new ShiftBoardRequest()
    const object = shiftBoardRequest.updatePreferWorkday(preferWorkdays);
    return object;
}

export const getPreferredEmployeesBydate = async(date:Moment):Promise<string[]>=>{
    const dateMoment = moment().utc().year(date.year()).month(date.month()).date(date.date()).hour(date.hour()).minute(date.minute()).second(date.second())
    const shiftBoardRequest = new ShiftBoardRequest()
    const preferredEmployees = shiftBoardRequest.getPreferredEmployeesBydate(dateMoment);
    return preferredEmployees;
}

export const updatePreferWorkday = async(preferWorkdays:PreferWorkdays):Promise<Object>=>{
    const shiftBoardRequest  = new ShiftBoardRequest()
    const object = shiftBoardRequest.updatePreferWorkday(preferWorkdays);
    return object;
}

export const shiftToNextMonth = async():Promise<Object>=>{
    const shiftBoardRequest = new ShiftBoardRequest()
    const object = shiftBoardRequest.shiftToNextMonth();
    return object;
}

export const getCurrentMonth = async():Promise<number>=>{
    const shiftBoardRequest = new ShiftBoardRequest()
    const currentMonth = shiftBoardRequest.getCurrentMonth();
    return currentMonth;
}

export const getBoardByUser = async(username:string):Promise<Date[]>=>{
    const shiftBoardRequest = new ShiftBoardRequest()
    return shiftBoardRequest.getPreferredDatesByUser(username);
}