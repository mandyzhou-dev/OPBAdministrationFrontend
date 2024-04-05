import { Card, Progress, ProgressFilledTrack, View ,Text, VStack} from "@gluestack-ui/themed"
import { WorkTimeStatisticItem } from "./WorkTimeStatisticItem"
import React, { useEffect } from "react"
import { WorkTimeStatistic } from "@/model/WorkTimeStatistic";
import { getStatisticByGroupAndDate } from "@/service/StatisticService";
interface StatisticListProps {
    start: Date|undefined;
    end:Date|undefined;
}
export const WorkTimeStatisticList: React.FC<StatisticListProps> = ({start,end}) => {
    const[value,setValue] = React.useState(40)

    const[statisticList,setStatisticList] = React.useState<WorkTimeStatistic[]>([]);

    useEffect(()=>{
        if(start != undefined && end != undefined){
            getStatisticByGroupAndDate("groupname",start,end).then(
                (data) => {
                    //console.log(JSON.stringify(data))
                    setStatisticList(data);
                }
            ).catch(
                (error) => {
                    console.log((error as Error).message)
                }
            )
        }
        
    }, [start, end])
    return (
        <View>
            {
                statisticList.map((statistic)=>{               
                    return (
                    <WorkTimeStatisticItem key={statistic.username} value={statistic.hours} name={statistic.userRealName}></WorkTimeStatisticItem>);
                })
            }
            
        </View>
    )
}