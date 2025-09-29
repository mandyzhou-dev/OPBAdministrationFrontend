import RowActionsMenu from "@/components/team/RowActionsMenu";
import TerminationModal from "@/components/team/TerminationModal";
import { TerminateInfo } from "@/model/TerminateInfo";
import { User } from "@/model/User";
import { getEmploymentByUsername, terminate } from "@/service/EmploymentService";
import { getEmployeeBasic } from "@/service/UserService";
import { Button, ScrollView, Text } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { DataTable } from "react-native-paper";
import ResignationTemplateModal from "../../../components/team/ResignationTemplateModal";
import { Employment } from "@/model/Employment";

export default function TeamInfo() {
  const [isManager, setIsManager] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [user, setUser] = useState<User>();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isTerminationModalShow,setIsTerminationModalShow] = useState(false);
  const [isTemplateModalShow,setIsTemplateModalShow] = useState(false);

  const [employment, setEmployment] = useState<Employment | null>(null);


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

  const handleTermination = async (employee: User, info: TerminateInfo) => {
    try {
      await terminate(employee.username, info);
      refreshEmployees();
      setIsTerminationModalShow(false); // Close the modal
    } catch (err) {
      console.error("Failed to terminate:", err);
      alert("Failed to terminate user");
    }
  };

  const openTerminationModal = (selectedEmployee:User)=>{
    setSelectedEmployee(selectedEmployee);
    setIsTerminationModalShow(true);
  }
  
  const openTemplateModal = (selectedEmployee:User)=>{
    setSelectedEmployee(selectedEmployee);
    setIsTemplateModalShow(true);
  }

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
                  label: "End employment",
                  disabled: !emp.active,
                  onSelect: (employee) => openTerminationModal(employee),//Open the modal
                },
                {
                  key: "etemplate",
                  label: "Generate the template for the resignation",
                  onSelect: async (employee) => {
                    openTemplateModal(employee)
                    const emp = await getEmploymentByUsername(employee.username);
                    setEmployment(emp);
                  },
                },
              ]} />
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
      {isTerminationModalShow && selectedEmployee && (
        <TerminationModal
          employee={selectedEmployee}
          visible={true}
          onCancel={() => setIsTerminationModalShow(false)}    // Close the modal
          onSubmit={handleTermination}
        />
      )}
      {isTemplateModalShow &&selectedEmployee && (
        <ResignationTemplateModal
          employee={selectedEmployee}
          employment={employment}
          visible={true}
          onClose={() => setIsTemplateModalShow(false)}
        />
      )}

    </ScrollView>
  )

}