
import { RequiredFormControl } from "@/components/FreeStyle/RequiredFormControl";
import { LeaveApplicationRequest } from "@/request/LeaveApplicationRequest";
import { InputField, Input, ButtonText, Button, FormControl, FormControlLabel, FormControlLabelText, Text, Card, Textarea, TextareaInput, ScrollView, Alert, AlertIcon, AlertText, InfoIcon } from "@gluestack-ui/themed";
import moment, { duration } from "moment";
import React from "react";


export default function NewApplication() {
    const [leaveTypeIsRequired, setLeaveTypeIsRequired] = React.useState(false);
    const [leaveTypeValue, setLeaveTypeValue] = React.useState("");
    const [commentIsRequired, setCommentIsRequired] = React.useState(false);
    const [dateIsRequired, setDateIsRequired] = React.useState(false);
    const [timeIsRequired, setTimeIsRequired] = React.useState(false);
    const [commentValue, setCommentValue] = React.useState("");
    const [durationValue, setDurationValue] = React.useState("oneday");
    const [dateValue, setDateValue] = React.useState("");
    const [timeValue, setTimeValue] = React.useState("");
    const [rangeStartDate, setRangeStartDate] = React.useState("");
    const [rangeEndDate, setRangeEndDate] = React.useState("")
    const [rangeStartIsRequired, setRangeStartIsRequired] = React.useState(false);
    const [rangeEndIsRequired, setRangeEndIsRequired] = React.useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);
    const [showErrorAlert, setShowErrorAlert] = React.useState(false);

    const submit = () => {
        if (!leaveTypeValue) {
            setLeaveTypeIsRequired(true);
            return;
        }
        if (!commentValue) {
            setCommentIsRequired(true);
            return;
        }
        if (durationValue == "oneday") {
            if (!dateValue) {
                setDateIsRequired(true);
                return;
            }
            if (!timeValue) {
                setTimeIsRequired(true);
                return;
            }
        }

        if (durationValue == "range") {
            if (!rangeStartDate) {
                setRangeStartIsRequired(true);
                return;
            }
            if (!rangeEndDate) {
                setRangeEndIsRequired(true);
                return;
            }
        }

        // console.log(leaveTypeValue);
        // console.log(commentValue);
        // console.log(durationValue);
        // console.log(dateValue);
        // console.log(timeValue);
        setLeaveTypeIsRequired(false);
        setCommentIsRequired(false);
        setDateIsRequired(false);
        setTimeIsRequired(false);
        if (localStorage.getItem("user") === null) {
            alert("Submit Failure!")
            return;
        }
        let start, end;
        let username = JSON.parse(localStorage.getItem("user") as string).username
        if (durationValue == "oneday") {
            let starttime = timeValue.split('-')[0];
            let endtime = timeValue.split('-')[1];
            start = moment(dateValue + ' ' + starttime, "YYYY-MM-DD HH:mm").format();
            end = moment(dateValue + ' ' + endtime, "YYYY-MM-DD HH:mm").format();
        }
        if (durationValue == "range") {
            console.log(rangeStartDate + ' 00:00')
            start = moment(rangeStartDate + ' 00:00', "YYYY-MM-DD HH:mm").format();
            end = moment(rangeEndDate + ' 23:59', "YYYY-MM-DD HH:mm").format();
        }
        let result = {
            applicant: username,
            start: start,
            end: end,
            leaveType: leaveTypeValue,
            reason: commentValue
        }
        console.log(result);
        const leaveApplicationRequest = new LeaveApplicationRequest;
        leaveApplicationRequest.putLeaveApplication(result).then(() => {
            setShowSuccessAlert(true)

            //Avoid duplicate submitting. Alert is not a good pactice.
            setTimeout(() => { alert("Request submitted successfully! You can check the status of your request under 'My Applications'.") }, 1000);

            setTimeout(() => { setShowSuccessAlert(false) }, 1000)
        }
        ).catch(
            (error) => {
                setShowErrorAlert(true);
                setTimeout(() => { setShowErrorAlert(false) }, 1000)

            }
        );



    }
    return (
        <ScrollView>
            {showSuccessAlert ?
                (<Alert mx="$2.5" action="success" variant="solid" >
                    <AlertIcon as={InfoIcon} mr="$3" />
                    <AlertText>
                        Successfully submitted!
                    </AlertText>
                </Alert>) : null}
            {
                showErrorAlert ?
                    (
                        <Alert mx="$2.5" action="error" variant="solid" >
                            <AlertIcon as={InfoIcon} mr="$3" />
                            <AlertText>
                                Failed!
                            </AlertText>
                        </Alert>
                    ) : null}
            <RequiredFormControl isRequired={leaveTypeIsRequired}
                isInvalid={leaveTypeIsRequired}
                title="Leave Type"
                items={[{
                    label: "Sick Leave",
                    value: "SICK"
                },
                {
                    label: "Personal Leave",
                    value: "personalleave"
                }
                ]}
                helper="If you choose the sick leave, don't forget to reserve your doctor's note"
                onUpdate={(value) => { setLeaveTypeValue(value) }}></RequiredFormControl>

            <RequiredFormControl
                title="Duration"
                defaultSelection="oneday"
                defaultLabel="Any part of a Day"
                items={[{
                    label: "Any part of a Day",
                    value: "oneday"
                },
                {
                    label: "Range of Date",
                    value: "range"
                }
                ]}
                onUpdate={(value) => { setDurationValue(value) }}></RequiredFormControl>

            {durationValue == "oneday" ?
                <Card>
                    <FormControl isRequired={dateIsRequired} isInvalid={dateIsRequired}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                Day(Format:YYYYMMDD)
                            </FormControlLabelText>

                        </FormControlLabel>
                        <Input
                            size="md"
                        >
                            <InputField placeholder="YYYYMMDD" onChangeText={(value) => { setDateValue(value) }} />
                        </Input>
                    </FormControl>
                    <FormControl isRequired={timeIsRequired} isInvalid={timeIsRequired}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                Time(Format:HHmm-HHmm)
                            </FormControlLabelText>

                        </FormControlLabel>
                        <Input
                            size="md"

                        >
                            <InputField placeholder="HHmm-HHmm" onChangeText={(value) => { setTimeValue(value) }} />
                        </Input>
                    </FormControl>

                </Card>
                :
                <Card>
                    <FormControl isRequired={rangeStartIsRequired} isInvalid={rangeStartIsRequired}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                Start Date(Format:YYYYMMDD)
                            </FormControlLabelText>
                        </FormControlLabel>
                        <Input
                            size="md"
                        >
                            <InputField placeholder="YYYYMMDD" onChangeText={(value) => { setRangeStartDate(value) }} />
                        </Input>
                    </FormControl>
                    <FormControl isRequired={rangeEndIsRequired} isInvalid={rangeEndIsRequired}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                End Date(Format:YYYYMMDD)
                            </FormControlLabelText>
                        </FormControlLabel>
                        <Input
                            size="md"

                        >
                            <InputField placeholder="YYYYMMDD" onChangeText={(value) => { setRangeEndDate(value) }} />
                        </Input>
                    </FormControl>
                </Card>
            }

            <Card>
                <FormControl isRequired={commentIsRequired} isInvalid={commentIsRequired}>
                    <FormControlLabel>
                        <FormControlLabelText>Comment</FormControlLabelText>
                    </FormControlLabel>
                    <Textarea >
                        <TextareaInput placeholder="Describe the reason for leaving..." onChangeText={(value) => { setCommentValue(value) }} />
                    </Textarea>
                </FormControl>
            </Card>

            <Button
                onPress={() => {
                    submit()
                }}
                margin={"$3"}

            >
                <ButtonText >Book time off</ButtonText>
            </Button>
        </ScrollView>
    )
}