import { View } from "react-native"
import { Alert, AlertIcon, AlertText, Button, Text, Card, Input, InputField, Checkbox, CheckboxLabel, CheckboxIndicator, CheckboxIcon, CheckIcon, HStack, ButtonText, ButtonIcon, ArrowRightIcon, CheckboxGroup, InfoIcon, BadgeIcon, CircleIcon, RadioGroup, Radio, RadioLabel, RadioIndicator, RadioIcon } from "@gluestack-ui/themed"
import React, { useEffect } from "react"
import { DatePickerInput } from "react-native-paper-dates";
import { getUserByRole } from "@/service/UserService";
import { User } from "@/model/User";
import { batchByDate } from "@/service/ShiftService";
import { getPreferredEmployeesBydate } from "@/service/ShiftBoardService";
import moment from "moment";
export const SelectShiftFrom: React.FC = () => {
    const [workDate, setWorkDate] = React.useState(new Date())
    const [userList, setUserList] = React.useState<User[]>([])
    const [checkedUsers, setCheckedUsers] = React.useState<string[]>([])
    const [checkedGroup,setCheckedGroup] = React.useState<string>('')
    const [showSuccessAlert, setShowSuccessAlert] = React.useState(false)
    const [showErrorAlert, setShowErrorAlert] = React.useState(false)
    const [preferredWorkers, setPreferredWorkers] = React.useState<string[]>([])
    useEffect(() => {
        getUserByRole("tester").then(
            (data) => {
                setUserList(data)
                //console.log(data)
            }
        ).catch(
            (error) => {
                console.log((error as Error).message)
            }
        )
        getPreferredEmployeesBydate(workDate).then(
            (data) => {

                setPreferredWorkers(data)
            }
        ).catch(
            (error) => {
                console.log((error as Error).message)
            }
        )
        

    }, [])
    const freeTodayByUsername = (username: string) => {
        console.log("hello")
        console.log("function: " + preferredWorkers);
        for (let worker of preferredWorkers) {
            console.log("workder: " + worker)
            console.log("username: " + username)
            if (worker === username) {
                console.log(username + "equals")
                return true;
            }
        }
        return false;
    }
    const submitShift = () => {
        console.log("getdate(): " + workDate.getDate())
        const workDateMoment = moment().year(workDate.getFullYear()).month(workDate.getMonth()).date(workDate.getDate()).hour(workDate.getHours()).minute(workDate.getMinutes()).second(workDate.getSeconds())
        batchByDate(workDateMoment,checkedUsers).then((obj) => {
            setShowSuccessAlert(true)
            setTimeout(() => { setShowSuccessAlert(false) }, 1000)
        }
        ).catch(
            (error) => {
                setShowErrorAlert(true);
                setTimeout(() => { setShowErrorAlert(false) }, 1000)

            }
        )
    }
    return (
        <View>
            {showSuccessAlert ?
                (<Alert mx="$2.5" action="success" variant="solid" >
                    <AlertIcon as={InfoIcon} mr="$3" />
                    <AlertText>
                        Successfully submitted!
                    </AlertText>
                </Alert>) : null}
            {showErrorAlert ?
                (<Alert mx="$2.5" action="error" variant="solid" >
                    <AlertIcon as={InfoIcon} mr="$3" />
                    <AlertText>
                        Duplicate Shift, submitted failed!
                    </AlertText>
                </Alert>) : null}
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Date
                </Text>
                <DatePickerInput
                    locale="en"
                    label="WorkDate"
                    value={workDate}
                    onChange={(d) => {
                        if (d) {
                            setWorkDate(d)
                            getPreferredEmployeesBydate(d).then(
                                (data) => {
                                    console.log("data: " + data)
                                    setPreferredWorkers(data)
                                }
                            ).catch(
                                (error) => {
                                    console.log((error as Error).message)
                                }
                            )
                        }
                    }
                    }
                    inputMode="start"
                />
            </Card>
            {/*
            <Card margin={3}>
                <HStack>
                    <Text color="$text500" lineHeight="$xs" mr={10}>
                        Group:
                    </Text>
                    <RadioGroup value={checkedGroup} onChange={(d)=>setCheckedGroup(d)}>
                    <HStack space="2xl">
                        <Radio value="surrey" size="md">
                            <RadioIndicator>
                                <RadioIcon as={CircleIcon} />
                            </RadioIndicator>
                            <RadioLabel>SRY</RadioLabel>
                        </Radio>
                        <Radio value="coquitlam" size="md">
                            <RadioIndicator>
                                <RadioIcon as={CircleIcon} />
                            </RadioIndicator>
                            <RadioLabel>COQ</RadioLabel>
                        </Radio>
                        </HStack>
                    </RadioGroup>
                </HStack>
            </Card>
            */}
            <Card margin={3}>
                <HStack>
                    <Text color="$text500" lineHeight="$xs">
                        Assignment:
                    </Text>

                    <CheckboxGroup value={checkedUsers} onChange={(d) => setCheckedUsers(d)}>
                        {userList.map((user) => {
                            return (<Checkbox
                                aria-label={user.name}
                                key={user.username}
                                value={user.username ?? "No Name!"}
                                justifyContent={"space-between"}
                                margin={10}>
                                <CheckboxLabel>{user.name}</CheckboxLabel>
                                <CheckboxIndicator>
                                    <CheckboxIcon as={CheckIcon} />
                                </CheckboxIndicator>
                                {(freeTodayByUsername(user.username ?? "No Name!")) ? <BadgeIcon as={CircleIcon} color="green" /> : null}
                            </Checkbox>)
                        })}
                    </CheckboxGroup>
                </HStack>
            </Card>
            <Card margin={3}>
                <Button
                    onPress={() => { submitShift() }}
                    size="md"
                    variant="solid"
                    action="primary"
                    isDisabled={false}
                    isFocusVisible={false}
                >
                    <ButtonText>Submit</ButtonText>
                    <ButtonIcon as={ArrowRightIcon} />
                </Button>
            </Card>
        </View>
    )
}