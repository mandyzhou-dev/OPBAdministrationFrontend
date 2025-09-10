import { getBiweekKPIByUserAndGroup, getKPIByUserAndGroupAndDate } from "@/service/ShiftService";
import { isInProbation } from "@/service/UserService";
import { Button, ButtonText, Card, HStack, Heading, Input, ScrollView, Text, View } from "@gluestack-ui/themed";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

interface EmployeeViewProps {
    username?: string;
};

export function EmployeeView({ username }: EmployeeViewProps) {
    const [effectiveUsername, setEffectiveUsername] = useState<string>("");
    const [DailyKPI, setDailyKPI] = useState(0);
    const [probationFlag, setProbationFlag] = useState(false);
    const [BiweeklyKPI, setBiweeklyKPI] = useState({
        target: 0,
        bonus: 0,
        startDateTime: "",
        endDateTime: "",
    });
    useEffect(() => {
        // If no username from props, fall back to localStorage
        if (username) {
            setEffectiveUsername(username);
        } else {
            const localUser = JSON.parse(localStorage.getItem("user") as string);
            if (localUser?.username) {
                setEffectiveUsername(localUser.username);
            }
        }
    }, [username]);

    useEffect(() => {
        if (!effectiveUsername) return;

        getKPIByUserAndGroupAndDate(effectiveUsername!, "surrey", dayjs())
            .then((data) => {
                setDailyKPI(data.target ?? 0);
            })
            .catch((error) => {
                console.log((error as Error).message);
            });

        getBiweekKPIByUserAndGroup(effectiveUsername!, "surrey")
            .then((data) => {
                setBiweeklyKPI({
                    target: data.target ?? 0,
                    bonus: data.bonus ?? 0,
                    startDateTime: data.startDateTime ? new Date(data.startDateTime).toISOString()
                        : "",
                    endDateTime: data.endDateTime ? new Date(data.endDateTime).toISOString()
                        : "",
                });
            })
            .catch((error) => {
                console.log("Get Biweek KPI Error:", (error as Error).message);
            });

        isInProbation(effectiveUsername)
            .then((data) => {
                setProbationFlag(data);
            }

            ).catch((error) => {
                console.log("Get Probation Error")
            });

    }, [effectiveUsername]);



    return (
        <ScrollView>
            {/* Biweek KPI Card */}
            <Card mr={3} mt={5}>
                <Heading>Biweek KPI</Heading>
                <HStack>
                    <Text>
                        {dayjs(BiweeklyKPI.startDateTime.split("T")[0]).format("MMM DD")} -{" "}
                        {dayjs(BiweeklyKPI.endDateTime.split("T")[0]).format("MMM DD")}
                    </Text>
                </HStack>
                <HStack w="20%">
                    <Text size="6xl">{BiweeklyKPI.target}</Text>
                    <View style={{ position: "absolute", right: 0, bottom: 0 }}>
                        <Text>units</Text>
                    </View>
                </HStack>
            </Card>


            {/* TV Target Card */}
            <Card mr={3} mt={5}>
                <Heading>TV Target today</Heading>
                <HStack w="20%">
                    <Text size="6xl">{DailyKPI}</Text>
                    <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                        <Text>units</Text>
                    </View>
                </HStack>
            </Card>
            {/* TV Target Card */}
            <Card mr={3} mt={5}>
                <Heading>Biweek Bonus</Heading>
                <HStack w="20%">
                    <Text size="6xl">{probationFlag?"NA":BiweeklyKPI.bonus}</Text>
                    <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                        <Text>units</Text>
                    </View>
                </HStack>
            </Card>
        </ScrollView>
    );
}
