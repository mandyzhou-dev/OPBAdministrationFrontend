import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import { User } from "@/model/User";
import dayjs, { Dayjs } from "dayjs";

export interface TerminateInfo {
  lastDay: Dayjs | undefined;
  terminationReason: string;
}

interface TerminationModalProps {
  employee: User;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (employee: User, info: TerminateInfo) => Promise<void> | void;
}

const TerminationModal: React.FC<TerminationModalProps> = ({ employee, visible, onCancel, onSubmit }) => {
  const [reason, setReason] = useState("");
  const[parsedDate,setParsedDate] = useState("");

  const handleConfirm = async () => {
    if (!parsedDate) {
      alert("Please fill in date");
      return;
    }
    await onSubmit(employee, { lastDay: dayjs(parsedDate).startOf('day'), terminationReason: reason });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 20 }}>
        <View style={{ backgroundColor: "white", borderRadius: 8, padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            End Employment — {employee.name}
          </Text>

          <Text>Last Day (YYYY-MM-DD)</Text>
          <TextInput
            value={parsedDate}
            onChangeText={(text) => {
                setParsedDate(text);
              }}
            placeholder="e.g. 2025-10-01"
            style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 5, padding: 8, marginBottom: 12 }}
          />

          <Text>Reason</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for termination"
            style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 5, padding: 8, marginBottom: 20 }}
          />

          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Button title="Cancel" onPress={onCancel} />
            <View style={{ width: 10 }} />
            <Button title="Confirm" onPress={handleConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TerminationModal;
