import { verifyPassword } from "@/service/UserService";
import {
    ScrollView,
    Card,
    Text,
    Input,
    InputField,
    Checkbox,
    CheckboxGroup,
    CheckboxIcon,
    CheckboxIndicator,
    CheckboxLabel,
    VStack,
    HStack,
    Button,
    ButtonText,
    Heading,
    Alert,
    AlertCircleIcon,
    InputIcon, EyeIcon, EyeOffIcon, InputSlot
} from "@gluestack-ui/themed";
import {
    FormControl,
    FormControlError,
    FormControlErrorText,
    FormControlErrorIcon,
    FormControlLabel,
    FormControlLabelText,
    FormControlHelper,
    FormControlHelperText,
} from "@gluestack-ui/themed"
import Password from "antd/es/input/Password";

import React from "react";
import { useState } from "react";

export default function ResignationForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [lastDay, setLastDay] = useState("");
    const [reason, setReason] = useState("");
    const [password, setPassword] = useState("");
    const [lastDayIsRequired, setLastDayIsRequired] = React.useState(false);
    const [passwordIsRequired, setPasswordIsRequired] = React.useState(false);

    const handleState = () => {
        setShowPassword((showState) => {
            return !showState
        })
    }
    const submit = () => {
        if (!lastDay) {
            setLastDayIsRequired(true);
            return;
        }
        if (!password) {
            setPasswordIsRequired(true);
            return;
        }
        //TODO: Check the validation of lastDay

        if(localStorage.getItem("user") === null){
            alert("Login again!")
            return;
        }   
        
        setLastDayIsRequired(false);
        setPasswordIsRequired(false);

        let username = JSON.parse(localStorage.getItem("user") as string).username
        verifyPassword(username, password).then(
            (data)=>{
                if(data==false){
                    alert("Wrong password!");
                    return;
                }
            }
        )
        //TODO: Post this resignation
        console.log("pass")
    };

    return (
        <ScrollView>
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

                <FormControl isRequired={passwordIsRequired} isInvalid={passwordIsRequired}>
                    <FormControlLabel>
                        <FormControlLabelText>
                            Verify your identity by entering your password
                        </FormControlLabelText>
                    </FormControlLabel>
                    <Input
                        size="md"
                    >
                        <InputField placeholder="Enter your current password"
                            onChangeText={(value) => { setPassword(value) }}
                            type={showPassword ? "text" : "password"} />
                        <InputSlot pr="$3" onPress={handleState}>
                            <InputIcon
                                as={showPassword ? EyeIcon : EyeOffIcon}
                                color="$darkBlue500"
                            />
                        </InputSlot>

                    </Input>
                </FormControl>
            </Card>
            <Button onPress={submit} bgColor="$primary500" margin={"$3"}>
                <ButtonText>Submit Resignation</ButtonText>
            </Button>



        </ScrollView>
    );
}
