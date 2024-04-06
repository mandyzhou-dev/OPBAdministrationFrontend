import { ApplicationCardforE } from "@/components/applications/ApplicationCardforE"
import { LeaveApplication } from "@/model/LeaveApplication"
import { getApplicationByApplicant } from "@/service/ApplicationService"
import { BadgeText, Text, Card, Input, InputField, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button } from "@gluestack-ui/themed"
import moment from "moment"
import React from "react"
import { useEffect } from "react"
import { DeviceEventEmitter } from "react-native"

export default function MyApplications() {
    const [applicationList, setApplicationList] = React.useState<LeaveApplication[]>([])
    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('user'));
        getApplicationByApplicant(user.name).then(
            (data) => {
                setApplicationList(data);
                console.log(applicationList);
            }
        ).catch(
            (error) => {
                console.log((error as Error).message)
            }
        )
    },[setApplicationList])
    return (
        <ScrollView>
            <Card>
                <Text>
                    Range
                </Text>
                <Input>
                    <InputField value="default all range" />
                </Input>
            </Card>

            <HStack flexWrap="wrap">
                {
                    applicationList.map((application) => {
                        return (
                            <ApplicationCardforE
                                key={application.id}
                                leaveType={application.leaveType}
                                start={moment(application.start).format("YYYY-MM-DD HH:mm")}
                                end={moment(application.end).format("YYYY-MM-DD HH:mm")}
                                status={application.status} 
                                rejectReason={application.rejectReason}/>
                        )
                    })
                }


            </HStack>
        </ScrollView>
    )
}