import { Text, Input, InputField, Button, Modal, View, ModalBackdrop, ModalContent, ModalHeader, Heading, ModalCloseButton, Icon, CloseIcon, ModalBody, ModalFooter, ButtonText, AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogBody, AlertDialogFooter, ButtonGroup, HStack } from "@gluestack-ui/themed"
import moment from "moment";
import React, { useEffect } from "react";
import { Shift } from "@/model/Shift";
import { deleteCurrentShift, modifyCurrentShift} from "@/service/ShiftService";
import Moment from "moment"
interface ShiftDetailModalProps {
    currentShift: Shift;
    showModal: boolean;
    setShowModal: React.Dispatch<any>;
    onClose: Function;
}
export const ShiftDetailModal: React.FC<ShiftDetailModalProps> = ({ currentShift, showModal, setShowModal, onClose }) => {

    const [showAlertDialog, setShowAlertDialog] = React.useState(false)
    const [startHour,setStartHour] =React.useState(0)
    const [startMinute,setStartMinute]= React.useState(0)
    const [endHour,setEndHour] = React.useState(0)
    const [endMinute,setEndMinute] =React.useState(0)
    const ref = React.useRef(null)
    const deleteShift=()=>{
        setShowAlertDialog(false)
        deleteCurrentShift(currentShift)
        onClose()

    }
    const modifyShift=()=>{
        setShowModal(false)
        const start = moment(currentShift.start)
        start.hour(startHour)
        start.minute(startMinute)
        currentShift.start = start.toDate()
        const end = moment(currentShift.end)
        end.hour(endHour)
        end.minute(endMinute)
        currentShift.end = end.toDate()
        currentShift.status = "active"
        modifyCurrentShift(currentShift)
    }
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
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">{currentShift.userRealName}</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <Text margin={"$3"}>
                            {moment(currentShift.start).format("HH:mm")}-
                            {moment(currentShift.end).format("HH:mm")}
                        </Text>
                        <HStack alignItems="center" margin={"$3"}>
                            <Text >
                                Start:
                            </Text>
                            <Input
                                variant="outline"
                                size="md"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$12"}
                            >
                                <InputField placeholder="H" value={startHour} onChangeText={setStartHour}/>
                            </Input>
                            <Text size="lg"> : </Text>
                            <Input
                                variant="outline"
                                size="md"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$12"}
                            >
                                <InputField placeholder="M" value={startMinute} onChangeText={setStartMinute}/>
                            </Input>
                        </HStack>

                        <HStack alignItems="center" margin={"$3"}>
                            <Text >
                                End:
                            </Text>
                            <Input
                                variant="outline"
                                size="md"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$12"}
                            >
                                <InputField placeholder="H" value={endHour} onChangeText={setEndHour}/>
                            </Input>
                            <Text size="lg"> : </Text>
                            <Input
                                variant="outline"
                                size="md"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$12"}
                            >
                                <InputField placeholder="M" value={endMinute} onChangeText={setEndMinute}/>
                            </Input>
                        </HStack>

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
        </View>

    )
}