
import { RequiredFormControl } from "@/components/FreeStyle/RequiredFormControl";
import { PutLeaveApplicationPayload } from "@/model/LeaveDateAvailability";
import { LeaveApplicationRequest } from "@/request/LeaveApplicationRequest";
import { InputField, Input, ButtonText, Button, FormControl, FormControlLabel, FormControlLabelText, Text, Card, Textarea, TextareaInput, ScrollView, Alert, AlertIcon, AlertText, InfoIcon } from "@gluestack-ui/themed";
import { DatePicker, Flex } from "antd";
import { Dayjs } from "dayjs";
import { router } from "expo-router";
import moment from "moment";
import React from "react";
import {
    areAllDatesScheduled,
    buildAvailabilityMap,
    formatBusinessDate,
    getVancouverToday,
    isLeaveDateDisabled,
    isSickLeave,
    LeaveAvailabilityMap,
} from "@/util/leaveDateAvailability";

const { RangePicker } = DatePicker;
const AVAILABILITY_DAYS = 90;
const helperTextStyle = {
    color: "#8c8c8c",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
};
const sickLeaveHelperTextStyle = {
    ...helperTextStyle,
    marginBottom: 12,
};

export default function NewApplication() {
    const [leaveTypeIsRequired, setLeaveTypeIsRequired] = React.useState(false);
    const [leaveTypeValue, setLeaveTypeValue] = React.useState("");
    const [commentIsRequired, setCommentIsRequired] = React.useState(false);
    const [dateIsRequired, setDateIsRequired] = React.useState(false);
    const [timeIsRequired, setTimeIsRequired] = React.useState(false);
    const [commentValue, setCommentValue] = React.useState("");
    const [durationValue, setDurationValue] = React.useState("oneday");
    const [dateValue, setDateValue] = React.useState<Dayjs | null>(null);
    const [timeValue, setTimeValue] = React.useState("");
    const [rangeValue, setRangeValue] = React.useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [rangeStartIsRequired, setRangeStartIsRequired] = React.useState(false);
    const [rangeEndIsRequired, setRangeEndIsRequired] = React.useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);
    const [showErrorAlert, setShowErrorAlert] = React.useState(false);
    const [availability, setAvailability] = React.useState<LeaveAvailabilityMap | null>(null);
    const [availabilityLoading, setAvailabilityLoading] = React.useState(false);
    const [availabilityError, setAvailabilityError] = React.useState("");
    const [availabilityRange, setAvailabilityRange] = React.useState<{ from: string, to: string } | null>(null);

    const getUsername = React.useCallback(() => {
        if (localStorage.getItem("user") === null) {
            return "";
        }
        return JSON.parse(localStorage.getItem("user") as string).username;
    }, []);

    const fetchAvailability = React.useCallback(async (fromDate: Dayjs, toDate: Dayjs) => {
        const username = getUsername();
        if (!username) {
            setAvailability(null);
            return null;
        }

        const from = formatBusinessDate(fromDate);
        const to = formatBusinessDate(toDate);
        setAvailabilityLoading(true);
        setAvailabilityError("");
        try {
            const leaveApplicationRequest = new LeaveApplicationRequest();
            const data = await leaveApplicationRequest.getLeaveDateAvailability(username, from, to);
            const availabilityMap = buildAvailabilityMap(data);
            setAvailability(availabilityMap);
            setAvailabilityRange({ from, to });
            return availabilityMap;
        } catch (error) {
            setAvailability(null);
            setAvailabilityError("Failed to load sick leave date availability.");
            return null;
        } finally {
            setAvailabilityLoading(false);
        }
    }, [getUsername]);

    React.useEffect(() => {
        if (!isSickLeave(leaveTypeValue)) {
            setAvailability(null);
            setAvailabilityError("");
            setAvailabilityRange(null);
            return;
        }

        const today = getVancouverToday();
        fetchAvailability(today, today.add(AVAILABILITY_DAYS, "day"));
    }, [leaveTypeValue, fetchAvailability]);

    const disabledDate = React.useCallback((current: Dayjs) => {
        return isLeaveDateDisabled(current, leaveTypeValue, availability);
    }, [leaveTypeValue, availability]);

    const ensureSelectedSickDatesAvailable = async (startDate: Dayjs, endDate: Dayjs) => {
        if (!isSickLeave(leaveTypeValue)) {
            return true;
        }

        let availabilityMap = availability;
        const selectedFrom = formatBusinessDate(startDate);
        const selectedTo = formatBusinessDate(endDate);
        const loaded = availabilityRange && selectedFrom >= availabilityRange.from && selectedTo <= availabilityRange.to;
        if (!loaded || !areAllDatesScheduled(startDate, endDate, availabilityMap)) {
            availabilityMap = await fetchAvailability(startDate, endDate);
        }

        if (!areAllDatesScheduled(startDate, endDate, availabilityMap)) {
            setAvailabilityError("Sick leave requires an existing scheduled shift for every selected date.");
            return false;
        }
        return true;
    }

    const renderSickLeaveDateHelper = () => {
        const shouldShowAvailabilityStatus = isSickLeave(leaveTypeValue);
        if (!shouldShowAvailabilityStatus) {
            return null;
        }

        return (
            <>
                <Text style={sickLeaveHelperTextStyle}>
                    {availabilityLoading ? "Loading sick leave availability..." : "Sick leave dates require an existing scheduled shift."}
                </Text>
                {availabilityError ?
                    <Text color="$red600" lineHeight="$xs">
                        {availabilityError}
                    </Text> : null}
            </>
        );
    }

    const submit = async () => {
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
            if (!rangeValue?.[0]) {
                setRangeStartIsRequired(true);
                return;
            }
            if (!rangeValue?.[1]) {
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
        setRangeStartIsRequired(false);
        setRangeEndIsRequired(false);
        if (localStorage.getItem("user") === null) {
            alert("Submit Failure!")
            return;
        }
        let start, end;
        let username = getUsername();
        if (durationValue == "oneday") {
            let starttime = timeValue.split('-')[0];
            let endtime = timeValue.split('-')[1];
            if (!await ensureSelectedSickDatesAvailable(dateValue!, dateValue!)) {
                return;
            }
            const date = formatBusinessDate(dateValue!);
            start = moment(date + ' ' + starttime, "YYYY-MM-DD HH:mm").format();
            end = moment(date + ' ' + endtime, "YYYY-MM-DD HH:mm").format();
        }
        if (durationValue == "range") {
            const rangeStartDate = rangeValue![0]!;
            const rangeEndDate = rangeValue![1]!;
            if (!await ensureSelectedSickDatesAvailable(rangeStartDate, rangeEndDate)) {
                return;
            }
            start = moment(formatBusinessDate(rangeStartDate) + ' 00:00', "YYYY-MM-DD HH:mm").format();
            end = moment(formatBusinessDate(rangeEndDate) + ' 23:59', "YYYY-MM-DD HH:mm").format();
        }
        let result: PutLeaveApplicationPayload = {
            applicant: username,
            start: start!,
            end: end!,
            leaveType: leaveTypeValue,
            reason: commentValue
        }
        console.log(result);
        const leaveApplicationRequest = new LeaveApplicationRequest;
        leaveApplicationRequest.putLeaveApplication(result).then(() => {
            setShowSuccessAlert(true)
            //TODO: Loading Page: Request submitted successfully! You can check the status of your request under 'My Applications'.
            setTimeout(() => {router.navigate("/applications/MyApplications")}, 1000);
            //setTimeout(() => { setShowSuccessAlert(false) }, 1000)
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
                                Day
                            </FormControlLabelText>

                        </FormControlLabel>
                        <Flex vertical gap="small">
                            <DatePicker
                                value={dateValue}
                                onChange={(value) => { setDateValue(value) }}
                                disabledDate={disabledDate}
                                style={{ width: "100%" }}
                            />
                        </Flex>
                        {renderSickLeaveDateHelper()}
                    </FormControl>
                    <FormControl isRequired={timeIsRequired} isInvalid={timeIsRequired} style={{ marginTop: 16 }}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                Time
                            </FormControlLabelText>

                        </FormControlLabel>
                        <Input
                            size="md"

                        >
                            <InputField placeholder="HHmm-HHmm" onChangeText={(value) => { setTimeValue(value) }} />
                        </Input>
                        <Text style={helperTextStyle}>
                            Format: HHmm-HHmm
                        </Text>
                    </FormControl>

                </Card>
                :
                <Card>
                    <FormControl isRequired={rangeStartIsRequired || rangeEndIsRequired} isInvalid={rangeStartIsRequired || rangeEndIsRequired}>
                        <FormControlLabel>
                            <FormControlLabelText>
                                Start / End Date
                            </FormControlLabelText>
                        </FormControlLabel>
                        <Flex vertical gap="small">
                            <RangePicker
                                value={rangeValue}
                                onChange={(value) => { setRangeValue(value) }}
                                disabledDate={disabledDate}
                                style={{ width: "100%" }}
                            />
                        </Flex>
                        {renderSickLeaveDateHelper()}
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
