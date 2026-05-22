import { StyleSheet, View } from "react-native"
import { Alert, AlertIcon, AlertText, Button, Text, Card, Checkbox, CheckboxLabel, CheckboxIndicator, CheckboxIcon, CheckIcon, HStack, ButtonText, ButtonIcon, ArrowRightIcon, CheckboxGroup, InfoIcon, CircleIcon, RadioGroup, Radio, RadioLabel, RadioIndicator, RadioIcon } from "@gluestack-ui/themed"
import React, { useEffect } from "react"
import { batchByDate, getShiftCandidatesByDate } from "@/service/ShiftService";
import moment from "moment";
import { getStatutoryHoliday } from "@/service/StatutoryHolidayService";
import dayjs from "dayjs";
import { DatePicker, Flex } from "antd";
import { ShiftCandidate } from "@/model/ShiftCandidate";
import {
    CandidateStatus,
    filterSelectableUsernames,
    getCandidateStatus,
    isCandidateDisabled
} from "@/components/shift/SelectShiftFormCandidateState";

export const SelectShiftFrom: React.FC = () => {
    const [workDate, setWorkDate] = React.useState(dayjs())
    const [candidates, setCandidates] = React.useState<ShiftCandidate[]>([])
    const [checkedUsers, setCheckedUsers] = React.useState<string[]>([])
    const [checkedGroup, setCheckedGroup] = React.useState<string>('surrey')
    const [showSuccessAlert, setShowSuccessAlert] = React.useState(false)
    const [showErrorAlert, setShowErrorAlert] = React.useState(false)
    const [statutoryHolidays, setStatutoryHolidays] = React.useState<dayjs.Dayjs[]>([])
    const [errorMessage, setErrorMessage] = React.useState("Duplicate Shift!");

    const getWorkDateMoment = React.useCallback(() => {
        return moment()
            .year(workDate.year())
            .month(workDate.month())
            .date(workDate.date())
            .hour(workDate.hour())
            .minute(workDate.minute())
            .second(workDate.second())
    }, [workDate])

    const refreshCandidates = React.useCallback(() => {
        return getShiftCandidatesByDate(getWorkDateMoment(), checkedGroup).then(
            (data) => {
                setCandidates(data)
            }
        ).catch(
            (error) => {
                console.log((error as Error).message)
            }
        )
    }, [checkedGroup, getWorkDateMoment])

    useEffect(() => {
        getStatutoryHoliday().then(
            (data) => {
                setStatutoryHolidays(data.map(date => dayjs(date.statutoryDate)))
            }).catch(
            (error) => {
                console.log((error as Error).message)
            }
        )
    }, [])

    useEffect(() => {
        refreshCandidates()
    }, [refreshCandidates])

    useEffect(() => {
        setCheckedUsers((current) => filterSelectableUsernames(current, candidates))
    }, [candidates])

    const isDisabled = (date: any) => {
        return statutoryHolidays.some(holiday => holiday.isSame(date, "day"));
    };

    const handleCheckedUsersChange = (selected: string[]) => {
        setCheckedUsers(filterSelectableUsernames(selected, candidates))
    }

    const submitShift = () => {
        const selectableUsers = filterSelectableUsernames(checkedUsers, candidates)
        setCheckedUsers(selectableUsers)
        batchByDate(getWorkDateMoment(), checkedGroup, selectableUsers).then((obj) => {
            setShowSuccessAlert(true)
            setCheckedUsers([])
            refreshCandidates()
            setTimeout(() => { setShowSuccessAlert(false) }, 1000)
        }
        ).catch(
            (err: any) => {
                if (err.error == "SHIFT_ALREADY_EXISTS") {
                    setErrorMessage(err.message);
                    setShowErrorAlert(true);
                    setTimeout(() => { setShowErrorAlert(false) }, 8000)
                    return;
                }
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
                        {errorMessage}
                    </AlertText>
                </Alert>) : null}
            <Card margin={3}>
                <Text color="$text500" lineHeight="$xs">
                    Date
                </Text>
                <Flex vertical gap="small">
                    <DatePicker
                        value={workDate}
                        onChange={(d) => { if (d) setWorkDate(d) }
                        }
                        disabledDate={isDisabled}
                    />
                </Flex>
            </Card>


            <Card margin={3}>
                <HStack>
                    <Text color="$text500" lineHeight="$xs" mr={10}>
                        Group:
                    </Text>
                    <RadioGroup value={checkedGroup} onChange={(d) => setCheckedGroup(d)}>
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


            <Card margin={3}>
                <View style={styles.assignmentHeader}>
                    <Text color="$text500" lineHeight="$xs">
                        Assignment:
                    </Text>
                    <Text style={styles.legendText}>
                        Preferred = employee prefers to work this day
                    </Text>
                </View>

                <CheckboxGroup value={checkedUsers} onChange={handleCheckedUsersChange}>
                    <View style={styles.candidateList}>
                        {candidates.map((candidate) => {
                            const status = getCandidateStatus(candidate, checkedUsers)
                            const disabled = isCandidateDisabled(candidate)
                            return (
                                <ShiftCandidateRow
                                    key={candidate.username}
                                    candidate={candidate}
                                    status={status}
                                    disabled={disabled}
                                />
                            )
                        })}
                    </View>
                </CheckboxGroup>
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

interface ShiftCandidateRowProps {
    candidate: ShiftCandidate;
    status: CandidateStatus | null;
    disabled: boolean;
}

const ShiftCandidateRow: React.FC<ShiftCandidateRowProps> = ({ candidate, status, disabled }) => {
    return (
        <Checkbox
            aria-label={candidate.name ?? candidate.username}
            value={candidate.username}
            isDisabled={disabled}
            style={[
                styles.candidateRow,
                disabled ? styles.disabledCandidateRow : null,
            ]}
        >
            <View style={styles.candidateNameSlot}>
                <CheckboxLabel style={disabled ? styles.disabledCandidateName : styles.candidateName}>
                    {candidate.name ?? candidate.username}
                </CheckboxLabel>
            </View>
            <View style={styles.statusSlot}>
                <StatusTag status={status} />
            </View>
            <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
        </Checkbox>
    )
}

const StatusTag: React.FC<{ status: CandidateStatus | null }> = ({ status }) => {
    if (status === "alreadyScheduled") {
        return (
            <View style={[styles.statusTag, styles.alreadyScheduledTag]}>
                <Text style={styles.alreadyScheduledTagText}>Already scheduled</Text>
            </View>
        )
    }

    if (status === "selected") {
        return (
            <View style={[styles.statusTag, styles.selectedTag]}>
                <Text style={styles.selectedTagText}>Selected</Text>
            </View>
        )
    }

    if (status === "preferred") {
        return (
            <View style={[styles.statusTag, styles.preferredTag]}>
                <View style={styles.preferredDot} />
                <Text style={styles.preferredTagText}>Prefers this day</Text>
            </View>
        )
    }

    return null;
}

const styles = StyleSheet.create({
    assignmentHeader: {
        gap: 4,
        marginBottom: 10,
    },
    legendText: {
        color: "#64748B",
        fontSize: 12,
    },
    candidateList: {
        gap: 8,
    },
    candidateRow: {
        alignItems: "center",
        borderColor: "#E2E8F0",
        borderRadius: 6,
        borderWidth: 1,
        flexDirection: "row",
        gap: 8,
        justifyContent: "space-between",
        minHeight: 44,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    disabledCandidateRow: {
        backgroundColor: "#F8FAFC",
        cursor: "not-allowed",
    } as any,
    candidateNameSlot: {
        flex: 1,
        minWidth: 0,
    },
    candidateName: {
        color: "#0F172A",
    },
    disabledCandidateName: {
        color: "#94A3B8",
    },
    statusSlot: {
        alignItems: "flex-end",
        flexShrink: 0,
    },
    statusTag: {
        alignItems: "center",
        borderRadius: 6,
        borderWidth: 1,
        flexDirection: "row",
        gap: 6,
        minHeight: 22,
        paddingHorizontal: 8,
    },
    preferredTag: {
        backgroundColor: "#DCFCE7",
        borderColor: "#BBF7D0",
    },
    preferredTagText: {
        color: "#166534",
        fontSize: 12,
    },
    preferredDot: {
        backgroundColor: "#16A34A",
        borderRadius: 999,
        height: 6,
        width: 6,
    },
    alreadyScheduledTag: {
        backgroundColor: "#E2E8F0",
        borderColor: "#CBD5E1",
    },
    alreadyScheduledTagText: {
        color: "#475569",
        fontSize: 12,
    },
    selectedTag: {
        backgroundColor: "#EFF6FF",
        borderColor: "#BFDBFE",
    },
    selectedTagText: {
        color: "#1D4ED8",
        fontSize: 12,
    },
})
