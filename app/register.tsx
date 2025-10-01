import { Button, ButtonText, Text, View, Center, Card, InputField, Input, ScrollView, Alert, AlertIcon, InfoIcon, AlertText } from "@gluestack-ui/themed"
import { Stack, router } from "expo-router"
import { register, sendCode } from "@/service/UserService";
import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";

export default function Register() {
    const [username, setUsername] = useState('')
    const [nickname, setNickname] = useState('')
    const [email, setEmail] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [legalName, setLegalName] = useState('')
    const [address, setAddress] = useState('')
    const [phoneNo, setPhoneNo] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [password, setPassword] = useState('')
    const [sinno, setSinno] = useState('')
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);



    const submit = () => {
        const address = `${streetAddress}, ${city}, ${province} ${postalCode}`;
        const legalName = `${firstName}${middleName ? ` ${middleName}` : ''} ${lastName}`;

        let formattedBirthdate = birthdate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");

        let registerInfo = {
            username: username,
            name: nickname,
            legalname: legalName,
            email: email,
            phoneNumber: phoneNo,
            address: address,
            birthdate: formattedBirthdate,
            sinno: sinno,
            password: password
        }
        register(registerInfo, verificationCode).then(() => {
            setShowSuccessAlert(true)
            alert(`Registration successful! 
            Please log in with your username (${username}) and the password you created.
            You will be redirected to the login page in 3 seconds.`);
            setTimeout(() => { router.navigate("") }, 3000)

        }).catch(
            (error) => {
                console.log(error)
                setShowErrorAlert(true);
                setTimeout(() => { setShowErrorAlert(false) }, 10000)

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
                    onPress={() => {
                        if (!email) {
                            alert("Please enter your email before sending the verification code.");
                            return;
                        }
                        sendCode(email);
                        alert(`Verification code has been sent to ' ${email} '`);
                    }}
                ><ButtonText>Send code</ButtonText>
                </Button>
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
                        onChangeText={(d) => setPassword(d)}
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
                    First Name
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={firstName}
                        onChangeText={(d) => setFirstName(d)}
                        placeholder="Your first name on your legal ID"
                    />
                </Input>
            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Middle Name
                </Text>
                <Input>
                    <InputField
                        value={middleName}
                        onChangeText={(d) => setMiddleName(d)}
                        placeholder="Your middle name on your legal ID(optional)"
                    />
                </Input>
            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Last Name
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={lastName}
                        onChangeText={(d) => setLastName(d)}
                        placeholder="Your last name on your legal ID"
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
                        onChangeText={(d) => setSinno(d)}
                        placeholder="Your SIN Number"
                    />
                </Input>

            </Card><Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Street Address
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={streetAddress}
                        onChangeText={(d) => setStreetAddress(d)}
                        placeholder="e.g., 1234 Elm St"
                    />
                </Input>
            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    City
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={city}
                        onChangeText={(d) => setCity(d)}
                        placeholder="e.g., Vancouver"
                    />
                </Input>
            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Province
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={province}
                        onChangeText={(d) => setProvince(d)}
                        placeholder="e.g., BC"
                    />
                </Input>
            </Card>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Postal Code
                </Text>
                <Input
                    isRequired>
                    <InputField
                        value={postalCode}
                        onChangeText={(d) => setPostalCode(d)}
                        placeholder="e.g., V6B 1A1"
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
            {showSuccessAlert ?
                (<Alert mx="$2.5" action="success" variant="solid" >
                    <AlertIcon as={InfoIcon} mr="$3" />
                    <AlertText>
                        Successfully postted!
                    </AlertText>
                </Alert>) : null}
            {
                showErrorAlert ?
                    (
                        <Alert mx="$2.5" action="error" variant="solid" >
                            <AlertIcon as={InfoIcon} mr="$3" />
                            <AlertText>
                                User already exists or verify code is wrong!
                            </AlertText>
                        </Alert>
                    ) : null}
            <Button
                margin={10}
                width={"$1/6"}
                action="positive"
                onPress={() => { submit() }}
            >
                <ButtonText>Done</ButtonText>
            </Button>


        </ScrollView>


    )
}