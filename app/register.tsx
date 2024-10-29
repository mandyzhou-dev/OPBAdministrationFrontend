import { Button, ButtonText, Text, View, Center, Card, InputField, Input, ScrollView, Alert, AlertIcon, InfoIcon, AlertText } from "@gluestack-ui/themed"
import { Stack, router } from "expo-router"
import { register, sendCode } from "@/service/UserService";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";
export default function Register() {
    const [username, setUsername] = useState('')
    const [nickname, setNickname] = useState('')
    const [email, setEmail] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [legalName, setLegalName] = useState('')
    const [address, setAddress] = useState('')
    const [phoneNo, setPhoneNo] = useState('')
    const [birthdate,setBirthdate] = useState('')
    const [password,setPassword] = useState('')
    const [sinno,setSinno] = useState('')
    const [showSuccessAlert,setShowSuccessAlert] = useState(false);
    const [showErrorAlert,setShowErrorAlert] = useState(false);
    const submit=()=>{
        let registerInfo = {
            username:username,
            name:nickname,
            legalname: legalName,
            email:email,
            phoneNumber:phoneNo,
            address:address,
            birthdate:moment(birthdate,"YYYY-MM-DD").format(),
            sinno:sinno,
            password:password
        }
        register(registerInfo,verificationCode).then(()=>{
            setShowSuccessAlert(true)
            router.navigate("")

        }).catch(
            (error)=>{
                console.log(error)
                setShowErrorAlert(true);
                setTimeout(()=>{setShowErrorAlert(false)},10000)
                
            }
        );
        //TODO
    }
    //password ，birthdate,roles,sin and documents
    //They donot need to see their birthdate roles, sin , legalname and documents
    //They donnot need to assign their roles .
    return (
        <ScrollView>
            
            <Center margin={3} >
                <Text size="2xl"  >Create Account</Text>
            </Center>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Username
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={username}
                        onChangeText={(d) => { setUsername(d) }}
                        placeholder="create your login name"
                    />
                </Input>

            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Nickname
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={nickname}
                        onChangeText={(d) => { setNickname(d) }}
                        placeholder="The nickname you want to use in work"
                    />
                </Input>

            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Email
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={email}
                        onChangeText={(d) => { setEmail(d) }}
                        placeholder="Your email address for e-transfer payment"
                    />
                </Input>

                <Button
                    margin={10}
                    width={"$1/6"}
                    action="positive"
                    onPress={() => { sendCode(email) }}
                >Send code</Button>
                <Input>
                    <InputField
                        value={verificationCode}
                        onChangeText={(d) => { setVerificationCode(d) }}

                        placeholder="Verification Code"
                    /></Input>

            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Password
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={password}
                        onChangeText={(d)=>setPassword(d)}
                        placeholder="Set Your Password"
                    />
                </Input>

            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Birthdate(Format("YYYYMMDD"))
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={birthdate}
                        onChangeText={(d) => setBirthdate(d)}
                        placeholder="Your Birthdate"
                    />
                </Input>

            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Legalname
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={legalName}
                        onChangeText={(d) => setLegalName(d)}
                        placeholder="Your name on your lagal ID"
                    />
                </Input>

            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    SIN Nuber
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={sinno}
                        onChangeText={(d)=>setSinno(d)}
                        placeholder="Your SIN Number"
                    />
                </Input>

            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Address
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={address}
                        onChangeText={(d) => setAddress(d)}
                        placeholder="Your address"
                    />
                </Input>

            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Phone Number
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={phoneNo}
                        onChangeText={(d) => setPhoneNo(d)}
                        placeholder="Your phone number"
                    />
                </Input>

            </Card>

            <Button
                margin={10}
                width={"$1/6"}
                action="positive"
                onPress={() => { submit()}}
            >
                <ButtonText>Done</ButtonText>
            </Button>
            {showSuccessAlert?
            (<Alert mx="$2.5" action="success" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    Successfully postted!
                </AlertText>
            </Alert>):null}
            {
                showErrorAlert?
                (
                    <Alert mx="$2.5" action="error" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    Failed!
                </AlertText>
            </Alert>
                ):null}

        </ScrollView>


    )
}