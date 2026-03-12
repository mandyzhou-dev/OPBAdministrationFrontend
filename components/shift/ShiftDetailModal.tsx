import { Text, Input, InputField, Button, Modal, View, ModalBackdrop, ModalContent, ModalHeader, Heading, ModalCloseButton, Icon, CloseIcon, ModalBody, ModalFooter, ButtonText, AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogBody, AlertDialogFooter, ButtonGroup, HStack, Card, Box, Center, RadioGroup, CircleIcon, RadioIndicator, Radio, RadioLabel, RadioIcon } from "@gluestack-ui/themed"
import moment from "moment";
import React, { useEffect } from "react";
import { Shift } from "@/model/Shift";
import { deleteCurrentShift, modifyCurrentShift } from "@/service/ShiftService";
interface ShiftDetailModalProps {
    currentShift: Shift;
    showModal: boolean;
    setShowModal: React.Dispatch<any>;
    onClose: Function;
}
export const ShiftDetailModal: React.FC<ShiftDetailModalProps> = ({ currentShift, showModal, setShowModal, onClose }) => {

    const [showAlertDialog, setShowAlertDialog] = React.useState(false)
    const [startHour, setStartHour] = React.useState(0)
    const [startMinute, setStartMinute] = React.useState(0)
    const [endHour, setEndHour] = React.useState(0)
    const [endMinute, setEndMinute] = React.useState(0)
    const ref = React.useRef(null)
    const [checkedGroup,setCheckedGroup] = React.useState<string>(currentShift.groupName)

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
    const deleteShift = () => {
        setShowAlertDialog(false)
        deleteCurrentShift(currentShift)
        onClose()

    }
    const modifyShift = () => {
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
        //TODO: currentShift.groupName = groupName;
        currentShift.groupName = checkedGroup;
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


                        <HStack alignItems="center" margin={"$3"}>
                            <Text margin={"$3"}>
                                Start:
                            </Text>
                            <Input
                                variant="outline"
                                size="sm"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$12"}
                            >
                                <InputField placeholder="H" value={startHour.toString()} onChangeText={(text) => setStartHour(Number(text))} />
                            </Input>
                            <Text size="lg"> : </Text>
                            <Input
                                variant="outline"
                                size="sm"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$12"}
                            >
                                <InputField placeholder="M" value={startMinute.toString()} onChangeText={(text) => setStartMinute(Number(text))} />
                            </Input>
                            <Text margin={"$3"}>
                                ----
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
                                width={"$12"}
                            >
                                <InputField placeholder="H" value={endHour.toString()} onChangeText={(a)=>setEndHour(Number(a))} />
                            </Input>
                            <Text size="lg"> : </Text>
                            <Input
                                variant="outline"
                                size="sm"
                                isDisabled={false}
                                isInvalid={false}
                                isReadOnly={false}
                                width={"$12"}
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