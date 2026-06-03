import { BadgeText, Text, Card, ScrollView, HStack, Icon, CircleIcon, BadgeIcon, InfoIcon, VStack, Button, ButtonText, Tooltip, TooltipContent, TooltipText, Heading, CloseIcon, Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Pressable } from "@gluestack-ui/themed"
import { LeaveApplication } from "@/model/LeaveApplication";
import { getDeleteUnavailableMessage, resolveCanDelete } from "@/components/applications/applicationDeleteRules";
import moment from "moment"
import React from "react";
interface ApplicationCardforEProps{
    application:LeaveApplication
    deleteApplication: (application:LeaveApplication)=>void
    uploadSickProof?: (application:LeaveApplication, proof:File | Blob)=>Promise<LeaveApplication | void>
}

const COMMENT_SUMMARY_LINES = 2;
const SUMMARY_LINE_HEIGHT = 20;
const EMPLOYEE_CARD_MIN_HEIGHT = 236;
const SICK_PROOF_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SICK_PROOF_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif,application/pdf,image/png,image/jpeg,image/webp,image/heic,image/heif";
const SICK_PROOF_ALLOWED_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "webp", "heic", "heif"]);
const SICK_PROOF_ALLOWED_TYPES = new Set([
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/heif",
]);

const normalizeStatus = (status?: string | null) => status?.trim().toLowerCase() || "unknown";

const getStatusBadgeStyle = (status?: string | null) => {
    switch (normalizeStatus(status)) {
        case "approved":
            return { backgroundColor: "#DCFCE7", color: "#166534" };
        case "pending":
        case "draft":
            return { backgroundColor: "#FEF3C7", color: "#92400E" };
        case "rejected":
        case "cancelled":
            return { backgroundColor: "#FEE2E2", color: "#991B1B" };
        default:
            return { backgroundColor: "#F3F4F6", color: "#4B5563" };
    }
};

const getFileName = (file:File | Blob) => (file as File)?.name || "";

const isSickLeave = (application:LeaveApplication) => application.leaveType?.trim().toUpperCase() === "SICK";

const requiresSickProof = (application:LeaveApplication) => application.sickProofRequired === true || (application.sickProofRequired !== false && isSickLeave(application));

const validateSickProofFile = (file:File | Blob):string | null => {
    const fileName = getFileName(file);
    const extension = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : "";
    const contentType = (file as File)?.type?.toLowerCase?.() || "";
    if(!extension || !SICK_PROOF_ALLOWED_EXTENSIONS.has(extension)){
        return "Please upload a PDF or image file.";
    }
    if(contentType && !SICK_PROOF_ALLOWED_TYPES.has(contentType)){
        return "Please upload a PDF or image file.";
    }
    if(file.size > SICK_PROOF_MAX_FILE_SIZE_BYTES){
        return "Please upload a file up to 10 MB.";
    }
    return null;
};

