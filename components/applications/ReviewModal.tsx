import { LeaveApplication } from "@/model/LeaveApplication";
import { Textarea,Button, ButtonText, CloseIcon, FormControl, FormControlLabel, FormControlLabelText, Heading, Icon, Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, TextareaInput, View } from "@gluestack-ui/themed";
import {permitReview,rejectReview} from "@/service/ApplicationService";
import React from "react";
interface ReviewModalProps{
    currentApplication:LeaveApplication;
    showModal:boolean;
    setShowModal:React.Dispatch<any>;
    onClose:Function;
}
export const ReviewModal:React.FC<ReviewModalProps>=({currentApplication,showModal,setShowModal,onClose})=>{
    const [rejectReason,setRejectReason] = React.useState("");
    const [commentIsRequired,setCommentIsRequired] = React.useState(false);
    const permit=()=>{
        permitReview(currentApplication.id);
        onClose();
    }
    const reject=()=>{
        if(rejectReason==''){
            setCommentIsRequired(true);
            return;
        }
        setCommentIsRequired(false);
        rejectReview(currentApplication.id,rejectReason);
        onClose();
    }
    return(
        <View>
            <Modal
                isOpen={showModal}
                onClose={()=>{setShowModal(false)}}
            >
                <ModalBackdrop/>
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">{currentApplication.applicant}</Heading>
                        <ModalCloseButton>
                            <Icon as = {CloseIcon}/>
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <FormControl isRequired={commentIsRequired} isInvalid={commentIsRequired}>
                            <FormControlLabel>
                                <FormControlLabelText>Comment</FormControlLabelText>
                            </FormControlLabel>
                            <Textarea>
                                <TextareaInput placeholder="Describe the reason for rejecting..." onChangeText={(value)=>{setRejectReason(value)}} />
                            </Textarea>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>

                        <Button
                        margin={3}
                        onPress={()=>{permit()}}>
                            <ButtonText>Approve</ButtonText>
                        </Button>
                        <Button
                        margin={3}
                        action="negative"
                        onPress={()=>{reject()}}>
                            <ButtonText>Decline</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </View>
    )
}