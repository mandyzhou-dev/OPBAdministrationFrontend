import { BadgeText, Text, Card, Input, InputField, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button, Tooltip, TooltipContent, TooltipText } from "@gluestack-ui/themed"
interface ApplicationCardforEProps{
    leaveType:string,
    leaveTime:string
}
export const ApplicationCardforE: React.FC<ApplicationCardforEProps> = ({leaveType,leaveTime}) => {
    return(
        <Card margin={10} width={360}>
                    <HStack margin={3}>
                        <VStack w={"10%"}>
                            <BadgeIcon as={CircleIcon} color={(leaveType=="Sick Leave")?"green":"$red500"} />
                        </VStack>
                        <VStack w={"85%"}>
                            <BadgeText >{leaveType}</BadgeText>
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
                                {leaveTime}
                            </Text>
                        </VStack >
                        <VStack w={"25%"}>
                            <Text>
                                one day
                            </Text>
                        </VStack>
                    </HStack>

                    <Text margin={3}>
                        Approved by Admin
                    </Text>
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