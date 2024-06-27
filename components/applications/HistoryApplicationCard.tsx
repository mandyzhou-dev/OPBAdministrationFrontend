import { Heading, ButtonText,  Pressable, BadgeText, Text, Card, Input, InputField, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button, Tooltip, TooltipContent, TooltipText, Textarea, TextareaInput, CheckIcon, CloseIcon } from "@gluestack-ui/themed"
import React from "react";
import { useEffect } from "react";
import { TextInput } from "react-native-paper";
import { SettingsContext } from "react-native-paper/lib/typescript/core/settings";
import { MaterialIcons } from '@expo/vector-icons';
import moment from "moment";
import { LeaveApplication } from "@/model/LeaveApplication";
import { addNote } from "@/service/ApplicationService";
interface HistoryApplicationCardProps {
    application:LeaveApplication
}
export const HistoryApplicationCard: React.FC<HistoryApplicationCardProps> = ({ application }) => {
    const [noteValue, setNoteValue] = React.useState(application.note);
    const [readValue, setReadValue] = React.useState(true);
    const [showOP, setShowOP] = React.useState(false);
    const handle = () => {       
        addNote(application.id??0,noteValue??"").then(
            (data)=>{
                setReadValue(true)
                setShowOP(false)
            }
        )
    }
    return (
        <Card margin={10} width={360}>
            <Heading margin={3} size="xl">
                {application.applicant}
            </Heading>
            <HStack margin={3}>
                <VStack w={"10%"}>
                    <BadgeIcon as={CircleIcon} color={(application.leaveType == "SICK") ? "green" : "$red500"} />
                </VStack>

                <VStack w={"85%"}>
                    <BadgeText >{application.leaveType}</BadgeText>
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
                        {moment(application.start).format("YYYY-MM-DD HH:mm")}
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
                        {moment(application.end).format("YYYY-MM-DD HH:mm")}
                    </Text>
                </VStack >
                <VStack w={"25%"}>
                    <Text>

                    </Text>
                </VStack>
            </HStack>

            <Text margin={3}>
                {application.status}
                <BadgeIcon as={(application.status == "approved") ? CheckIcon : CloseIcon} />
            </Text>

            <VStack>
                <Heading size="md">
                    Comment
                </Heading>
                <Text>
                    {application.reason}
                </Text>
                {application.rejectReason ? <VStack><Heading size="md">
                    Reject Reason
                </Heading><Text>{application.rejectReason}</Text></VStack> : null}
                <Pressable
                    onPress={() => {
                        setReadValue(false)
                        setShowOP(true)
                    }}
                    $hover-bg="$secondary100"
                >
                    <HStack>
                        <Heading size="md">
                            Note
                        </Heading>
                        <MaterialIcons name="edit" size={24} color="black" />


                    </HStack>
                </Pressable>

                <Textarea
                    size="md"
                    isReadOnly={readValue}
                    w="$64"

                >
                    <TextareaInput value={noteValue??""} onChangeText={(e)=>setNoteValue(e)} />
                </Textarea>

                {showOP ? <HStack>
                    <Button action="negative" margin={3} onPress={()=>{setShowOP(false); setNoteValue(application.note)}}>
                        <ButtonText>
                            Cancel
                        </ButtonText></Button>
                    <Button action="positive" margin={3} onPress={handle}>
                        <ButtonText>OK</ButtonText>
                        </Button>
                </HStack> : null}


            </VStack>



        </Card>
    )
}