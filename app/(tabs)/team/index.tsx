import RowActionsMenu from "@/components/team/RowActionsMenu";
import { User } from "@/model/User";
import { getEmployeeBasic } from "@/service/UserService";
import { Button, ScrollView, Text } from "@gluestack-ui/themed";
import { useEffect, useState } from "react";
import { DataTable } from "react-native-paper";

export default function TeamInfo() {
  const [isManager, setIsManager] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [flashtag,setFlashTag]  = useState(0);
  const [user, setUser] = useState<User>();
  // Effect 1: Load user from localStorage and determine role
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user") as string);
    if (localUser) {
      setUser(localUser);
      setIsManager(localUser.roles === "Manager");
    }
  }, []);

  // Effect 2: Only fetch the profiles of employees if user is Manager
  const refreshEmployees = () => {
    getEmployeeBasic()
        .then((data) => {
          setEmployees(data);
        })
        .catch((err) => console.error("Error fetching employees:", err));
    }
  
  useEffect(() => {
    if (isManager) {
      refreshEmployees();
    }
  }, [isManager]);
  return (
    <ScrollView>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title><Text bold>Employee</Text></DataTable.Title>
          <DataTable.Title><Text bold>Role</Text></DataTable.Title>
          <DataTable.Title><Text bold>Group</Text></DataTable.Title>
          <DataTable.Title><Text bold>Status</Text></DataTable.Title>
          <DataTable.Title><Text bold>Actions</Text></DataTable.Title>
        </DataTable.Header>

        {employees.map((emp, idx) => (
          <DataTable.Row
            key={idx}
            style={{ backgroundColor: idx % 2 === 0 ? "#F0FFF0" : "#ffffff" }}
          >
            <DataTable.Cell>{emp.name}</DataTable.Cell>
            <DataTable.Cell>{emp.roles}</DataTable.Cell>
            <DataTable.Cell>{emp.groupName}</DataTable.Cell>
            <DataTable.Cell>{emp.active ? "Active" : "Inactive"}</DataTable.Cell>
            <DataTable.Cell>
              <RowActionsMenu employee={emp} actions={[
                {
                  key: "terminate",
                  label: "Terminate employment",
                  disabled: !emp.active,
                  onSelect: (employee) => {console.log("Terminate", employee.name);refreshEmployees},
                },
              ]} />
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  )

}