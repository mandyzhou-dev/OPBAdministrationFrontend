import { ButtonText,ModalCloseButton,Icon,ModalBody,ModalFooter,Text, Button, ModalBackdrop, Center, Modal, ModalContent ,ModalHeader,Heading, CloseIcon} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import React from 'react';
interface UnreadModal{
    count:number;
}
export const UnreadModal: React.FC<UnreadModal> = ({ count }) => {
    const ref = React.useRef(null)
    const [showModal,setShowModal] = React.useState(true);
    return (
      <Center h={300}>
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
              <Heading size="lg">Unread Notifications</Heading>
              <ModalCloseButton>
                <Icon as={CloseIcon} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <Text>
                You have {count} unread messages.
                Click the button to read.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                size="sm"
                action="secondary"
                mr="$3"
                onPress={() => {
                  setShowModal(false);
                  router.navigate("/announcement")
                }}
              >
                <ButtonText>Go to notifications</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Center>
    )
}