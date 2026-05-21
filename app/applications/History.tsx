import {
    Button,
    ButtonText,
    Card,
    ChevronDownIcon,
    HStack,
    ScrollView,
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
    Spinner,
    Text,
    VStack,
    View
} from "@gluestack-ui/themed";
import React, { useEffect } from "react";
import { getApplicationHistory } from "@/service/ApplicationService";
import { getEmployeeOptions } from "@/service/UserService";
import { LeaveApplication } from "@/model/LeaveApplication";
import { User } from "@/model/User";
import { HistoryApplicationCard } from "@/components/applications/HistoryApplicationCard";
import { router } from "expo-router";

const ALL_EMPLOYEES_VALUE = "__all_employees__";
const HISTORY_PAGE_SIZE = 100;
const HISTORY_SORT = "submitTime,desc";

const canViewApplicationHistory = (roles?: string): boolean => {
    return roles?.split("|").some((role) => role.trim().toLowerCase() === "manager") ?? false;
}

const getEmployeeLabel = (employee: User): string => {
    if (employee.name && employee.username && employee.name !== employee.username) {
        return `${employee.name} (${employee.username})`;
    }
    return employee.name || employee.username;
}

export default function History(){
    const [operatorUsername,setOperatorUsername] = React.useState("");
    const [identityResolved,setIdentityResolved] = React.useState(false);
    const [canViewHistory,setCanViewHistory] = React.useState(false);
    const [applicationList,setApplicationList] = React.useState<LeaveApplication[]>([]);
    const [employeeOptions,setEmployeeOptions] = React.useState<User[]>([]);
    const [selectedEmployeeUsername,setSelectedEmployeeUsername] = React.useState<string | null>(null);
    const [initialHistoryReady,setInitialHistoryReady] = React.useState(false);
    const [employeesLoading,setEmployeesLoading] = React.useState(false);
    const [historyLoading,setHistoryLoading] = React.useState(false);
    const [employeesError,setEmployeesError] = React.useState("");
    const [historyError,setHistoryError] = React.useState("");

    const selectedEmployee = employeeOptions.find((employee) => employee.username === selectedEmployeeUsername);
    const selectedEmployeeLabel = selectedEmployee ? getEmployeeLabel(selectedEmployee) : "All employees";

    const loadHistory = React.useCallback((employeeUsername:string | null) => {
        if (!operatorUsername) {
            return Promise.resolve();
        }
        setHistoryLoading(true);
        setHistoryError("");
        return getApplicationHistory({
            operatorUsername:operatorUsername,
            employeeUsername:employeeUsername,
            page:0,
            size:HISTORY_PAGE_SIZE,
            sort:HISTORY_SORT
        }).then((data) => {
            setApplicationList(data.content);
        }).catch((error) => {
            setHistoryError((error as Error).message);
        }).finally(() => {
            setHistoryLoading(false);
        });
    },[operatorUsername]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") as string);
        if (!user) {
            router.navigate("/my");
            setIdentityResolved(true);
            return;
        }
        setOperatorUsername(user.username);
        setCanViewHistory(canViewApplicationHistory(user.roles));
        setIdentityResolved(true);
    },[]);

    useEffect(() => {
        if (!operatorUsername || !canViewHistory) {
            return;
        }
        setInitialHistoryReady(false);
        setEmployeesLoading(true);
        setEmployeesError("");
        const employeesRequest = getEmployeeOptions(true).then((data) => {
            setEmployeeOptions(data);
        }).catch((error) => {
            setEmployeesError((error as Error).message);
        }).finally(() => {
            setEmployeesLoading(false);
        });

        const historyRequest = loadHistory(selectedEmployeeUsername);
        Promise.all([employeesRequest, historyRequest]).finally(() => {
            setInitialHistoryReady(true);
        });
    },[operatorUsername, canViewHistory, loadHistory]);

    const handleEmployeeChange = (value:string) => {
        const employeeUsername = value === ALL_EMPLOYEES_VALUE ? null : value;
        setSelectedEmployeeUsername(employeeUsername);
        loadHistory(employeeUsername);
    }

    const handleClear = () => {
        setSelectedEmployeeUsername(null);
        loadHistory(null);
    }

    const handleRetryHistory = () => {
        loadHistory(selectedEmployeeUsername);
    }

    if (!identityResolved || !operatorUsername || (canViewHistory && !initialHistoryReady)) {
        return (
            <ScrollView>
                <Card>
                    <HStack alignItems="center" marginBottom={12}>
                        <Spinner />
                        <Text marginLeft={8}>Loading history...</Text>
                    </HStack>
                    <View height={18} width={90} bg="$backgroundLight200" marginBottom={10} />
                    <View height={44} width={280} maxWidth="100%" bg="$backgroundLight200" marginBottom={10} />
                    <View height={32} width={150} bg="$backgroundLight200" />
                </Card>
            </ScrollView>
        )
    }

    if (!canViewHistory && operatorUsername) {
        return (
            <View padding={16}>
                <Text>Application history is not available for this role.</Text>
            </View>
        )
    }

    return (
        <ScrollView>
            <Card padding={12}>
                <HStack alignItems="flex-end" flexWrap="wrap">
                    <VStack width={280} maxWidth="100%" marginRight={8} marginBottom={6}>
                        <Text size="sm" color="$textLight700">
                            Employee
                        </Text>
                        <Select
                            key={selectedEmployeeUsername ?? ALL_EMPLOYEES_VALUE}
                            onValueChange={handleEmployeeChange}
                            defaultValue={selectedEmployeeUsername ?? ALL_EMPLOYEES_VALUE}
                            initialLabel={selectedEmployeeLabel}
                            isDisabled={employeesLoading}
                        >
                            <SelectTrigger height={36}>
                                <SelectInput placeholder={employeesLoading ? "Loading employees..." : "All employees"} />
                                <SelectIcon mr="$3" as={ChevronDownIcon} />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    <SelectItem key={ALL_EMPLOYEES_VALUE} label="All employees" value={ALL_EMPLOYEES_VALUE}/>
                                    {employeeOptions.map((employee) => {
                                        return (
                                            <SelectItem key={employee.username} label={getEmployeeLabel(employee)} value={employee.username} />
                                        )
                                    })}
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </VStack>
                    <Button
                        size="sm"
                        variant="outline"
                        action="secondary"
                        marginRight={8}
                        marginBottom={6}
                        onPress={handleClear}
                        isDisabled={!selectedEmployeeUsername || historyLoading}
                    >
                        <ButtonText>Clear</ButtonText>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        action="primary"
                        marginBottom={6}
                        onPress={handleRetryHistory}
                        isDisabled={historyLoading}
                    >
                        <ButtonText>Retry</ButtonText>
                    </Button>
                </HStack>
                {employeesLoading ? <Text>Loading employees...</Text> : null}
                {employeesError ? <Text color="$red600">Employee list failed to load. Showing all history is still available.</Text> : null}
                {historyLoading ? (
                    <HStack marginTop={8}>
                        <Spinner />
                        <Text>Loading history...</Text>
                    </HStack>
                ) : null}
                {historyError ? <Text color="$red600">History failed to load.</Text> : null}
                {!historyLoading && !historyError && applicationList.length === 0 ? (
                    <Text>{selectedEmployeeUsername ? "No history records for this employee." : "No history records."}</Text>
                ) : null}
            </Card>

            <HStack flexWrap="wrap">
                {
                    applicationList.map((application) => {
                        return (
                            <div key={application.id} style={{ width: "calc(100% - 20px)", maxWidth: 380, display: "flex" }}>
                                <HistoryApplicationCard
                                application={application}/>
                            </div>
                        )
                    })
                }
            </HStack>
        </ScrollView>
    )
}
