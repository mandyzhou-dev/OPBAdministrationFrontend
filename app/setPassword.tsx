import { Button, ButtonText, Card, Text, View, Input, InputField, Alert, AlertIcon, InfoIcon, AlertText } from "@gluestack-ui/themed"
import * as UserService from '@/service/UserService';
import { router, useLocalSearchParams } from "expo-router";
import React from "react";

export default function SetPassword() {
    const [password,setPassword] = React.useState("");
    const [repassword,setRepassword] = React.useState("");
    const [showSuccessAlert,setShowSuccessAlert] = React.useState(false);
    const [showErrorAlert,setShowErrorAlert] = React.useState(false);
    const params = useLocalSearchParams();
    return (
        <View>
            <Card margin={10}>
                <Input
                    margin={3}
                    variant="outline"
                    size="md"
                    isDisabled={false}
                    isInvalid={false}
                    isReadOnly={false}
                    
                >
                    <InputField value={password} onChangeText={(password)=>setPassword(password)} placeholder="New password" />
                </Input>
                <Input
                margin={3}
                    variant="outline"
                    size="md"
                    isDisabled={false}
                    isInvalid={false}
                    isReadOnly={false}
                >
                    <InputField value={repassword} onChangeText={(p)=>setRepassword(p)}placeholder="Type again" />
                </Input>
            </Card>
            <Button
                margin={10}
                width={"$1/6"}
                action="positive"
                onPress={()=>{
                    if(repassword==password){
                        setShowSuccessAlert(true);
                        setShowErrorAlert(false);
                        UserService.resetPassword(params.username,password);
                    }
                    else{
                        setShowErrorAlert(true);
                    }
                    //return ;   
                }}
            >
                <ButtonText>Done</ButtonText>
            </Button>
            {showSuccessAlert?
            (<Alert mx="$2.5" action="success" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    Password changed successfully!
                </AlertText>
            </Alert>):""}
            {showErrorAlert?
            (<Alert mx="$2.5" action="error" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    Failed!Please check your password!
                </AlertText>
            </Alert>):""}

        </View>
    )
}