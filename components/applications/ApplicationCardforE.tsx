import {CheckIcon, Textarea,TextareaInput,BadgeText, Text, Card, Input, InputField, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button, Tooltip, TooltipContent, TooltipText, Heading, CloseIcon } from "@gluestack-ui/themed"
import { LeaveApplication } from "@/model/LeaveApplication";
import moment from "moment"
interface ApplicationCardforEProps{
    application:LeaveApplication
}
export const ApplicationCardforE: React.FC<ApplicationCardforEProps> = ({application}) => {
    return(
        <Card margin={10} width={360}>
                    <HStack margin={3}>
                        <VStack w={"10%"}>
                            <BadgeIcon as={CircleIcon} color={(application.leaveType=="SICK")?"green":"$red500"} />
                        </VStack>
                        <VStack w={"85%"}>
                            <BadgeText >{application.leaveType}</BadgeText>
                        </VStack>
                        <VStack w={"5%"}>
                            <Tooltip
                                placement="top"
                                trigger={(value)=>{
                                    return(
                                    <BadgeIcon as={InfoIcon} mr={"$2"}/>)
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
                        <BadgeIcon as={(application.status=="approved")?CheckIcon:CloseIcon} />
                    </Text>
                    <VStack>
                <Heading size="md">
                    Comment
                </Heading>
                <Text>
                    {application.reason}
                </Text>
               
                
                
          
                {application.rejectReason?<VStack><Heading size="md">
                    Reject Reason
                </Heading><Text>{application.rejectReason}</Text></VStack>:null}
                
            </VStack>
                    <HStack margin={3}>
                        <VStack w={"50%"}>

                        </VStack>
                        <VStack w={"50%"}>
                            <Button variant="link" action="negative">
                                <BadgeText >Cancel Request</BadgeText>
                            </Button>
                        </VStack>
                    </HStack>

                </Card>
    )
}