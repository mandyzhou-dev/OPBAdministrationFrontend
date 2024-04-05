import { ApplicationCardforE } from "@/components/applications/ApplicationCardforE"
import { BadgeText, Text, Card, Input, InputField, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button } from "@gluestack-ui/themed"

export default function MyApplications() {
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

            <HStack >
                
                <ApplicationCardforE
                    leaveType = "Sick Leave"
                    leaveTime="2024/04/01"/>

                <ApplicationCardforE 
                    leaveType = "Personel Leave"
                    leaveTime="2024/04/01"/>

            </HStack>
        </ScrollView>
    )
}