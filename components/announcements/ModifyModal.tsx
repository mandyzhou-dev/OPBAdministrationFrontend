import { Announcement } from "@/model/Announcement"
import { putAnnouncement } from "@/service/AnnouncementService";
import { ModalFooter,Button,ButtonText,Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, Heading, ModalCloseButton, Icon, CloseIcon, Card, Text, Input, InputField,Textarea,TextareaInput, Switch, HStack } from "@gluestack-ui/themed"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import  dayjs  from "dayjs";
import React, { useEffect } from "react";
interface ModifyModalProps {
    announcement: Announcement
    showModal: boolean
    setShowModal: React.Dispatch<any>;
}

export const ModifyModal: React.FC<ModifyModalProps> = ({ announcement, showModal, setShowModal }) => {
    const [title, setTitle] = React.useState("");
    const [date, setDate] = React.useState(dayjs())
    const [content,setContent] = React.useState("")
    const [isPermanent, setIsPermanent] = React.useState(true);
    const modifyCurrentAnnouncement=()=>{
        let modifiedAnnouncement = {
            ...announcement,
            title:title,
            content:content,
            expiryDate: isPermanent ? null : date.toDate()
        }
        putAnnouncement(announcement.id??0,modifiedAnnouncement).then(
            ()=>{
                setShowModal(false);
            }
                
        ).catch(
            (error)=>{
                console.log(error)           
            }
        );

    }

    useEffect(() => {
        setTitle(announcement.title??"")
        setContent(announcement.content??"")
        if (announcement.expiryDate == null) {
            setIsPermanent(true);
            setDate(dayjs()); 
        } else {
            setIsPermanent(false);
            setDate(dayjs(announcement.expiryDate));
        }
    },[announcement,showModal])

    return (
        <Modal
            isOpen={showModal}
            onClose={() => {
                setShowModal(false)
            }}
        >
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Heading size="lg">{announcement.publisher}</Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <Card margin={3}>
                        <Text >
                            Title:
                        </Text>
                        <Input
                            variant="outline"
                            size="md"
                            width={"80%"}
                        >
                            <InputField value={title} onChangeText={setTitle} />
                        </Input>
                    </Card>
                    <Card margin={3}>
                        <HStack justifyContent="space-between" alignItems="center" mb="$2">
                            <HStack alignItems="center" space="xs">
                                <Text size="sm">Permanent</Text>
                                <Switch value={isPermanent} onValueChange={setIsPermanent} />
                            </HStack>
                        </HStack>


                        <Text >
                            ExpiredDate:
                        </Text>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={date}
                                onChange={(newValue) => newValue != undefined ? setDate(newValue) : ""}
                                disabled={isPermanent}
                            />
                        </LocalizationProvider>
                    </Card>
                    <Card margin={3} height="100%">
                        <Heading>Content:</Heading>
                        <Textarea
                            size="md"
                            w="80%"
                            height="80%"
                        >
                            <TextareaInput value={content} placeholder="The content of announcement..." onChangeText={(value) => setContent(value)} />
                        </Textarea>
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

                        onPress={modifyCurrentAnnouncement}
                    >
                        <ButtonText>Modify</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}