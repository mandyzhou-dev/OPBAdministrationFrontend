import {
    Text,
    Input,
    InputField,
    Button,
    Modal,
    View,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    Heading,
    ModalCloseButton,
    Icon,
    CloseIcon,
    ModalBody,
    ModalFooter,
    ButtonText,
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogCloseButton,
    AlertDialogBody,
    AlertDialogFooter,
    ButtonGroup,
    HStack,
    Card,
    Box,
    RadioGroup,
    CircleIcon,
    RadioIndicator,
    Radio,
    RadioLabel,
    RadioIcon,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    ChevronDownIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
    VStack,
    Spinner,
} from "@gluestack-ui/themed"
import moment from "moment";
import React from "react";
import { Alert } from "react-native";
import { Shift } from "@/model/Shift";
import {
    deleteCurrentShift,
    getPaidSickLeaveQuota,
    modifyCurrentShift,
    updateShiftStatus
} from "@/service/ShiftService";
import { useAuth } from "@/util/useAuth";
import { PaidSickLeaveQuota } from "@/model/PaidSickLeaveQuota";
import {
    MANUAL_SHIFT_STATUS_OPTIONS,
    ManualShiftStatus,
    normalizeShiftStatus,
    SHIFT_STATUS_LABELS,
    isPaidSickLeaveAllowed,
} from "@/constants/ShiftStatus";

interface ShiftDetailModalProps {
    currentShift: Shift;
    showModal: boolean;
    setShowModal: React.Dispatch<any>;
    onClose: Function;
}

const getErrorMessage = (error: any, fallback: string) => {
    if (typeof error === "string") {
        return error;
    }
    if (error?.message) {
        return error.message;
    }
    if (error?.error) {
        return error.error;
    }
    return fallback;
}

