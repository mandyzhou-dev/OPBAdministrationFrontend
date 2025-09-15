import { getBiweekKPIByGroup, getKPIByDateAndGroup } from "@/service/ShiftService";
import { getBonusRate, getTargetRate, updateBonusRate, updateTargetRate } from "@/service/RateService";
import { Button, ButtonText, Card, HStack, Heading, Input, ScrollView, Text, View } from "@gluestack-ui/themed";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { getKPIRecordsByYear, updateKPIRecord } from "@/service/KPIRecordService";


export default function ManagerView() {
  const [TVNumber, setTVNumber] = useState(0);
  const [targetRate, setTargetRate] = useState(0);
  const [bonusRate, setBonusRate] = useState(0);
  const [tempActuals, setTempActuals] = useState<{ [key: number]: string }>({});
  const [biweeklyHistory, setBiweeklyHistory] = useState<{
    id: number,
    biweek: string,
    actual_kpi: number,
    expected_kpi: number
  }[]>([]);
  const [biweekData, setBiweekData] = useState({
    target: 0,
    startDateTime: "",
    endDateTime: "",
  });
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [role, setRole] = useState<String | null>(null);
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.roles);
    }
  }, []);

  useEffect(() => {

    getKPIRecordsByYear(new Date().getFullYear().toString())
      .then((data) => {
        const formattedData = data.map(item => ({
          id: item.id ?? 0,
          biweek: item.title ?? "",
          actual_kpi: item.actual ?? 0,
          expected_kpi: item.expected ?? 0
        }));
        setBiweeklyHistory(formattedData);
        setTempActuals(formattedData.reduce((acc, item) => (
          { ...acc, [item.id]: String(item.actual_kpi) }), {}));
      })
      .catch(error => console.log("Get KPI Records Error:", (error as Error).message));

    getKPIByDateAndGroup("surrey", dayjs())
      .then((data) => {
        setTVNumber(data.target ?? 0);
      })
      .catch((error) => {
        console.log((error as Error).message);
      });

    getTargetRate()
      .then((rateValue) => {
        setTargetRate(rateValue);
      })
      .catch((error) => {
        console.log("Get Rate Error:", (error as Error).message);
      });

    getBonusRate()
      .then((data) => {
        setBonusRate(data);
      })
      .catch((error) => {
        console.log("Get BonusRate Error:", (error as Error).message);
      })

    getBiweekKPIByGroup("surrey")
      .then((data) => {
        setBiweekData({
          target: data.target ?? 0,
          startDateTime: data.startDateTime ? new Date(data.startDateTime).toISOString()
            : "",
          endDateTime: data.endDateTime ? new Date(data.endDateTime).toISOString()
            : "",
        });
      })
      .catch((error) => {
        console.log("Get Biweek KPI Error:", (error as Error).message);
      });
  }, [refreshFlag]);

  const handleTargetRate = (text: string) => {
    const parsedRate = parseFloat(text);
    if (isNaN(parsedRate)) {
      console.log("Invalid rate value");
      return;
    }

    updateTargetRate(parsedRate)
      .then(() => {
        setRefreshFlag(f => f + 1);
      })
      .catch((error) => {
        console.log("Update Rate Error:", (error as Error).message);
      });
  };

  const handleBonusRate = (text: string) => {
    const parsedRate = parseFloat(text);
    if (isNaN(parsedRate)) {
      console.log("Invalid rate value");
      return;
    }

    updateBonusRate(parsedRate)
      .then(() => {
        setRefreshFlag(f => f + 1);
      })
      .catch((error) => {
        console.log("Update Rate Error:", (error as Error).message);
      });
  };

  const handleActualChange = (id: number, newActual: string) => {
    setTempActuals(prev => ({ ...prev, [id]: newActual }));
  };

  const handleUpdateKPI = (id: number) => {
    const recordToUpdate = biweeklyHistory.find(item => item.id === id);
    if (!recordToUpdate) return;

    updateKPIRecord(recordToUpdate.id, {
      id: recordToUpdate.id,
      title: recordToUpdate.biweek,
      expected: recordToUpdate.expected_kpi,
      actual: Number(tempActuals[recordToUpdate.id]) || 0
    })
      .then(() => {
        console.log(`KPI ${recordToUpdate.biweek} updated successfully`);

        getKPIRecordsByYear(new Date().getFullYear().toString())
          .then((data) => {
            const formattedData = data.map(item => ({
              id: item.id ?? 0,
              biweek: item.title ?? "",
              actual_kpi: item.actual ?? 0,
              expected_kpi: item.expected ?? 0
            }));
            setBiweeklyHistory(formattedData);
            setTempActuals(formattedData.reduce((acc, item) => (
              { ...acc, [item.id]: String(item.actual_kpi) }), {}));
          })
          .catch(error => console.log("Get KPI Records Error:", (error as Error).message));
      })
      .catch(error => console.log("Update KPI Error:", (error as Error).message));
  };



  return (
    <ScrollView>
      {/* Biweek KPI Card */}
      <Card mr={3} mt={5}>
        <Heading>Biweek KPI</Heading>
        <HStack>
          <Text>
            {dayjs(biweekData.startDateTime.split("T")[0]).format("MMM DD")} -{" "}
            {dayjs(biweekData.endDateTime.split("T")[0]).format("MMM DD")}
          </Text>
        </HStack>
        <HStack w="20%">
          <Text size="6xl">{biweekData.target}</Text>
          <View style={{ position: "absolute", right: 0, bottom: 0 }}>
            <Text>units</Text>
          </View>
        </HStack>
      </Card>


      {/* TV Target Card */}
      <Card mr={3} mt={5}>
        <Heading>TV Target today</Heading>
        <HStack w="20%">
          <Text size="6xl">{TVNumber}</Text>
          <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
            <Text>units</Text>
          </View>
        </HStack>
      </Card>
      {role === "Manager" && (<>
        <Card mr={3} mt={5}>
          <Heading>Rate</Heading>

          <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 8 }}>
            Target Rate:
          </Text>

          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              padding: 10,
              marginRight: 10,
              fontSize: 16,
            }}
            placeholder={`${targetRate}`}
            onSubmitEditing={(e) => handleTargetRate(e.nativeEvent.text)}
            onBlur={(e) => handleTargetRate(e.nativeEvent.text)}
            keyboardType="numeric"
          />

          <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 8 }}>
            Bonus Rate:
          </Text>

          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              padding: 10,
              marginRight: 10,
              fontSize: 16,
            }}
            placeholder={`${bonusRate}`}
            onSubmitEditing={(e) => handleBonusRate(e.nativeEvent.text)}
            onBlur={(e) => handleBonusRate(e.nativeEvent.text)}
            keyboardType="numeric"
          />
        </Card>
        {/* 📊 Biweekly KPI LineChart */}
        <Card mr={3} mt={5}>
          <Heading>📊 Biweekly KPI Progress (Latest six months)</Heading>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={biweeklyHistory.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="biweek" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual_kpi" stroke="#8884d8" name="Actual KPI" />
              <Line type="monotone" dataKey="expected_kpi" stroke="#82ca9d" name="Expected KPI" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card mr={3} mt={5} p={4}>
          <Heading size="md" mb={3}>🔧 Edit Biweekly KPI (The whole year)</Heading>
          {[...biweeklyHistory].reverse().map((item, index) => (
            <HStack key={item.biweek} justifyContent="space-between" alignItems="center" p={2} borderBottomWidth={1} borderColor="gray.200">
              <Text fontWeight="bold" w="15%">{item.biweek}</Text>
              <Text w="20%" color="green.600">Expected: {item.expected_kpi}</Text>
              <Text w="20%" color="blue.600">Actual: {item.actual_kpi}</Text>

              <TextInput
                value={tempActuals[item.id] || ""}
                onChangeText={(text) => handleActualChange(item.id, text)}
                style={{ borderWidth: 1, borderColor: "gray", padding: 5, borderRadius: 5, width: 80 }}
              />
              <Button
                margin={10}
                width={"$1/6"}
                action="positive"
                onPress={() => handleUpdateKPI(item.id)}
              >
                <ButtonText>Update</ButtonText>
              </Button>
            </HStack>
          ))}
        </Card>
      </>)}

    </ScrollView>
  );
}
