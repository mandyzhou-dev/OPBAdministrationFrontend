import { Heading, ButtonText,  Pressable, BadgeText, Text, Card, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button, Tooltip, TooltipContent, TooltipText, Textarea, TextareaInput, CheckIcon, CloseIcon, Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@gluestack-ui/themed"
import React from "react";
import { MaterialIcons } from '@expo/vector-icons';
import moment from "moment";
import { LeaveApplication } from "@/model/LeaveApplication";
import { addNote } from "@/service/ApplicationService";
import { ProofStatusBadge, ProofStatusSummary } from "@/components/applications/ProofStatus";
import { getProofStatusDisplay } from "@/components/applications/adminProofStatus";
interface HistoryApplicationCardProps {
    application:LeaveApplication
}

const COMMENT_SUMMARY_LINES = 2;
const NOTE_SUMMARY_LINES = 3;
const SUMMARY_LINE_HEIGHT = 20;
const HISTORY_CARD_MIN_HEIGHT = 330;

export const HistoryApplicationCard: React.FC<HistoryApplicationCardProps> = ({ application }) => {
    const [noteValue, setNoteValue] = React.useState(application.note);
    const [readValue, setReadValue] = React.useState(true);
    const [showOP, setShowOP] = React.useState(false);
    const [showDetails, setShowDetails] = React.useState(false);
    const proofStatus = getProofStatusDisplay(application);
    const showProofStatus = proofStatus.shouldShowOnCard;

    const openDetails = () => setShowDetails(true);

    const handleDetailsKeyDown = (event: any) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault?.();
            openDetails();
        }
    };

    const detailButtonWebProps = {
        onKeyDown: handleDetailsKeyDown,
        role: "button",
        "aria-label": "View record details",
        tabIndex: 0,
    } as any;

    const renderSummaryText = (value?: string | null, numberOfLines = COMMENT_SUMMARY_LINES, emptyText = "-") => (
        <Text
            numberOfLines={numberOfLines}
            ellipsizeMode="tail"
            color={value?.trim() ? "$textDark900" : "$textLight500"}
            style={{ lineHeight: SUMMARY_LINE_HEIGHT, maxHeight: SUMMARY_LINE_HEIGHT * numberOfLines }}
        >
            {value?.trim() ? value : emptyText}
        </Text>
    );

    const renderDetailSection = (title:string, value?: string | null) => (
        <VStack marginBottom={12}>
            <Heading size="md">
                {title}
            </Heading>
            <Text>
                {value?.trim() ? value : "-"}
            </Text>
        </VStack>
    );

    const handle = () => {       
        addNote(application.id??0,noteValue??"").then(
            (data)=>{
                setReadValue(true)
                setShowOP(false)
            }
        )
    }
    return (
        <>
        <Card margin={10} padding={14} width="100%" maxWidth={350} minHeight={HISTORY_CARD_MIN_HEIGHT}>
            <HStack alignItems="flex-start" justifyContent="space-between" marginBottom={6}>
                <VStack flex={1}>
                    <Heading size="lg" numberOfLines={1}>
                        {application.applicant}
                    </Heading>
                    <Text size="sm" color="$textLight600">
                        {application.status}
                        <BadgeIcon as={(application.status == "approved") ? CheckIcon : CloseIcon} marginLeft={4} />
                    </Text>
                </VStack>
            </HStack>
            <HStack margin={3}>
                <VStack w={"10%"}>
                    <BadgeIcon as={CircleIcon} color={(application.leaveType == "SICK") ? "green" : "$red500"} />
                </VStack>

                <VStack w={"85%"}>
                    <BadgeText >{application.leaveType}</BadgeText>
                    {showProofStatus ? <ProofStatusBadge proofStatus={proofStatus} variant="history" /> : null}
                    {proofStatus.kind === "submitted" && (proofStatus.uploadedAtText || proofStatus.filenameText) ?
                        <Text fontSize={12} color="$textLight600" numberOfLines={1} ellipsizeMode="middle" style={{ lineHeight: 18 }}>
                            {[proofStatus.uploadedAtText ? `Uploaded ${moment(application.sickProofUploadedAt).format("MMM D")}` : undefined, proofStatus.filenameText].filter(Boolean).join(" · ")}
                        </Text>
                        : null}
                </VStack>

                <VStack w={"5%"}>
                    <Tooltip
                        placement="top"
                        trigger={(value) => {
                            return (
                                <Pressable
                                    onPress={openDetails}
                                    accessibilityLabel="View record details"
                                    accessibilityRole="button"
                                    {...detailButtonWebProps}
                                    minHeight={32}
                                    minWidth={32}
                                    alignItems="center"
                                    justifyContent="center"
                                    $hover-bg="$secondary100"
                                    $focus-bg="$secondary100"
                                >
                                    <BadgeIcon as={InfoIcon} mr={"$2"} />
                                </Pressable>)
                        }}>
                        <TooltipContent>
                            <TooltipText>
                                View record details
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

            <VStack marginTop={8} space="sm">
                <VStack>
                    <Heading size="sm" color="$textLight700">
                        Comment
                    </Heading>
                    {renderSummaryText(application.reason)}
                </VStack>
                {application.rejectReason ? <VStack><Heading size="sm" color="$textLight700">
                    Reject Reason
                </Heading>{renderSummaryText(application.rejectReason)}</VStack> : null}
                <VStack>
                    <HStack alignItems="center">
                        <Heading size="sm" color="$textLight700">
                            Note
                        </Heading>
                        <Pressable
                            onPress={() => {
                                setReadValue(false)
                                setShowOP(true)
                            }}
                            $hover-bg="$secondary100"
                            accessibilityLabel="Edit note"
                        >
                            <MaterialIcons name="edit" size={14} color="#555555" />
                        </Pressable>
                    </HStack>

                    {showOP ? <Textarea
                        size="md"
                        isReadOnly={readValue}
                        width="100%"
                        h={72}

                    >
                        <TextareaInput value={noteValue??""} onChangeText={(e)=>setNoteValue(e)} />
                    </Textarea> : renderSummaryText(noteValue, NOTE_SUMMARY_LINES, "No note")}
                </VStack>

                {showOP ? <HStack>
                    <Button size="sm" action="negative" margin={3} onPress={()=>{setShowOP(false); setNoteValue(application.note)}}>
                        <ButtonText>
                            Cancel
                        </ButtonText></Button>
                    <Button size="sm" action="positive" margin={3} onPress={handle}>
                        <ButtonText>OK</ButtonText>
                        </Button>
                </HStack> : null}

            </VStack>
        </Card>
        <Modal
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
        >
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Heading size="lg">
                        History Details
                    </Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <ScrollView maxHeight={420}>
                        <ProofStatusSummary application={application} />
                        {renderDetailSection("Comment", application.reason)}
                        {application.rejectReason ? renderDetailSection("Reject Reason", application.rejectReason) : null}
                        {renderDetailSection("Note", noteValue)}
                    </ScrollView>
                </ModalBody>
                <ModalFooter>
                    <Button action="secondary" variant="outline" onPress={() => setShowDetails(false)}>
                        <ButtonText>Close</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}
