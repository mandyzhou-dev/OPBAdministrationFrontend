import { useEffect, useState } from "react";
import { ChevronDownIcon, Icon, ScrollView, SelectBackdrop, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectPortal, Text, View } from "@gluestack-ui/themed";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@gluestack-ui/themed";
import { getUserByGroup } from "@/service/UserService";
import { User } from "@/model/User";
import  ManagerView  from "./ManagerView";
import { EmployeeView } from "./EmployeeView";
import { router } from "expo-router";


export default function TargetIndex() {
    const [isManager, setIsManager] = useState(false);
    const [user, setUser] = useState<User>();
    const [employees, setEmployees] = useState<User[]>([]);
    const [selected, setSelected] = useState("");

    // Effect 1: Load user from localStorage and determine role
    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem("user") as string);
        if (localUser) {
            setUser(localUser);
            setIsManager(localUser.roles === "Manager"||localUser.roles.toLowerCase().includes("team_leader"));
        }else {
            router.navigate("/my"); 
            return;
        }
    }, []);

    // Effect 2: Only fetch employees if user is Manager
    useEffect(() => {
        if (isManager) {
            getUserByGroup("surrey")
                .then((data) => {
                    setEmployees(data); 
                })
                .catch((err) => console.error("Error fetching employees:", err));
                
            setSelected("total")//Rerender
        }
    }, [isManager]);

    return (
        <ScrollView style={{ padding: 16 }}>
            {
                isManager && (<Select onValueChange={(value) => { setSelected(value) }} defaultValue={"total"} initialLabel={"Total"}>
                    <SelectTrigger>
                        <SelectInput placeholder="Select" />
                        <SelectIcon mr="$3" as={ChevronDownIcon}>
                        </SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent >
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            <SelectItem key ={"total"} label={"Total"} value={"total"}/>
                            {employees.map((employee) => {
                                return (
                                    <SelectItem key={employee.username} label={employee.name} value={employee.username} />
                                )
                            })}

                        </SelectContent>
                    </SelectPortal>
                </Select>)
            }
            {isManager && selected === "total" ? (
                <ManagerView />
            ) : (
                <EmployeeView username={selected || user?.username} />
            )}
        </ScrollView>
    );
}
