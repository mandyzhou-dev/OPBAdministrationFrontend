import { ScheduleTable } from "@/components/shift/ScheduleTable";
import { ShiftRequest } from "@/request/ShiftRequest"
import {Schedule} from "@/model/Schedule"
import {User} from "@/model/User"
import { getFirstDayOfTheWeek } from "@/util/DateUtil";

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
        schedule.date = new Date(sunday.setDate(sunday.getDate()+index))})
    shiftArray.forEach((shift) => {
        if(shift.start != undefined){
            let newDate = new Date(shift.start)
            scheduleTable[newDate.getDay()].workers.push(new User(shift.username, shift.userRealName));
        }
    })
    return scheduleTable;
}