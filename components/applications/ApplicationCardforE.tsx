import {CheckIcon, Textarea,TextareaInput,BadgeText, Text, Card, Input, InputField, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button, Tooltip, TooltipContent, TooltipText, Heading, CloseIcon } from "@gluestack-ui/themed"
interface ApplicationCardforEProps{
    leaveType:string,
    start:string,
    end:string,
    status:string
}
export const ApplicationCardforE: React.FC<ApplicationCardforEProps> = ({leaveType,start,end,status,rejectReason}) => {
    return(
        <Card margin={10} width={360}>
                    <HStack margin={3}>
                        <VStack w={"10%"}>
                            <BadgeIcon as={CircleIcon} color={(leaveType=="SICK")?"green":"$red500"} />
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
                                {start}
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
                        <BadgeIcon as={(status=="approved")?CheckIcon:CloseIcon} />
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
                    <TextareaInput value={rejectReason} />
                </Textarea>
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