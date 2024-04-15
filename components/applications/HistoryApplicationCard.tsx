import { Heading, BadgeText, Text, Card, Input, InputField, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button, Tooltip, TooltipContent, TooltipText, Textarea, TextareaInput, CheckIcon, CloseIcon } from "@gluestack-ui/themed"
import React from "react";
import { useEffect } from "react";
import { TextInput } from "react-native-paper";
import { SettingsContext } from "react-native-paper/lib/typescript/core/settings";
interface HistoryApplicationCardProps {
    name: string
    leaveType: string,
    start: string,
    end: string,
    reason: string,
    rejectReason: string,
    status: string,
    note:string
}
export const HistoryApplicationCard: React.FC<HistoryApplicationCardProps> = ({ name, leaveType, start, end, reason, rejectReason, status ,note}) => {
    const [noteValue,setNoteValue] = React.useState('');
    return (
        <Card margin={10} width={360}>
            <Heading margin={3}>
                {name}
            </Heading>
            <HStack margin={3}>
                <VStack w={"10%"}>
                    <BadgeIcon as={CircleIcon} color={(leaveType == "SICK") ? "green" : "$red500"} />
                </VStack>

                <VStack w={"85%"}>
                    <BadgeText >{leaveType}</BadgeText>
                </VStack>

                <VStack w={"5%"}>
                    <Tooltip
                        placement="top"
                        trigger={(value) => {
                            return (
                                <BadgeIcon as={InfoIcon} mr={"$2"} />)
                        }}>
                        <TooltipContent>
                            <TooltipText>
                                hdfjksafk
                            </TooltipText>

                        </TooltipContent>
                    </Tooltip>

                </VStack>
            </HStack>

            <HStack margin={3}>
                <VStack w={"85%"}>
                    <Text>
                        {start}
                    </Text>
                </VStack >
                <VStack w={"25%"}>
                    <Text>
                        .
                    </Text>
                </VStack>
            </HStack>
            <HStack margin={3}>
                <VStack w={"85%"}>
                    <Text>
                        {end}
                    </Text>
                </VStack >
                <VStack w={"25%"}>
                    <Text>

                    </Text>
                </VStack>
            </HStack>

            <Text margin={3}>
                {status}
                <BadgeIcon as={(status == "approved") ? CheckIcon : CloseIcon} />
            </Text>

            <VStack>
                <Heading>
                    Comment
                </Heading>
                <Textarea
                    size="md"
                    isReadOnly
                    w="$64"
                >
                    <TextareaInput value={reason} />
                </Textarea>
                <Heading>
                    Reject Reason(If has)
                </Heading>
                <Text>
                    {rejectReason}
                </Text>
                
                
            </VStack>



        </Card>
    )
}