export const ShiftDetailModal: React.FC<ShiftDetailModalProps> = ({ currentShift, showModal, setShowModal, onClose }) => {

    const [showAlertDialog, setShowAlertDialog] = React.useState(false)
    const [showStatusConfirmDialog, setShowStatusConfirmDialog] = React.useState(false)
    const [pendingStatus, setPendingStatus] = React.useState<ManualShiftStatus | null>(null)
    const [startHour, setStartHour] = React.useState(0)
    const [startMinute, setStartMinute] = React.useState(0)
    const [endHour, setEndHour] = React.useState(0)
    const [endMinute, setEndMinute] = React.useState(0)
    const [checkedGroup,setCheckedGroup] = React.useState<string>(currentShift.groupName)
    const [quota, setQuota] = React.useState<PaidSickLeaveQuota | null>(null)
    const [quotaLoading, setQuotaLoading] = React.useState(false)
    const [quotaError, setQuotaError] = React.useState("")
    const [statusUpdating, setStatusUpdating] = React.useState(false)
    const ref = React.useRef(null)
    const { isManager, username } = useAuth();

    React.useEffect(() => {
        if (currentShift && currentShift.start && currentShift.end) {
            const initialStartHour = moment(currentShift.start).hour();
            const initialStartMinute = moment(currentShift.start).minute();
            const initialEndHour = moment(currentShift.end).hour();
            const initialEndMinute = moment(currentShift.end).minute();

            setStartHour(initialStartHour);
            setStartMinute(initialStartMinute);
            setEndHour(initialEndHour);
            setEndMinute(initialEndMinute);
            if (currentShift.groupName) {
                setCheckedGroup(currentShift.groupName);
            }
        }
    }, [currentShift]);

    React.useEffect(() => {
        if (!showModal || !isManager || currentShift.id === undefined || !username) {
            setQuota(null);
            setQuotaError("");
            return;
        }

        setQuotaLoading(true);
        setQuotaError("");
        getPaidSickLeaveQuota(currentShift.id, username).then((data) => {
            setQuota(data);
        }).catch((error) => {
            setQuotaError(getErrorMessage(error, "Failed to load paid sick leave quota."));
        }).finally(() => {
            setQuotaLoading(false);
        });
    }, [showModal, isManager, currentShift.id, username]);

    const deleteShift = async () => {
        setShowAlertDialog(false)
        try {
            await deleteCurrentShift(currentShift)
            onClose()
        } catch (error) {
            Alert.alert("Delete failed", getErrorMessage(error, "Failed to delete shift. Please try again."))
        }
    }

    const modifyShift = async () => {
        setShowModal(false)
        const start = moment(currentShift.start)
        start.hour(startHour)
        start.minute(startMinute)
        const end = moment(currentShift.end)
        end.hour(endHour)
        end.minute(endMinute)
        const updatedShift = {
            ...currentShift,
            start: start.toDate(),
            end: end.toDate(),
            status: currentShift.status,
            groupName: checkedGroup,
        } as Shift;
        try {
            await modifyCurrentShift(updatedShift)
            onClose()
        } catch (error) {
            Alert.alert("Modify failed", getErrorMessage(error, "Failed to modify shift. Please try again."))
        }
    }

    const getQuotaHelperText = () => {
        if (!isManager) {
            return "";
        }
        if (quotaLoading) {
            return "Loading paid sick leave quota...";
        }
        if (quotaError) {
            return quotaError;
        }
        if (!quota) {
            return "Paid sick leave quota unavailable.";
        }
        if (quota.probation || !quota.eligible) {
            return "Not eligible: employee is still in probation.";
        }
        if (quota.targetDateAlreadyCounted) {
            return `Paid sick leave used: ${quota.usedDays}/${quota.quotaDays}. This calendar day is already counted.`;
        }
        if (!quota.canMarkPaidSickLeave) {
            return "Paid sick leave quota used up.";
        }
        return `Paid sick leave used: ${quota.usedDays}/${quota.quotaDays}`;
    }

    const onStatusSelected = (value: string) => {
        const selectedStatus = value as ManualShiftStatus;
        if (selectedStatus === "paid_sick_leave" && !isPaidSickLeaveAllowed(quota)) {
            Alert.alert("Paid sick leave unavailable", getQuotaHelperText());
            return;
        }
        setPendingStatus(selectedStatus);
        setShowStatusConfirmDialog(true);
    }

    const confirmStatusUpdate = async () => {
        if (!pendingStatus || currentShift.id === undefined) {
            return;
        }
        setStatusUpdating(true);
        try {
            await updateShiftStatus(currentShift.id, pendingStatus, username)
            setShowStatusConfirmDialog(false)
            setPendingStatus(null)
            setShowModal(false)
            onClose()
        } catch (error) {
            Alert.alert("Status update failed", getErrorMessage(error, "Failed to update shift status. Please try again."))
        } finally {
            setStatusUpdating(false);
        }
    }

    const currentStatus = normalizeShiftStatus(currentShift.status);
    const pendingStatusLabel = pendingStatus ? SHIFT_STATUS_LABELS[pendingStatus] : "";
    const quotaHelperText = getQuotaHelperText();
    const paidSickLeaveDisabled = quotaLoading || quotaError !== "" || !isPaidSickLeaveAllowed(quota);

    return (
        <View>
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false)
                }}
                finalFocusRef={ref}
            >
                <ModalBackdrop />
                <ModalContent w="$full">
                    <ModalHeader>
                        <Heading size="lg">{currentShift.userRealName}</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <Box
                            bg="$backgroundLight100"
                            py="$1"
                            px="$4"
                            rounded="$lg"
                            borderWidth="$1"
                            borderColor="$borderLight200"
                            mb="$1"
                        >

                            <Text margin={"$3"} color="$textLight800">
                                {moment(currentShift.start).format("HH:mm")}-
                                {moment(currentShift.end).format("HH:mm")}
                            </Text>

                        </Box>


                        <HStack margin={"$3"}>
                            <Text margin={"$3"}>
                                Start:
                            </Text>
                            <Input
                                variant="outline"
                                size="sm"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$10"}
                            >
                                <InputField placeholder="H" value={startHour.toString()} onChangeText={(text) => setStartHour(Number(text))} />
                            </Input>
                            <Text size="sm"> : </Text>
                            <Input
                                variant="outline"
                                size="sm"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$10"}
                            >
                                <InputField placeholder="M" value={startMinute.toString()} onChangeText={(text) => setStartMinute(Number(text))} />
                            </Input>
                            <Text margin={"$3"}>
                                -
                            </Text>
                            <Text margin={"$3"}>
                                End:
                            </Text>
                            <Input
                                variant="outline"
                                size="sm"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$10"}
                            >
                                <InputField placeholder="H" value={endHour.toString()} onChangeText={(a)=>setEndHour(Number(a))} />
                            </Input>
                            <Text size="sm"> : </Text>
                            <Input
                                variant="outline"
                                size="sm"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$10"}
                            >
                                <InputField placeholder="M" value={endMinute.toString()} onChangeText={(a)=>setEndMinute(Number(a))} />
                            </Input>
                        </HStack>

                        <Card margin={3}>
                            <HStack>
                                <Text color="$text500" lineHeight="$xs" mr={10}>
                                    Group:
                                </Text>
                                <RadioGroup value={checkedGroup} onChange={(d)=>setCheckedGroup(d)} >
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

                        {isManager ? (
                            <Card margin={3}>
                                <VStack space="sm">
                                    <HStack alignItems="center">
                                        <Text color="$text500" mr={10}>Current status:</Text>
                                        <Text>{SHIFT_STATUS_LABELS[currentStatus]}</Text>
                                    </HStack>
                                    <HStack alignItems="center">
                                        <Text color="$text500" mr={10}>Paid sick leave:</Text>
                                        {quotaLoading ? <Spinner size="small" /> : null}
                                        <Text>{quotaHelperText}</Text>
                                    </HStack>
                                    <Select onValueChange={onStatusSelected}>
                                        <SelectTrigger>
                                            <SelectInput placeholder="Select status action" />
                                            <SelectIcon mr="$3" as={ChevronDownIcon} />
                                        </SelectTrigger>
                                        <SelectPortal>
                                            <SelectBackdrop />
                                            <SelectContent>
                                                <SelectDragIndicatorWrapper>
                                                    <SelectDragIndicator />
                                                </SelectDragIndicatorWrapper>
                                                {MANUAL_SHIFT_STATUS_OPTIONS.map((item) => {
                                                    const isLocked = item.value === "paid_sick_leave" && paidSickLeaveDisabled;
                                                    return (
                                                        <SelectItem
                                                            key={item.value}
                                                            label={isLocked ? `${item.label} (locked)` : item.label}
                                                            value={item.value}
                                                            isDisabled={isLocked}
                                                        />
                                                    )
                                                })}
                                            </SelectContent>
                                        </SelectPortal>
                                    </Select>
                                </VStack>
                            </Card>
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
                        <Button
                            size="sm"
                            action="positive"
                            mr="$3"

                            onPress={modifyShift}
                        >
                            <ButtonText>Modify</ButtonText>
                        </Button>
                        <Button
                            size="sm"
                            action="negative"
                            borderWidth="$0"
                            onPress={() => {
                                setShowModal(false)
                                setShowAlertDialog(true)
                            }}
                        >
                            <ButtonText>Delete</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AlertDialog
                isOpen={showAlertDialog}
                onClose={() => {
                    setShowAlertDialog(false)
                }}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading size="lg">Delete this shift</Heading>
                        <AlertDialogCloseButton>
                            <Icon as={CloseIcon} />
                        </AlertDialogCloseButton>
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <Text size="sm">
                            Are you sure you want to delete this shift? This shift will
                            be permanently removed and cannot be undone.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <ButtonGroup space="lg">
                            <Button
                                variant="outline"
                                action="secondary"
                                onPress={() => {
                                    setShowAlertDialog(false)
                                }}
                            >
                                <ButtonText>Cancel</ButtonText>
                            </Button>
                            <Button
                                bg="$error600"
                                action="negative"
                                onPress={deleteShift}
                            >
                                <ButtonText>Delete</ButtonText>
                            </Button>
                        </ButtonGroup>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
                isOpen={showStatusConfirmDialog}
                onClose={() => {
                    setShowStatusConfirmDialog(false)
                    setPendingStatus(null)
                }}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading size="lg">Confirm status change</Heading>
                        <AlertDialogCloseButton>
                            <Icon as={CloseIcon} />
                        </AlertDialogCloseButton>
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <Text size="sm">
                            Mark {currentShift.userRealName} shift on {moment(currentShift.start).format("YYYY-MM-DD")} as {pendingStatusLabel}?
                        </Text>
                        {pendingStatus === "paid_sick_leave" ? (
                            <Text size="sm" mt="$2">{quotaHelperText}</Text>
                        ) : null}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <ButtonGroup space="lg">
                            <Button
                                variant="outline"
                                action="secondary"
                                isDisabled={statusUpdating}
                                onPress={() => {
                                    setShowStatusConfirmDialog(false)
                                    setPendingStatus(null)
                                }}
                            >
                                <ButtonText>Cancel</ButtonText>
                            </Button>
                            <Button
                                bg="$primary600"
                                action="primary"
                                isDisabled={statusUpdating}
                                onPress={confirmStatusUpdate}
                            >
                                <ButtonText>{statusUpdating ? "Saving..." : "Yes"}</ButtonText>
                            </Button>
                        </ButtonGroup>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </View>

    )
}
