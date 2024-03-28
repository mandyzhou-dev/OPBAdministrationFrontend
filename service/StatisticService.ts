import { WorkTimeStatistic } from "@/model/WorkTimeStatistic";
import { StatisticRequest } from "@/request/StatisticRequest";

export const getStatisticByGroupAndDate = async (groupname:string,start:Date,end:Date):Promise<WorkTimeStatistic[]>=>{
    const statisticRequest = new StatisticRequest();
    let workTimeStatisticList:WorkTimeStatistic[] = await statisticRequest.getByGroupAndDate(groupname,start,end);
    return workTimeStatisticList;
}