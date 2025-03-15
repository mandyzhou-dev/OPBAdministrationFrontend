import { WorkTimeStatistic } from "@/model/WorkTimeStatistic";
import { StatisticRequest } from "@/request/StatisticRequest";
import moment from "moment";

export const getStatisticByDate = async (start:Date,end:Date):Promise<WorkTimeStatistic[]>=>{
    const startMoment = moment().year(start.getFullYear()).month(start.getMonth()).date(start.getDate()).hour(start.getHours()).minute(start.getMinutes()).second(start.getSeconds())
    const endMoment = moment().year(end.getFullYear()).month(end.getMonth()).date(end.getDate()).hour(end.getHours()).minute(end.getMinutes()).second(end.getSeconds())
    
    const statisticRequest = new StatisticRequest();
    let workTimeStatisticList:WorkTimeStatistic[] = await statisticRequest.getByDate(startMoment,endMoment);
    return workTimeStatisticList;
}