import { WorkTimeStatistic } from "@/model/WorkTimeStatistic";
import axios, { AxiosResponse } from "axios";

export class StatisticRequest{
    getByGroupAndDate = async (groupname:string,start: Date, end:Date): Promise<WorkTimeStatistic[]> => {
        try{
            
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/presentor/statistic/work-time-statistic/group/{groupname}',{
                params:{
                    start: start,
                    end: end,
                }
            });
            return response.data;
        }catch (e) {
            throw new Error("Request Failure" + (e as Error).message)
        }
    }
}