export const ApplicationCardforE: React.FC<ApplicationCardforEProps> = ({application,deleteApplication,uploadSickProof}) => {
    const canDelete = resolveCanDelete(application);
    const [showDetails, setShowDetails] = React.useState(false);
    const [isUploadingProof, setIsUploadingProof] = React.useState(false);
    const [proofError, setProofError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const statusBadgeStyle = getStatusBadgeStyle(application.status);
    const statusLabel = normalizeStatus(application.status);
    const showSickProof = requiresSickProof(application);
    const proofSubmitted = application.sickProofSubmitted === true;
    const hasHiddenDetailContent = Boolean(application.rejectReason?.trim()) || (application.reason?.trim()?.length || 0) > 90;
    const detailTriggerTextColor = hasHiddenDetailContent ? "$textLight800" : "$textLight700";
    const detailTriggerTextWeight = hasHiddenDetailContent ? "$semibold" : "$medium";

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
        "aria-label": "View application details",
        tabIndex: 0,
    } as any;

    const renderSummaryText = (value?: string | null) => (
        <Text
            numberOfLines={COMMENT_SUMMARY_LINES}
            ellipsizeMode="tail"
            color={value?.trim() ? "$textLight700" : "$textLight500"}
            fontSize={15}
            style={{ lineHeight: SUMMARY_LINE_HEIGHT, maxHeight: SUMMARY_LINE_HEIGHT * COMMENT_SUMMARY_LINES }}
        >
            {value?.trim() ? value : "-"}
        </Text>
    );

    const renderDetailSection = (title:string, value?: string | null) => (
        <VStack marginBottom={14}>
            <Heading size="sm" color="$textDark900">
                {title}
            </Heading>
            <Text fontSize={15} color="$textLight700" style={{ lineHeight: 22 }}>
                {value?.trim() ? value : "-"}
            </Text>
        </VStack>
    );

    const openProofPicker = () => {
        setProofError(null);
        fileInputRef.current?.click?.();
    };

    const handleProofFileChange = async(event:any) => {
        const file = event?.target?.files?.[0] as File | Blob | undefined;
        if(event?.target){
            event.target.value = "";
        }
        if(!file){
            return;
        }

        const validationError = validateSickProofFile(file);
        if(validationError){
            setProofError(validationError);
            return;
        }
        if(!uploadSickProof){
            setProofError("Proof upload is unavailable. Please try again later.");
            return;
        }

        setIsUploadingProof(true);
        setProofError(null);
        try{
            await uploadSickProof(application,file);
        }catch(error){
            const status = (error as {response?: {status?: number}})?.response?.status;
            if(status===400){
                setProofError("Please upload a PDF or image file up to 10 MB.");
            }else if(status===403){
                setProofError("You can only upload proof for your own sick leave.");
            }else{
                setProofError("Proof upload failed. Please try again.");
            }
        }finally{
            setIsUploadingProof(false);
        }
    };

    const renderSickProofInput = () => React.createElement("input", {
        ref: fileInputRef,
        "data-testid": "sick-proof-file-input",
        type: "file",
        accept: SICK_PROOF_ACCEPT,
        style: { display: "none" },
        onChange: handleProofFileChange,
    });

    const renderSickProofStrip = () => {
        const colors = proofSubmitted ?
            {
                background: "#F0FDF4",
                border: "#86EFAC",
                pillBackground: "#DCFCE7",
                pillText: "#166534",
                message: "#166534",
            } :
            {
                background: "#FFFBEB",
                border: "#FCD34D",
                pillBackground: "#FEF3C7",
                pillText: "#92400E",
                message: "#78350F",
            };
        return (
            <VStack
                data-testid="sick-proof-strip"
                marginTop={12}
                padding={10}
                borderWidth={1}
                borderRadius={8}
                borderColor={colors.border}
                style={{ backgroundColor: colors.background }}
            >
                <HStack alignItems="center" justifyContent="space-between" flexWrap="wrap">
                    <VStack flex={1} minWidth={190} paddingRight={8}>
                        <HStack alignItems="center" marginBottom={4}>
                            <Text
                                fontSize={12}
                                fontWeight="$semibold"
                                borderRadius={999}
                                paddingHorizontal={8}
                                height={24}
                                color={colors.pillText}
                                style={{ backgroundColor: colors.pillBackground, lineHeight: 24 }}
                            >
                                {proofSubmitted ? "Proof submitted" : "Proof required"}
                            </Text>
                        </HStack>
                        <Text
                            fontSize={proofSubmitted ? 13 : 14}
                            fontWeight={proofSubmitted ? "$medium" : "$semibold"}
                            color={colors.message}
                            style={{ lineHeight: proofSubmitted ? 18 : 20 }}
                        >
                            {proofSubmitted ? "Proof uploaded. You can upload again if needed." : "Please upload your sick leave proof."}
                        </Text>
                        <Text fontSize={12} color="$textLight600" numberOfLines={1} style={{ lineHeight: 18 }}>
                            PDF or image files up to 10 MB.
                        </Text>
                        {application.sickProofOriginalFilename ?
                            <Text
                                fontSize={12}
                                color="$textLight700"
                                numberOfLines={1}
                                ellipsizeMode="middle"
                                style={{ lineHeight: 18, maxWidth: "100%" }}
                            >
                                {application.sickProofOriginalFilename}
                            </Text>
                            : null}
                    </VStack>
                    <Button
                        data-testid="sick-proof-upload-button"
                        variant="outline"
                        action="secondary"
                        height={36}
                        minHeight={36}
                        paddingHorizontal={12}
                        marginTop={6}
                        onPress={openProofPicker}
                        isDisabled={isUploadingProof}
                    >
                        <ButtonText fontSize={13} fontWeight="$semibold">
                            {isUploadingProof ? "Uploading..." : proofSubmitted ? "Upload again" : "Upload proof"}
                        </ButtonText>
                    </Button>
                </HStack>
                {proofError ?
                    <Text color="#B91C1C" fontSize={12} marginTop={6} style={{ lineHeight: 18 }}>
                        {proofError}
                    </Text>
                    : null}
                {renderSickProofInput()}
            </VStack>
        );
    };

    return(
        <>
            <Card
                margin={10}
                padding={16}
                width="100%"
                maxWidth={350}
                minHeight={EMPLOYEE_CARD_MIN_HEIGHT}
                borderWidth={1}
                borderColor="$borderLight200"
                borderRadius={8}
                style={{ shadowColor: "#000000", shadowOpacity: 0.10, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}
            >
                <VStack flex={1}>
                    <HStack alignItems="flex-start" justifyContent="space-between" marginBottom={12}>
                        <HStack alignItems="center" flex={1}>
                            <BadgeIcon
                                as={CircleIcon}
                                color={(application.leaveType=="SICK")?"green":"$red500"}
                                marginRight={12}
                            />
                            <BadgeText fontSize={18} fontWeight="$semibold" color="$textLight800" numberOfLines={1}>
                                {application.leaveType}
                            </BadgeText>
                        </HStack>
                        <Tooltip
                            placement="top"
                            trigger={()=>{
                                return(
                                    <Pressable
                                        onPress={openDetails}
                                        accessibilityLabel="View application details"
                                        accessibilityRole="button"
                                        {...detailButtonWebProps}
                                        minHeight={32}
                                        minWidth={44}
                                        paddingHorizontal={8}
                                        alignItems="center"
                                        justifyContent="center"
                                        borderRadius={6}
                                        bg="transparent"
                                        $hover-bg="$secondary100"
                                        $focus-bg="$secondary100"
                                    >
                                        <HStack alignItems="center" space="xs">
                                            <Text
                                                fontSize={13}
                                                fontWeight={detailTriggerTextWeight}
                                                color={detailTriggerTextColor}
                                            >
                                                Details
                                            </Text>
                                            <BadgeIcon as={InfoIcon} color="$textLight600" />
                                        </HStack>
                                    </Pressable>
                                )
                            }}>
                            <TooltipContent>
                                <TooltipText>
                                    View details
                                </TooltipText>
                            </TooltipContent>
                        </Tooltip>
                    </HStack>

                    <VStack space="xs">
                        <Text fontSize={16} color="$textLight700" style={{ lineHeight: 24 }}>
                            {moment(application.start).format("YYYY-MM-DD HH:mm")}
                        </Text>
                        <Text fontSize={16} color="$textLight700" style={{ lineHeight: 24 }}>
                            {moment(application.end).format("YYYY-MM-DD HH:mm")}
                        </Text>
                    </VStack>

                    <HStack marginTop={14} alignItems="center">
                        <Text
                            fontSize={13}
                            fontWeight="$semibold"
                            borderRadius={999}
                            paddingHorizontal={8}
                            height={24}
                            color={statusBadgeStyle.color}
                            style={{ backgroundColor: statusBadgeStyle.backgroundColor, lineHeight: 24, textTransform: "capitalize" }}
                        >
                            {statusLabel}
                        </Text>
                    </HStack>

                    {showSickProof ? renderSickProofStrip() : null}

                    <VStack marginTop={14}>
                        <Heading size="sm" color="$textDark900">
                            Comment
                        </Heading>
                        {renderSummaryText(application.reason)}
                    </VStack>

                    {application.rejectReason?
                        <VStack marginTop={10}>
                            <Heading size="sm" color="$textDark900">
                                Reject Reason
                            </Heading>
                            {renderSummaryText(application.rejectReason)}
                        </VStack>
                        :null}

                    <HStack
                        data-testid="employee-application-card-footer"
                        marginTop="auto"
                        paddingTop={12}
                        borderTopWidth={1}
                        borderTopColor="$borderLight100"
                        minHeight={44}
                        alignItems="center"
                        justifyContent={canDelete?"flex-end":"flex-start"}
                    >
                        {canDelete?
                            <Button
                                variant="link"
                                action="negative"
                                height={32}
                                paddingHorizontal={10}
                                bg="transparent"
                                $hover-bg="$error50"
                                onPress={()=>deleteApplication(application)}
                            >
                                <ButtonText color="$error700" fontSize={13} fontWeight="$semibold">
                                    Delete
                                </ButtonText>
                            </Button>
                            :
                            <HStack alignItems="flex-start" flex={1}>
                                <BadgeIcon as={InfoIcon} color="$textLight500" marginRight={6} marginTop={2} />
                                <Text
                                    size="sm"
                                    color="$textLight500"
                                    flexWrap="wrap"
                                    flex={1}
                                    fontSize={13}
                                    style={{ lineHeight: 18 }}
                                >
                                    {getDeleteUnavailableMessage(application.status)}
                                </Text>
                            </HStack>
                        }
                    </HStack>
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
                            Application Details
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <ScrollView maxHeight={420}>
                            {renderDetailSection("Comment", application.reason)}
                            {application.rejectReason ? renderDetailSection("Reject Reason", application.rejectReason) : null}
                            {!canDelete ?
                                <Text size="sm" color="$textLight500" flexWrap="wrap">
                                    {getDeleteUnavailableMessage(application.status)}
                                </Text>
                                : null}
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
