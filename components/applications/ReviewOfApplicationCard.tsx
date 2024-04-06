import { Heading, BadgeText, Text, Card, Input, InputField, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button, Tooltip, TooltipContent, TooltipText, Textarea, TextareaInput } from "@gluestack-ui/themed"
import React from "react";
import { useEffect } from "react";
interface ReviewOfApplicationCardProps {
    name: string
    leaveType: string,
    start: string,
    end: string,
    reason: string,
    onClick:Function
}
export const ReviewOfApplicationCard: React.FC<ReviewOfApplicationCardProps> = ({ name, leaveType, start, end, reason,onClick }) => {
    const review=()=>{
        onClick();
    }
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
            </VStack>

            <VStack margin={3}>
                <Button variant="outline" action="primary" onPress={()=>review()}>
                    <BadgeText >Approve or Decline</BadgeText>
                </Button>
            </VStack>
                    
        </Card>
    )
}