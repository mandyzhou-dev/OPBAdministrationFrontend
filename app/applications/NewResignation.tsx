import { newResignationApplication } from "@/service/ResignationApplicationService";
import {
    ScrollView,
    Card,
    Text,
    Input,
    InputField,
    VStack,
    Button,
    ButtonText,
    Heading,
    Alert,
    AlertIcon, AlertText, InfoIcon
} from "@gluestack-ui/themed";
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
} from "@gluestack-ui/themed"
import dayjs from "dayjs";
import { router } from "expo-router";

import React, { useEffect } from "react";
import { useState } from "react";

export default function ResignationForm() {
    const [lastDay, setLastDay] = useState("");
    const [reason, setReason] = useState("");
    const [lastDayIsRequired, setLastDayIsRequired] = React.useState(false);

    const [showSuccessAlert,setShowSuccessAlert] = React.useState(false);
    const [showErrorAlert,setShowErrorAlert] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("Failed!");
          
    const submit = () => {

        if (localStorage.getItem("user") == null) {
            setErrorMessage("Session expired. Redirecting to login page...");
            setShowErrorAlert(true);
            setTimeout(()=>{
                setShowErrorAlert(false)
                router.navigate("/my")

            },3000)
            return;
        }

        if (!lastDay) {
            setLastDayIsRequired(true);
            return;
        }

        //DONE: Check the validation of lastDay
        // === Last day validation ===
        const parsedDate = dayjs(lastDay, ["YYYYMMDD", "YYYY-MM-DD", "YYYY/MM/DD"], true);
        if (!parsedDate.isValid()) {
            //alert("Invalid last working day. Please enter a valid date.");
            setErrorMessage("Invalid last working day. Please enter a valid date.");
            setShowErrorAlert(true);
            setTimeout(()=>{setShowErrorAlert(false)},3000)
            return;
        }

        const today = dayjs().startOf("day");
        if (parsedDate.isBefore(today)) {
            setErrorMessage("Last working day cannot be in the past.");
            setShowErrorAlert(true);
            setTimeout(()=>{setShowErrorAlert(false)},3000)
            return;
        }

        const twoMonthsLater = today.add(2, "month");
        if (parsedDate.isAfter(twoMonthsLater)) {
            setErrorMessage("Last working day cannot be more than 2 months from today.");
            setShowErrorAlert(true);
            setTimeout(()=>{setShowErrorAlert(false)},3000)
            return;
        }
        // === End validation ===

        setLastDayIsRequired(false);

        let username = JSON.parse(localStorage.getItem("user") as string).username
        //Done: Post this resignation
        let result = {
            applicant: username,
            lastWorkingDate: parsedDate.format("YYYY-MM-DD"),
            reason: reason
        }
        newResignationApplication(result).then(
            (data)=>{
                console.log(data.id);
                setShowSuccessAlert(true)
            setTimeout(()=>{setShowSuccessAlert(false)},10000)}
        ).catch(
            (error)=>{
                console.log(error)
                setShowErrorAlert(true);
                setTimeout(()=>{setShowErrorAlert(false)},3000)
            }
        )
        
    };

    return (
        <ScrollView>
            {showSuccessAlert?
            (<Alert mx="$2.5" action="success" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    Your resignation request was submitted successfully. A confirmation email will be sent to you shortly.
                </AlertText>
            </Alert>):null}
            {
                showErrorAlert?
                (
                    <Alert mx="$2.5" action="error" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    {errorMessage}
                </AlertText>
            </Alert>
                ):null}
            <Card p="$4">
                <FormControl isRequired={lastDayIsRequired} isInvalid={lastDayIsRequired}>
                    <FormControlLabel>
                        <FormControlLabelText>
                            Last Working Date(Format:YYYYMMDD)
                        </FormControlLabelText>
                    </FormControlLabel>
                    <Input
                        size="md"
                    >
                        <InputField placeholder="YYYYMMDD" onChangeText={(value) => { setLastDay(value) }} />
                    </Input>
                </FormControl>

                <Text mb="$1">Reason for Leaving (Optional)</Text>
                <Input mb="$3">
                    <InputField
                        placeholder="Enter your reason"
                        value={reason}
                        onChangeText={setReason}
                    />
                </Input>

                <VStack space="sm" mb="$4">
                    {/* TODO: Refactor the editible markdown module in the future */}
                    <Heading size="md" mb="$4">Access and Systems</Heading>
                    <Text mb="$1">· Access to confidential, proprietary, or sensitive company information will be revoked upon resignation.</Text>
                    <Text mb="$1">· All company accounts and systems will be deactivated as of the employee’s last working day.</Text>

                </VStack>

            </Card>
            <Button onPress={submit} bgColor="$primary500" margin={"$3"}>
                <ButtonText>Submit Resignation</ButtonText>
            </Button>



        </ScrollView>
    );
}
