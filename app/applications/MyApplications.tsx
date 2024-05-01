import { ApplicationCardforE } from "@/components/applications/ApplicationCardforE"
import { LeaveApplication } from "@/model/LeaveApplication"
import { getApplicationByApplicant } from "@/service/ApplicationService"
import { Text, Card, Input, InputField, ScrollView, HStack } from "@gluestack-ui/themed"
import React from "react"
import { useEffect } from "react"
import { DeviceEventEmitter } from "react-native"

export default function MyApplications() {
    const [applicationList, setApplicationList] = React.useState<LeaveApplication[]>([])
    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('user') as string);
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
                                application={application}/>
                        )
                    })
                }


            </HStack>
        </ScrollView>
    )
}