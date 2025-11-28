import { Button, ButtonText, Text, View, Center, Card, InputField, Input, ScrollView, Alert, AlertIcon, InfoIcon, AlertText, FormControl, FormControlLabel, FormControlLabelText, HStack, InputSlot, Box, set } from "@gluestack-ui/themed"
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

    const [isSent, setIsSent] = useState(false);

    const [errorMessage, setErrorMessage] = useState("Failed!");
    const [usernameIsInvalid, setUsernameIsInvalid] = useState(false);
    const [nicknameIsInvalid, setNicknameIsInvalid] = useState(false);
    const [emailIsInvalid, setEmailIsInvalid] = useState(false);
    const [codeIsInvalid, setCodeIsInvalid] = useState(false);
    const [birthdateIsInvalid, setBirthdateIsInvalid] = useState(false);
    const [firstNameIsInvalid, setFirstNameIsInvalid] = useState(false);
    const [lastNameIsInvalid, setLastNameIsInvalid] = useState(false);
    const [sinIsInvalid, setSinIsInvalid] = useState(false);
    const [phonenoIsInvalid, setPhonenoIsInvalid] = useState(false);
    const [stIsInvalid, setStIsInvalid] = useState(false);
    const [cityIsInvalid, setCityIsInvalid] = useState(false);
    const [provinceIsInvalid, setProvinceIsInvalid] = useState(false);
    const [postalCodeIsInvalid, setPostalCodeIsInvalid] = useState(false);

    const submit = () => {
        //Validation begins
        if (!username) {
            setUsernameIsInvalid(true);
            setErrorMessage("Please enter the username.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }

        if (!nickname) {
            setNicknameIsInvalid(true);
            setErrorMessage("Please enter the nickname.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }

        if (!email) {
            setEmailIsInvalid(true);
            setErrorMessage("Please enter the email.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }

        if (!verificationCode) {
            setCodeIsInvalid(true);
            setErrorMessage("Please enter the correct verification code.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }

        if (!birthdate) {
            setBirthdateIsInvalid(true);
            setErrorMessage("Please enter the birth date.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }
        const parsedDate = dayjs(birthdate, ["YYYYMMDD", "YYYY-MM-DD", "YYYY/MM/DD"]);
        if (!parsedDate.isValid()) {
            setBirthdateIsInvalid(true);
            setErrorMessage("Invalid birthdate format. Use YYYY-MM-DD or YYYYMMDD.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000);
            return;
        }
        if (!firstName) {
            setFirstNameIsInvalid(true);
            setErrorMessage("Please enter the first name.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }
        if (!lastName) {
            setLastNameIsInvalid(true);
            setErrorMessage("Please enter the last name.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }
        if (!sinno) {
            setSinIsInvalid(true);
            setErrorMessage("Please enter the SIN number.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }
        if (!phoneNo) {
            setSinIsInvalid(true);
            setErrorMessage("Please enter the phone number.");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }
        if (!streetAddress) {
            setStIsInvalid(true);
            setErrorMessage("Please enter the street adress");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }
        if (!city) {
            setCityIsInvalid(true);
            setErrorMessage("Please enter the City");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }
        if (!province) {
            setProvinceIsInvalid(true);
            setErrorMessage("Please enter the province")
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }
        if (!postalCode) {
            setPostalCodeIsInvalid(true);
            setErrorMessage("Please enter the postal code");
            setShowErrorAlert(true);
            setTimeout(() => { setShowErrorAlert(false) }, 3000)
            return;
        }

        setUsernameIsInvalid(false);
        setNicknameIsInvalid(false);
        setEmailIsInvalid(false);
        setBirthdateIsInvalid(false);
        setFirstNameIsInvalid(false);
        setLastNameIsInvalid(false);
        setSinIsInvalid(false);
        setPhonenoIsInvalid(false);
        setStIsInvalid(false);
        setCityIsInvalid(false);
        setProvinceIsInvalid(false);
        setPostalCodeIsInvalid(false);

        //Validation ends

        const address = `${streetAddress}, ${city}, ${province} ${postalCode}`;
        const legalName = `${firstName}${middleName ? ` ${middleName}` : ''} ${lastName}`;



        let registerInfo = {
            username: username,
            name: nickname,
            legalname: legalName,
            email: email,
            phoneNumber: phoneNo,
            address: address,
            birthdate: parsedDate,
            sinno: sinno,
            password: password
        }
        register(registerInfo, verificationCode).then(() => {
            setShowErrorAlert(false);
            setShowSuccessAlert(true)
            alert(`Registration successful! 
            Please log in with your username (${username}) and the password you created.
            You will be redirected to the login page in 3 seconds.`);
            setTimeout(() => { router.navigate("") }, 3000)

        }).catch(
            (error) => {
                if(error.error=="USERNAME_ALREADY_EXISTS"){
                    setErrorMessage(error.message);
                    setShowErrorAlert(true);
                    return;
                }
                if(error.error=="INVALID_VERIFICATION_CODE"){
                    setErrorMessage(error.message);
                    setShowErrorAlert(true);
                    return;
                }
                if(error.error=="EMAIL_ALREADY_REGISTERED"){
                    setErrorMessage(error.message);
                    setShowErrorAlert(true);
                    return;
                }
                setErrorMessage("Unexpected Error.");
                setShowErrorAlert(true);
                //setTimeout(() => { setShowErrorAlert(false) }, 10000)
            }
        );
        //TODO
    }
    return (
        <ScrollView>

            <Center margin={3} >
                <Text size="2xl"  >Create Account</Text>
            </Center>
            <Card margin={3}>
                <FormControl isRequired isInvalid={usernameIsInvalid}>
                    <FormControlLabel>
                        <FormControlLabelText>
                            Username
                        </FormControlLabelText>
                    </FormControlLabel>
                    <Input
                        size="md"
                    >
                        <InputField
                            value={username}
                            onChangeText={(d) => { setUsername(d) }}
                            placeholder="create your login name"
                        />
                    </Input>
                </FormControl>
            </Card>

            <Card margin={3}>
                <FormControl isRequired isInvalid={nicknameIsInvalid}>
                    <FormControlLabel>
                        <FormControlLabelText>
                            Nickname
                        </FormControlLabelText>
                    </FormControlLabel>
                    <Input
                        size="md"
                    >
                        <InputField
                            value={nickname}
                            onChangeText={(d) => { setNickname(d) }}
                            placeholder="The nickname you want to use in work"
                        />
                    </Input>
                </FormControl>
            </Card>

            <Card margin={3}>

                <FormControl isRequired isInvalid={emailIsInvalid}>
                    <FormControlLabel>
                        <FormControlLabelText>
                            Payroll Email
                        </FormControlLabelText>
                    </FormControlLabel>
                    <HStack alignItems="center" space="sm">
                        {/* Email Input */}
                        <Input flex={1}>
                            <InputField
                                value={email}
                                onChangeText={setEmail}
                                placeholder="An email that can receive Interac e-Transfer payroll payments"
                            />
                        </Input>

                        {/* Send Button */}
                        <Button
                            size="sm"
                            px="$3"
                            action={isSent ? "secondary" : "positive"}
                            disabled={isSent}
                            onPress={() => {
                                if (!email) {
                                    setErrorMessage("Please enter your email before sending the verification code.");
                                    setShowErrorAlert(true);
                                    setTimeout(() => setShowErrorAlert(false), 3000);
                                    return;
                                }
                                sendCode(email);
                                setIsSent(true);
                                setTimeout(() => setIsSent(false), 60000);
                            }}
                        >
                            <ButtonText>{isSent ? "Sent - Try again in 60s" : "Send"}</ButtonText>
                        </Button>
                    </HStack>
                </FormControl>

                {/* Verification Code Input */}
                <FormControl mt="$4" isRequired isInvalid={codeIsInvalid}>
                    <FormControlLabel>
                        <FormControlLabelText>Verification Code</FormControlLabelText>
                    </FormControlLabel>
                    <Input>
                        <InputField
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            placeholder="Verification Code"
                        />
                    </Input>
                </FormControl>
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
                <FormControl isRequired isInvalid={birthdateIsInvalid}>
                    <FormControlLabel>
                        <FormControlLabelText>
                            Birthdate(Format("YYYYMMDD"))
                        </FormControlLabelText>
                    </FormControlLabel>
                    <Input
                        size="md"
                    >
                        <InputField
                            value={birthdate}
                            onChangeText={(d) => { setBirthdate(d) }}
                            placeholder="Your Birthdate on your legal ID"
                        />
                    </Input>
                </FormControl>
            </Card>

            <Card>
                <Text mb="$1" fontWeight="$medium">Your legal name as shown on your legal ID (e.g., passport, driver’s license)</Text>
                <HStack space="md" mt="$3">
                    {/* First Name */}
                    <Box flex={1}>
                        <FormControl isRequired isInvalid={firstNameIsInvalid}>
                            <FormControlLabel>
                                <FormControlLabelText fontSize="$sm">First Name</FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                                <InputField
                                    placeholder="First name on your legal ID"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </Input>
                        </FormControl>
                    </Box>
                    {/* Middle Name */}
                    <Box flex={1}>
                        <Text mb="$1" fontWeight="$medium" fontSize="$sm"> Middle Name</Text>
                        <Input>
                            <InputField
                                placeholder="(Optional)"
                                value={middleName}
                                onChangeText={setMiddleName}
                            />
                        </Input>
                    </Box>
                    {/* Last Name */}
                    <Box flex={1}>
                        <FormControl isRequired isInvalid={lastNameIsInvalid}>
                            <FormControlLabel>
                                <FormControlLabelText fontSize="$sm">Last Name</FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                                <InputField
                                    placeholder="Last name on your legal ID"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </Input>
                        </FormControl>
                    </Box>
                </HStack>
            </Card>

            <Card margin={3}>
                <FormControl isRequired isInvalid={sinIsInvalid}>
                    <FormControlLabel>
                        <FormControlLabelText>SIN Nuber</FormControlLabelText>
                    </FormControlLabel>
                    <Input>
                        <InputField
                            placeholder="Your SIN Number"
                            value={sinno}
                            onChangeText={setSinno}
                        />
                    </Input>
                </FormControl>
            </Card>

            <HStack>
                <Card margin={3} flex={1}>
                    <FormControl isRequired isInvalid={stIsInvalid}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                Street Address
                            </FormControlLabelText>
                        </FormControlLabel>

                        <Input>
                            <InputField
                                value={streetAddress}
                                onChangeText={(d) => setStreetAddress(d)}
                                placeholder="e.g., 1234 Elm St"
                            />
                        </Input>
                    </FormControl>
                </Card>

                <Card margin={3} flex={1}>
                    <FormControl isRequired isInvalid={cityIsInvalid}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                City
                            </FormControlLabelText>
                        </FormControlLabel>
                        <Input
                            isRequired>
                            <InputField
                                value={city}
                                onChangeText={(d) => setCity(d)}
                                placeholder="e.g., Vancouver"
                            />
                        </Input>
                    </FormControl>
                </Card>
            </HStack>
            <HStack>
                <Card margin={3} flex={1}>
                    <FormControl isRequired isInvalid={provinceIsInvalid}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                Province
                            </FormControlLabelText>
                        </FormControlLabel>
                        <Input
                            isRequired>
                            <InputField
                                value={province}
                                onChangeText={(d) => setProvince(d)}
                                placeholder="e.g., BC"
                            />
                        </Input>
                    </FormControl>
                </Card>
                <Card margin={3} flex={1}>
                    <FormControl isRequired isInvalid={postalCodeIsInvalid}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                Postal Code
                            </FormControlLabelText>
                        </FormControlLabel>
                        <Input
                            isRequired>
                            <InputField
                                value={postalCode}
                                onChangeText={(d) => setPostalCode(d)}
                                placeholder="e.g., V6B 1A1"
                            />
                        </Input>
                    </FormControl>
                </Card>

            </HStack>
            <Card margin={3}>
                <FormControl isRequired isInvalid={phonenoIsInvalid}>
                    <FormControlLabel>
                        <FormControlLabelText>Phone Number</FormControlLabelText>
                    </FormControlLabel>
                    <Input>
                        <InputField
                            placeholder="Your phone number"
                            value={phoneNo}
                            onChangeText={setPhoneNo}
                        />
                    </Input>
                </FormControl>
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
                                {errorMessage}
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