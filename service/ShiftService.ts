import { ScheduleTable } from "@/components/shift/ScheduleTable";
import { ShiftRequest} from "@/request/ShiftRequest"
import {Schedule} from "@/model/Schedule"
import {User} from "@/model/User"
import { getFirstDayOfTheWeek } from "@/util/DateUtil";
import { Shift } from "@/model/Shift";
import moment, { Moment } from "moment-timezone";
import dayjs, { Dayjs } from "dayjs";
import { kpi } from "@/model/KPI";

const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const getScheduleThisWeek = async (today: Moment): Promise<Schedule[]> => {
    const shiftRequest = new ShiftRequest()
    let sunday = moment(today).startOf('week')
    console.log("sunday:" + sunday.format('YYYY-MM-DD HH:mm:ss'))
    let saturday = moment(today).endOf('week')
    console.log("saturday:" + saturday.format('YYYY-MM-DD HH:mm:ss'))
    const shiftArray = await shiftRequest.getByStartDateScope(sunday, saturday)
    console.log(JSON.stringify(shiftArray))
    let scheduleTable:Schedule[] = Array.from({length: 7}, () => new Schedule())
    scheduleTable.forEach((schedule, index) => {schedule.day = day[index];
        let tempDate = moment(sunday)
        schedule.date = moment(tempDate.date(sunday.date()+index))})
    shiftArray.forEach((shift) => {
        if(shift.start != undefined){
            let newDate = moment(shift.start)
            scheduleTable[newDate.day()].workers.push(new User(shift.username, shift.userRealName));
            scheduleTable[newDate.day()].shifts.set(shift.username,shift);
        }
    })
    return scheduleTable;
}

export const getUserScheduleThisWeek = async (username:string, today: Moment): Promise<Schedule[]> => {
    const shiftRequest = new ShiftRequest()
    let sunday = moment(today).startOf('week')
    let saturday = moment(today).endOf('week');
    const shiftArray = await shiftRequest.getByUsernameAndStartDateScope(username, sunday, saturday)
    console.log(JSON.stringify(shiftArray))
    let scheduleTable:Schedule[] = Array.from({length: 7}, () => new Schedule())
    scheduleTable.forEach((schedule, index) => {schedule.day = day[index];
        let tempDate = moment(sunday)
        schedule.date = moment(tempDate.date(sunday.date()+index))})
    shiftArray.forEach((shift) => {
        if(shift.start != undefined){
            let newDate = new Date(shift.start)
            scheduleTable[newDate.getDay()].workers.push(new User(shift.username, shift.userRealName));
            scheduleTable[newDate.getDay()].shifts.set(shift.username,shift);
        }
    })
    return scheduleTable;
}

export const batchByDate = async(workDate:Moment,group:string,usernameList:string[]):Promise<Object>=>{
    const shiftRequest = new ShiftRequest()
    console.log("Workdate " + workDate);
    const dateString = workDate.format()
    console.log("Debug Timezone: " + dateString);
    return shiftRequest.batchCreateByDate(dateString,group, usernameList)
}

export const deleteCurrentShift = async(currentShift: Shift):Promise<Object>=>{
    const shiftRequest = new ShiftRequest();
    return shiftRequest.deleteCurrentShift(currentShift)
}

export const modifyCurrentShift = async(currentShift:Shift):Promise<Object>=>{
    const shiftRequest = new ShiftRequest();
    return shiftRequest.modifyCurrentShift(currentShift)
}
export const getKPIByDateAndGroup = async(group:string,date:Dayjs):Promise<kpi>=>{
    const shiftRequest = new ShiftRequest();
    return shiftRequest.getKPIByDateAndGroup(group,date);
}