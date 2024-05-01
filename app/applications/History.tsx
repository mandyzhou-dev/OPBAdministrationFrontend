import { HStack, ScrollView } from "@gluestack-ui/themed";
import React, { useEffect } from "react";
import { getAllApplication } from "@/service/ApplicationService";
import { LeaveApplication } from "@/model/LeaveApplication";

import { HistoryApplicationCard } from "@/components/applications/HistoryApplicationCard";

export default function History(){
    const [applicationList,setApplicationList] = React.useState<LeaveApplication[]>([]);
    useEffect(() => {
        let user = JSON.parse(localStorage.getItem("user") as string);
        /*if (user == null) {
            listener = DeviceEventEmitter.addListener('userlogin', () => {
                setRefreshCount(refreshCount + 1)
            })
            return;
        }*/
        //if (user.roles == 'Manager') {
            getAllApplication().then(
                (data) => {
                    //console.log(JSON.stringify(data))
                    setApplicationList(data)
                }).catch(
                    (error) => {
                        console.log((error as Error).message)
                    }
                )
        //}

    },[setApplicationList])
    return (
        <ScrollView>
            <HStack flexWrap="wrap">
                {
                    applicationList.map((application) => {
                        return (
                            <div key={application.id}>
                                <HistoryApplicationCard key={application.id} 
                                application={application}/>
                            </div>
                        )
                    })
                }
            </HStack>
        </ScrollView>
    ) 
}