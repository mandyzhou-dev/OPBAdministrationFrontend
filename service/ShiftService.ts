import { ScheduleTable } from "@/components/shift/ScheduleTable";
import { ShiftRequest} from "@/request/ShiftRequest"
import {Schedule} from "@/model/Schedule"
import {User} from "@/model/User"
import { getFirstDayOfTheWeek } from "@/util/DateUtil";
import { Shift } from "@/model/Shift";

const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const getScheduleThisWeek = async (today: Date): Promise<Schedule[]> => {
    const shiftRequest = new ShiftRequest()
    let sunday = getFirstDayOfTheWeek(today)
    let saturday = new Date(sunday);
    saturday.setDate(saturday.getDate() + 6)
    sunday.setHours(0); sunday.setMinutes(0); sunday.setSeconds(0)
    saturday.setHours(23); saturday.setMinutes(59); saturday.setSeconds(59)
    const shiftArray = await shiftRequest.getByStartDateScope(sunday, saturday)
    console.log(JSON.stringify(shiftArray))
    let scheduleTable:Schedule[] = Array.from({length: 7}, () => new Schedule())
    scheduleTable.forEach((schedule, index) => {schedule.day = day[index];
        let tempDate = new Date(sunday)
        schedule.date = new Date(tempDate.setDate(sunday.getDate()+index))})
    shiftArray.forEach((shift) => {
        if(shift.start != undefined){
            let newDate = new Date(shift.start)
            scheduleTable[newDate.getDay()].workers.push(new User(shift.username, shift.userRealName));
            scheduleTable[newDate.getDay()].shifts.set(shift.username,shift);
        }
    })
   
    return scheduleTable;
}

export const getUserScheduleThisWeek = async (username:string, today: Date): Promise<Schedule[]> => {
    const shiftRequest = new ShiftRequest()
    let sunday = getFirstDayOfTheWeek(today)
    let saturday = new Date(sunday);
    saturday.setDate(saturday.getDate() + 6)
    sunday.setHours(0); sunday.setMinutes(0); sunday.setSeconds(0)
    saturday.setHours(23); saturday.setMinutes(59); saturday.setSeconds(59)
    const shiftArray = await shiftRequest.getByUsernameAndStartDateScope(username, sunday, saturday)
    console.log(JSON.stringify(shiftArray))
    let scheduleTable:Schedule[] = Array.from({length: 7}, () => new Schedule())
    scheduleTable.forEach((schedule, index) => {schedule.day = day[index];
        let tempDate = new Date(sunday)
        schedule.date = new Date(tempDate.setDate(sunday.getDate()+index))})
    shiftArray.forEach((shift) => {
        if(shift.start != undefined){
            let newDate = new Date(shift.start)
            scheduleTable[newDate.getDay()].workers.push(new User(shift.username, shift.userRealName));
            scheduleTable[newDate.getDay()].shifts.set(shift.username,shift);
        }
    })
   
    return scheduleTable;
}

export const batchByDate = async(workDate:Date,usernameList:string[]):Promise<Object>=>{
    const shiftRequest = new ShiftRequest()
    return shiftRequest.batchCreateByDate(workDate,usernameList)
}

export const deleteCurrentShift = async(currentShift: Shift):Promise<Object>=>{
    const shiftRequest = new ShiftRequest();
    return shiftRequest.deleteCurrentShift(currentShift)
}

export const modifyCurrentShift = async(currentShift:Shift):Promise<Object>=>{
    const shiftRequest = new ShiftRequest();
    return shiftRequest.modifyCurrentShift(currentShift)
}