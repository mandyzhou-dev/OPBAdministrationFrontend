import { PreferWorkdays } from "@/model/PreferWorkdays";
import { ShiftBoardRequest } from "@/request/ShiftBoardRequest"


export const updatePreferWorkdayOfCurrentMonth = async(preferWorkdays:PreferWorkdays):Promise<Object> => {
    const currentMonth = await getCurrentMonth();
    preferWorkdays.currentMonth = currentMonth;
    const shiftBoardRequest  = new ShiftBoardRequest()
    const object = shiftBoardRequest.updatePreferWorkday(preferWorkdays);
    return object;
}

export const getPreferredEmployeesBydate = async(date:Date):Promise<string[]>=>{
    const shiftBoardRequest = new ShiftBoardRequest()
    const preferredEmployees = shiftBoardRequest.getPreferredEmployeesBydate(date);
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