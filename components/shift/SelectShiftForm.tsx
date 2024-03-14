import { View } from "react-native"
import { Alert, AlertIcon, AlertText,Button, Text, Card, Input, InputField, Checkbox, CheckboxLabel, CheckboxIndicator, CheckboxIcon, CheckIcon, HStack, ButtonText, ButtonIcon, ArrowRightIcon, CheckboxGroup, InfoIcon } from "@gluestack-ui/themed"
import React, { useEffect } from "react"
import DateTimePicker from '@react-native-community/datetimepicker';
import { DatePickerInput } from "react-native-paper-dates";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getUserByRole } from "@/service/UserService";
import { User } from "@/model/User";
import { batchByDate } from "@/service/ShiftService";
import { Shift } from "@/model/Shift";
export const SelectShiftFrom: React.FC = () => {
    const [workDate, setWorkDate] = React.useState(new Date())
    const [userList, setUserList] = React.useState<User[]>([])
    const [checkedUsers, setCheckedUsers] = React.useState<string[]>([])
    const [showSuccessAlert,setShowSuccessAlert] = React.useState(false)
    const [showErrorAlert,setShowErrorAlert] = React.useState(false)
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
    }, [])

    const submitShift = () => {
        batchByDate(workDate, checkedUsers).then((obj)=>{
            setShowSuccessAlert(true)
            setTimeout(()=>{setShowSuccessAlert(false)},1000)
        }
        ).catch(
            (error)=>{
                setShowErrorAlert(true);
                setTimeout(()=>{setShowErrorAlert(false)},1000)
                
            }
        )

        console.log(workDate);
        console.log(checkedUsers)
    }
    return (
        <View>
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Date
                </Text>
                <DatePickerInput
                    locale="en"
                    label="WorkDate"
                    value={workDate}
                    onChange={(d) => setWorkDate(d)}
                    inputMode="start"
                />

            </Card>




            <Card margin={3}>
                <HStack>
                    <Text color="$text500" lineHeight="$xs">
                        Assignment:
                    </Text>
                    <CheckboxGroup value={checkedUsers} onChange={(d) => setCheckedUsers(d)}>
                        {userList.map((user) => {
                            return (<Checkbox
                                key={user.username}
                                value={user.username}
                                justifyContent={"space-between"}
                                margin={10}>
                                <CheckboxLabel>{user.name}</CheckboxLabel>
                                <CheckboxIndicator>
                                    <CheckboxIcon as={CheckIcon} />
                                </CheckboxIndicator>
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
                    width={"$20"}
                >
                    <ButtonText>Submit </ButtonText>
                    <ButtonIcon as={ArrowRightIcon} />
                </Button>
            </Card>
            {showSuccessAlert?
            (<Alert mx="$2.5" action="success" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    Successfully submitted!
                </AlertText>
            </Alert>):""}
            {showErrorAlert?
            (<Alert mx="$2.5" action="error" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    Duplicate Shift, submitted failed!
                </AlertText>
            </Alert>):""}
        </View>
    )
}