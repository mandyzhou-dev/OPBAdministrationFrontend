import { LeaveApplication } from "@/model/LeaveApplication";
import { Textarea,Button, ButtonText, CloseIcon, FormControl, FormControlLabel, FormControlLabelText, Heading, Icon, Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, Text, TextareaInput, View } from "@gluestack-ui/themed";
import {permitReview,rejectReview} from "@/service/ApplicationService";
import React from "react";
import { ProofStatusSummary } from "@/components/applications/ProofStatus";
interface ReviewModalProps{
    currentApplication:LeaveApplication;
    showModal:boolean;
    setShowModal:React.Dispatch<any>;
    onClose:Function;
}
export const ReviewModal:React.FC<ReviewModalProps>=({currentApplication,showModal,setShowModal,onClose})=>{
    const [reviewComment,setReviewComment] = React.useState("");
    const [commentIsRequired,setCommentIsRequired] = React.useState(false);
    const [isSubmitting,setIsSubmitting] = React.useState(false);
    const [submitError,setSubmitError] = React.useState<string | null>(null);

    React.useEffect(()=>{
        setReviewComment("");
        setCommentIsRequired(false);
        setSubmitError(null);
        setIsSubmitting(false);
    },[currentApplication.id,showModal]);

    const closeModal=()=>{
        setReviewComment("");
        setCommentIsRequired(false);
        setSubmitError(null);
        setShowModal(false);
    }

    const permit=async()=>{
        if(currentApplication.id === undefined){
            return;
        }
        const trimmedComment = reviewComment.trim();
        setCommentIsRequired(false);
        setSubmitError(null);
        setIsSubmitting(true);
        try{
            await permitReview(currentApplication.id,trimmedComment || undefined);
            onClose();
        }catch(e){
            setSubmitError("Review failed. Please try again.");
        }finally{
            setIsSubmitting(false);
        }
    }
    const reject=async()=>{
        if(currentApplication.id === undefined){
            return;
        }
        const trimmedComment = reviewComment.trim();
        if(trimmedComment==''){
            setCommentIsRequired(true);
            setSubmitError(null);
            return;
        }
        setCommentIsRequired(false);
        setSubmitError(null);
        setIsSubmitting(true);
        try{
            await rejectReview(currentApplication.id,trimmedComment);
            onClose();
        }catch(e){
            setSubmitError("Review failed. Please try again.");
        }finally{
            setIsSubmitting(false);
        }
    }
    return(
        <View>
            <Modal
                isOpen={showModal}
                onClose={closeModal}
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
                        <ProofStatusSummary application={currentApplication} />
                        <FormControl isRequired={commentIsRequired} isInvalid={commentIsRequired}>
                            <FormControlLabel>
                                <FormControlLabelText>Comment</FormControlLabelText>
                            </FormControlLabel>
                            <Textarea>
                                <TextareaInput value={reviewComment} placeholder="Add a review comment..." onChangeText={(value)=>{setReviewComment(value)}} />
                            </Textarea>
                            {commentIsRequired ? <Text color="$error700" fontSize={13} marginTop={6}>Review comment is required for declined applications.</Text> : null}
                            {submitError ? <Text color="$error700" fontSize={13} marginTop={6}>{submitError}</Text> : null}
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>

                        <Button
                        margin={3}
                        isDisabled={isSubmitting}
                        onPress={()=>permit()}>
                            <ButtonText>{isSubmitting ? "Submitting..." : "Approve"}</ButtonText>
                        </Button>
                        <Button
                        margin={3}
                        action="negative"
                        isDisabled={isSubmitting}
                        onPress={()=>reject()}>
                            <ButtonText>{isSubmitting ? "Submitting..." : "Decline"}</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </View>
    )
}
