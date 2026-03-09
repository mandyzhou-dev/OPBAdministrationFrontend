
import { CopyStatus } from "@/model/CopyStatus";
import { copyWeekScheduleTo } from "@/service/ShiftService";
import { Button, Text, ButtonText, Modal, ModalBackdrop, ModalContent, Card, HStack, RadioGroup, RadioIndicator, RadioIcon, CircleIcon, RadioLabel, Radio, Heading, ModalHeader, ModalCloseButton, Icon, CloseIcon, ModalFooter, ModalBody } from "@gluestack-ui/themed";
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
    const [status, setStatus] = React.useState<CopyStatus>()
    const disabledDate = (dst: Dayjs) => {
        // 1. Disable if it's NOT Sunday
        const isNotSunday = dst.day() !== 0;

        // 2. Disable if it's BEFORE or SAME AS the source week
        // .isBefore() or .isSame() are perfect here
        const isTooEarly = dst.isBefore(srcWeekStart, 'day') || dst.isSame(srcWeekStart, 'day');

        return isNotSunday || isTooEarly;
    };

    const copySchedule = async() => {
        try {
            
            const data = await copyWeekScheduleTo(groupName, srcWeekStart, dstWeekStart);
            setStatus(data);
            console.log("ok");
            setShowModal(false)
        } catch (err: any) {
            console.log(err.message);
        }
    }

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

                        <Card>
                            <Text>Source Week: {srcWeekStart.format('YYYY-MM-DD')} - {srcWeekStart.add(6, 'day').format('YYYY-MM-DD')}</Text>

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
                        <Button onPress={copySchedule}>
                            <ButtonText>Copy</ButtonText>
                        </Button>
                    </ModalFooter>

                </ModalContent>
            </Modal>
        );
    }