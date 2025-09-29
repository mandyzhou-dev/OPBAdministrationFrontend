import React from "react";
import { Modal, Text, Button, ScrollView } from "react-native";
import { User } from "@/model/User";
import { Employment } from "@/model/Employment";
import dayjs, { Dayjs } from "dayjs";

interface ResignationTemplateModalProps {
  employee: User;
  employment: Employment | null;
  visible: boolean;
  onClose: () => void;
}

const BoldValue: React.FC<{ value: any; format?: string }> = ({ value, format }) => {
  let display: string;

  if (!value) {
    display = "NULL";
  } else if (dayjs.isDayjs(value)) {
    display = value.format(format ?? "YYYY-MM-DD");
  } else {
    display = String(value);
  }

  return <Text style={{ fontWeight: "bold" }}>{display}</Text>;
};

const ResignationTemplateModal: React.FC<ResignationTemplateModalProps> = ({
  employee,
  employment,
  visible,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontFamily: "monospace" }}>
          TO: <BoldValue value={employee.email} />{"\n"}
          Subject: Employee Resignation Confirmation Letter{"\n\n"}

          Employee Name: <BoldValue value={employment?.legalName} />{"\n"}
          Job Title: <BoldValue value={employment?.roles} />{"\n"}
          Start Date: <BoldValue value={employment?.bigDay} format="YYYY-MM-DD" />{"\n"}
          Work Schedule: (Full-time or Part-time, <BoldValue value="NULL" /> hours per week){"\n"}
          Last Working Day: <BoldValue value={employment?.lastDay} format="YYYY-MM-DD" />{"\n"}
          Reason for Resignation: <BoldValue value={employment?.terminationReason} />{"\n\n"}

          Dear <BoldValue value={employee.name} />,{"\n\n"}

          Our company has received your resignation submitted on{" "}
          <BoldValue value={employment?.noticeDate} format="YYYY-MM-DD" />.{"\n"}
          After confirmation, your last working day will be{" "}
          <BoldValue value={employment?.lastDay} format="YYYY-MM-DD" />.{"\n"}
          We sincerely thank you for your contributions and efforts since{" "}
          <BoldValue value={employment?.bigDay} format="YYYY-MM-DD" /> in the role of{" "}
          <BoldValue value={employment?.roles} />.{"\n"}
          We understand and respect your decision to resign due to{" "}
          <BoldValue value={employment?.terminationReason} />.{"\n\n"}

          Please ensure that all work handover and related documentation are completed before your last working day in accordance with company policies.{"\n"}
          Your salary and other entitlements will be settled and paid in accordance with labor regulations and company policies.{"\n\n"}

          Once again, we thank you for your dedication to the company and wish you all the best in your future career and personal endeavors.{"\n\n"}

          Sincerely,{"\n"}
          GNE Development Corp.{"\n"}
          Raynold Tseng{"\n"}
          TV Testing Organizer{"\n"}
          <BoldValue value={dayjs()} format="MMMM D, YYYY" />
        </Text>

        <Button title="Close" onPress={onClose} />
      </ScrollView>
    </Modal>
  );
};

export default ResignationTemplateModal;
