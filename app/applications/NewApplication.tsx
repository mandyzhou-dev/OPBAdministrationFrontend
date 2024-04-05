
import { RequiredFormControl } from "@/components/FreeStyle/RequiredFormControl";
import { LeaveApplicationRequest } from "@/request/LeaveApplicationRequest";
import { InputField, Input, ButtonText, Button, FormControl, FormControlLabel, FormControlLabelText, Text, Card, Textarea, TextareaInput, ScrollView } from "@gluestack-ui/themed";
import moment from "moment";
import React from "react";


export default function NewApplication() {
    const [leaveTypeIsRequired, setLeaveTypeIsRequired] = React.useState(false);
    const [leaveTypeValue, setLeaveTypeValue] = React.useState("");
    const [commentIsRequired, setCommentIsRequired] = React.useState(false);
    const [dateIsRequired, setDateIsRequired] = React.useState(false);
    const [timeIsRequired,setTimeIsRequired] = React.useState(false);
    const [commentValue, setCommentValue] = React.useState("");
    const [durationValue, setDurationValue] = React.useState("oneday");
    const [dateValue, setDateValue] = React.useState("");
    const [timeValue,setTimeValue] = React.useState("");


    const submit = () => {
        if (!leaveTypeValue) {
            setLeaveTypeIsRequired(true);
            return;
        }
        if (!commentValue) {
            setCommentIsRequired(true);
            return;
        }
        if(!dateValue){
            setDateIsRequired(true);
            return;
        }
        if(!timeValue){
            setTimeIsRequired(true);
            return;
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
        if(localStorage.getItem("user") === null){
            alert("Submit Failure!")
            return;
        }   
        
        let username = JSON.parse(localStorage.getItem("user")).username
        let starttime = timeValue.split('-')[0];
        let endtime = timeValue.split('-')[1];
        let start = moment(dateValue+' '+starttime,"YYYY-MM-DD hh:mm").format();
        let end = moment(dateValue+' '+endtime,"YYYY-MM-DD hh:mm").format();
        let result = {
            applicant: username,
            start: start,
            end:end,
            leaveType:leaveTypeValue,
            reason:commentValue
        }
        console.log(result);
        const leaveApplicationRequest = new LeaveApplicationRequest;
        leaveApplicationRequest.putLeaveApplication(result);



    }
    return (
        <ScrollView>
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
                            Day
                        </FormControlLabel>
                        <Input
                            size="md"
                        >
                            <InputField placeholder="YYYY-MM-DD" onChangeText={(value)=>{setDateValue(value)}} />
                        </Input>
                    </FormControl>
                    <FormControl isRequired={timeIsRequired} isInvalid={timeIsRequired}>
                        <FormControlLabel>
                            Time
                        </FormControlLabel>
                        <Input
                            size="md"

                        >
                            <InputField placeholder="hh:mm-hh:mm" onChangeText={(value)=>{setTimeValue(value)}}/>
                        </Input>
                    </FormControl>

                </Card>
                :
                <Card>b</Card>
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