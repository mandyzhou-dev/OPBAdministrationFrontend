
import { CopyStatus } from "@/model/CopyStatus";
import { copyWeekScheduleTo } from "@/service/ShiftService";
import { getStatutoryHoliday } from "@/service/StatutoryHolidayService";
import { StatutoryHoliday } from "@/model/StatutoryHoliday";
import { buildHolidayWarningText, getStatutoryHolidaySkippedDetails, getTargetWeekHolidays, groupSkippedDetailsByTargetDate } from "./CopyDialogModalState";
import { Button, Text, ButtonText, Modal, ModalBackdrop, ModalContent, Card, HStack, RadioGroup, RadioIndicator, RadioIcon, CircleIcon, RadioLabel, Radio, Heading, ModalHeader, ModalCloseButton, Icon, CloseIcon, ModalFooter, ModalBody, Toast, ToastTitle, ToastDescription, useToast, VStack, Alert, AlertIcon, InfoIcon, AlertText, Spinner } from "@gluestack-ui/themed";
import { DatePicker, Flex } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React from "react";

interface ShiftCopyDialogModalProps {
    srcWeekStart: Dayjs;
    showModal: boolean;
    setShowModal: React.Dispatch<any>;
    onClose: Function;
}
export const CopyDialogModal: React.FC<ShiftCopyDialogModalProps> = ({ srcWeekStart, showModal, setShowModal, onClose }) => {
    const [groupName, setGroupName] = React.useState("surrey")
    const [dstWeekStart, setDstWeekStart] = React.useState(dayjs().add(1, 'week').startOf('week'))
    const toast = useToast();
    const [toastId, setToastId] = React.useState(0);
    const [showErrorAlert, setShowErrorAlert] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("Failed!");
    const [isCopying, setIsCopying] = React.useState(false);
    const [statutoryHolidays, setStatutoryHolidays] = React.useState<StatutoryHoliday[]>([]);
    const [copyResult, setCopyResult] = React.useState<CopyStatus | null>(null);

    React.useEffect(() => {
        if (!showModal) return;

        setCopyResult(null);
        getStatutoryHoliday()
            .then(setStatutoryHolidays)
            .catch((err) => console.log(err));
    }, [showModal]);

    const targetWeekHolidays = React.useMemo(
        () => getTargetWeekHolidays(statutoryHolidays, dstWeekStart),
        [statutoryHolidays, dstWeekStart]
    );
    const holidaySkippedDetails = React.useMemo(
        () => getStatutoryHolidaySkippedDetails(copyResult),
        [copyResult]
    );
    const holidaySkippedGroups = React.useMemo(
        () => groupSkippedDetailsByTargetDate(holidaySkippedDetails),
        [holidaySkippedDetails]
    );
    const hasHolidaySkippedDetails = holidaySkippedDetails.length > 0;

    const disabledDate = (dst: Dayjs) => {
        // 1. Disable if it's NOT Sunday
        const isNotSunday = dst.day() !== 0;

        // 2. Disable if it's BEFORE or SAME AS the source week
        // .isBefore() or .isSame() are perfect here
        const isTooEarly = dst.isBefore(srcWeekStart, 'day') || dst.isSame(srcWeekStart, 'day');

        return isNotSunday || isTooEarly;
    };

    const copySchedule = async () => {
        if (isCopying) return;
        setIsCopying(true);//start spining
        setCopyResult(null);
        setShowErrorAlert(false);
        try {
            //TODO: spin
            const data = await copyWeekScheduleTo(groupName, srcWeekStart, dstWeekStart);
            if (getStatutoryHolidaySkippedDetails(data).length > 0) {
                setCopyResult(data);
            } else {
                setShowModal(false)
                if (!toast.isActive(toastId)) {
                    showNewToast(data);
                }
            }
        } catch (err: any) {
            console.log(err.error)
            if (err.error == "INVALID_SCHEDULE_RANGE") {
                setErrorMessage(err.message);
                setShowErrorAlert(true);
                setTimeout(() => { setShowErrorAlert(false) }, 15000)
                return;
            }
            if(err.error=="SHIFT_ALREADY_EXISTS"){
                setErrorMessage(err.message);
                setShowErrorAlert(true);
                setTimeout(() => { setShowErrorAlert(false) }, 15000)
                return;
            }
        } finally {
            setIsCopying(false);
        }
    }
    const showNewToast = (data: CopyStatus) => {
        const newId = Math.random();
        setToastId(newId);
        toast.show({
            id: newId,
            placement: 'top',
            duration: 3000,
            render: ({ id }) => {
                const uniqueToastId = 'toast-' + id;
                return (
                    <Toast nativeID={uniqueToastId} action="success" variant="solid" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <ToastTitle>Success!</ToastTitle>
                        <ToastDescription>
                            Created: {data?.created} {" "}
                            Skipped: {data?.skipped}
                        </ToastDescription>

                    </Toast>
                );
            },
        });
    };

    return (
        <Modal isOpen={showModal} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Heading size="lg">Copying This Week To...</Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody>
                    <Card margin={3}>
                        <HStack>
                            <Text color="$text500" lineHeight="$xs" mr={10}>
                                Source Group:
                            </Text>
                            <RadioGroup value={groupName} onChange={(d) => setGroupName(d)} aria-label="Select Group Name">
                                <HStack space="2xl">
                                    <Radio value="surrey" size="md">
                                        <RadioIndicator>
                                            <RadioIcon as={CircleIcon} />
                                        </RadioIndicator>
                                        <RadioLabel>SRY</RadioLabel>
                                    </Radio>
                                    <Radio value="coquitlam" size="md">
                                        <RadioIndicator>
                                            <RadioIcon as={CircleIcon} />
                                        </RadioIndicator>
                                        <RadioLabel>COQ</RadioLabel>
                                    </Radio>
                                </HStack>
                            </RadioGroup>
                        </HStack>
                    </Card>

                    <Card margin={3}>
                        <Text>Source Week: {srcWeekStart.format('YYYY-MM-DD')} - {srcWeekStart.add(6, 'day').format('YYYY-MM-DD')}</Text>

                    </Card>

                    <Card margin={3}>
                        <Text bold>Target Week:</Text>
                        <Text color="$text500" lineHeight="$xs">
                            From
                        </Text>
                        <Flex vertical gap="small">
                            <DatePicker
                                value={dstWeekStart}
                                onChange={(d: dayjs.Dayjs | null): void => {
                                    if (d) {
                                        setDstWeekStart(d)
                                        setCopyResult(null)
                                    }
                                }
                                }
                                disabledDate={disabledDate}
                            />
                        </Flex>
                        {targetWeekHolidays.length > 0 ? (
                            <Alert
                                action="warning"
                                variant="outline"
                                style={{
                                    backgroundColor: "#FFFBEB",
                                    borderColor: "#F59E0B",
                                    borderRadius: 6,
                                    marginTop: 8,
                                    padding: 12,
                                }}
                            >
                                <AlertIcon as={InfoIcon} mr="$3" color="#92400E" />
                                <AlertText style={{ color: "#92400E" }}>
                                    {buildHolidayWarningText(targetWeekHolidays)}
                                </AlertText>
                            </Alert>
                        ) : null}

                        <Text color="$text500" lineHeight="$xs">
                            To: {dstWeekStart.add(6, 'day').format('YYYY-MM-DD')}
                        </Text>
                    </Card>
                    {hasHolidaySkippedDetails ? (
                        <Alert
                            mx="$2.5"
                            action="warning"
                            variant="outline"
                            style={{
                                backgroundColor: "#FFFBEB",
                                borderColor: "#F59E0B",
                                borderRadius: 6,
                            }}
                        >
                            <AlertIcon as={InfoIcon} mr="$3" color="#92400E" />
                            <VStack space="xs">
                                <AlertText style={{ color: "#92400E" }}>
                                    {(copyResult?.created || 0) > 0
                                        ? `Created ${copyResult?.created || 0} shifts. Skipped ${holidaySkippedDetails.length} on statutory holiday(s).`
                                        : `No shifts were created. Skipped ${holidaySkippedDetails.length} on statutory holiday(s).`}
                                </AlertText>
                                {holidaySkippedGroups.map((group) => (
                                    <AlertText key={group.targetDate} style={{ color: "#92400E" }}>
                                        {group.targetDate} - {group.count} shifts skipped
                                    </AlertText>
                                ))}
                            </VStack>
                        </Alert>
                    ) : null}
                    {
                        showErrorAlert ?
                            (
                                <Alert mx="$2.5" action="error" variant="outline" >
                                    <AlertIcon as={InfoIcon} mr="$3" />
                                    <AlertText>
                                        {errorMessage}
                                    </AlertText>
                                </Alert>
                            ) : null}


                </ModalBody>

                <ModalFooter>
                    <Button
                        variant="outline"
                        size="sm"
                        action="secondary"
                        mr="$3"
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button onPress={copySchedule} isDisabled={isCopying} style={{ minWidth: 72 }}>
                        {isCopying ? (
                            <Spinner size="small" color="white" />
                        ) : (
                            <ButtonText>Copy</ButtonText>
                        )}
                    </Button>
                </ModalFooter>

            </ModalContent>
        </Modal>
    );
}
