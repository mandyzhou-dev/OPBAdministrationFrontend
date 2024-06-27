import announcement from "@/app/announcement";
import { Announcement } from "@/model/Announcement";
import { readAnnouncement } from "@/service/AnnouncementService";
import { Modal ,ModalBackdrop,ModalContent,ModalHeader,Heading,ModalCloseButton,Icon,Card,Text,VStack,ModalFooter,ModalBody,Button, CloseIcon, ButtonText} from "@gluestack-ui/themed";
import moment from "moment";

interface MoreModalProps {
    announcement: Announcement;
    showModal: boolean
    setShowModal: React.Dispatch<any>;
}
export const MoreModal: React.FC<MoreModalProps> = ({ announcement, showModal, setShowModal }) => {
    const readCurrentAnnouncement=()=>{
        let user = JSON.parse(localStorage.getItem('user') as string);

        let announcementReadLog = {
            reader:user.username
        }
        readAnnouncement(announcement.id??0,announcementReadLog).then(
            ()=>{
                console.log("reading")
                setShowModal(false);
                console.log("read")
            }
                
        ).catch(
            (error)=>{
                console.log(error)           
            }
        );

    }


    return (
        <Modal
            isOpen={showModal}
            onClose={() => {
                setShowModal(false)
            }}
        >
            <ModalBackdrop />
            <ModalContent >
                <ModalHeader>
                    <Heading size="lg">{announcement.publisher}</Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <Card margin={3}>
                        <Text >
                            Title:{announcement.title}
                        </Text>
                    </Card>
                    <Card margin={3}>
                        <Text>
                            ExpiredDate:{moment(announcement.expiryDate?.toString()).format("YYYY-MM-DD")}
                        </Text>
                    </Card>
                    <Card margin={3} height="100%">
                        <Heading>Content:</Heading>
                        <VStack maxHeight={300} overflow="scroll">
                            <Text margin={3} bold>
                                {announcement.content}
                            </Text>
                        </VStack>
                    </Card>

                </ModalBody>
                <ModalFooter>
                    <Button
                        size="sm"
                        action="positive"
                        mr="$3"

                        onPress={readCurrentAnnouncement}
                    >
                        <ButtonText>OK</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}