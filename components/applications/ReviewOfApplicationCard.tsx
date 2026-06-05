import { Heading, BadgeText, Text, Card, HStack, CircleIcon, BadgeIcon, InfoIcon, VStack, Button, Tooltip, TooltipContent, TooltipText, Textarea, TextareaInput } from "@gluestack-ui/themed"
import React from "react";
import moment from "moment";
import { LeaveApplication } from "@/model/LeaveApplication";
import { ProofStatusBadge } from "@/components/applications/ProofStatus";
import { getProofStatusDisplay } from "@/components/applications/adminProofStatus";
interface ReviewOfApplicationCardProps {
    application: LeaveApplication,
    onClick:Function
}
export const ReviewOfApplicationCard: React.FC<ReviewOfApplicationCardProps> = ({ application,onClick }) => {
    const proofStatus = getProofStatusDisplay(application);
    const showProofStatus = proofStatus.shouldShowOnCard;
    const hasMissingProof = proofStatus.kind === "missing";
    const review=()=>{
        onClick();
    }
    return (
        <Card
            data-testid="review-application-card"
            margin={10}
            width={360}
            borderLeftWidth={hasMissingProof ? 3 : 0}
            borderLeftColor={hasMissingProof ? "#F59E0B" : undefined}
        >
            <Heading margin={3}>
                {application.applicant}
            </Heading>
            <HStack margin={3}>
                <VStack w={"10%"}>
                    <BadgeIcon as={CircleIcon} color={(application.leaveType == "SICK") ? "green" : "$red500"} />
                </VStack>
                <VStack w={"85%"} space="xs">
                    <BadgeText >{application.leaveType}</BadgeText>
                    {showProofStatus ? <ProofStatusBadge proofStatus={proofStatus} variant="review" /> : null}
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
            <VStack>
                <Heading>
                    Comment
                </Heading>
                <Textarea
                    size="md"
                    isReadOnly
                    w="$64"
                >
                    <TextareaInput value={application.reason} />
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
