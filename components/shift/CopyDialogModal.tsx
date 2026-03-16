
import { CopyStatus } from "@/model/CopyStatus";
import { copyWeekScheduleTo } from "@/service/ShiftService";
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
        try {
            //TODO: spin
            const data = await copyWeekScheduleTo(groupName, srcWeekStart, dstWeekStart);
            setShowModal(false)
            if (!toast.isActive(toastId)) {
                showNewToast(data);
            }
        } catch (err: any) {
            console.log(err.error)
            if (err.error == "INVALID_SCHEDULE_RANGE") {
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
                                    }
                                }
                                }
                                disabledDate={disabledDate}
                            />
                        </Flex>

                        <Text color="$text500" lineHeight="$xs">
                            To: {dstWeekStart.add(6, 'day').format('YYYY-MM-DD')}
                        </Text>
                    </Card>
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
                    <Button onPress={copySchedule} isDisabled={isCopying}>
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