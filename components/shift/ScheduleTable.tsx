import React, { useEffect } from "react";
import { Text, VStack, Box, HStack, Center, Button, ButtonIcon, ArrowLeftIcon, ArrowRightIcon, ButtonText, RefreshControl, RepeatIcon } from "@gluestack-ui/themed"
import { View, ScrollView, DeviceEventEmitter } from "react-native";
import { ShiftCell } from "./ShiftCell";
import { getScheduleThisWeek, getUserScheduleThisWeek } from "@/service/ShiftService";
import { Schedule } from "@/model/Schedule";
import { router } from "expo-router";
import { WorkTimeStatisticList } from "../statistics/WorkTimeStatisticList";
import moment from "moment";
import { getStatutoryHoliday } from "@/service/StatutoryHolidayService";
import { StatutoryHoliday } from "@/model/StatutoryHoliday";



export const ScheduleTable: React.FC = () => {

    const [shiftList, setShiftList] = React.useState<Schedule[]>([])
    const [currentDate, setCurrentDate] = React.useState(new Date())
    const [refreshCount, setRefreshCount] = React.useState(0)
    const [showStatistic, setShowStatistic] = React.useState(false);
    const [statutoryHolidays, setStatutoryHolidays] =React.useState<StatutoryHoliday[]>([])
    let listener

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('user') as string)
        if (user == null) {
            listener = DeviceEventEmitter.addListener('userlogin', () => {
                setRefreshCount(refreshCount + 1)
            })
            return;
        }
        if (user.roles == 'Manager') {
            setShowStatistic(true);
        }
        getScheduleThisWeek(user.username, moment(currentDate)).then(
            (data) => {
                setShiftList(data)
            }
        ).catch(
            (error) => {
                console.log((error as Error).message)
            }
        )
        getStatutoryHoliday().then(
                    (data) => {
                        //console.log(JSON.stringify(data))
                        setStatutoryHolidays(data)
                    }).catch(
                        (error) => {
                            console.log((error as Error).message)
                        }
                    )  

    }, [currentDate, refreshCount])

    const reload = () => {
        setRefreshCount(refreshCount + 1)
    }

    const onClickNextWeek = () => {

        const newDate = new Date(shiftList[6].date ? shiftList[6].date.toDate() : 0)
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    }

    const onClickPreviousWeek = () => {
        const newDate = new Date(shiftList[0].date ? shiftList[0].date.toDate() : 0)
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate)
    }
    const calculate = () => {
        let start = shiftList[0]?.date?.toDate()
        start?.setHours(0);
        start?.setMinutes(0, 0);
        let end = shiftList[6]?.date?.toDate();
        end?.setHours(23);
        end?.setMinutes(59, 59);
        return (
            <WorkTimeStatisticList start={start} end={end}></WorkTimeStatisticList>
        )
    }

    const getHolidayName = (dateStr: string) => {
        const found = statutoryHolidays.find(
            (h) => moment(h.statutoryDate).format("YYYY-MM-DD") === dateStr
        );
        return found ? found.holidayName : null;
    };

    return (
        <View>
            <HStack margin={"$1"}>
                <Button variant="link" onPress={() => { onClickPreviousWeek() }}>
                    <ButtonIcon as={ArrowLeftIcon} />
                </Button>
                <Center>
                    <Text>{shiftList[0] == undefined ? "" : shiftList[0].date?.format('YYYY-MM-DD')}-{shiftList[6] == undefined ? "" : shiftList[6]?.date?.format('YYYY-MM-DD')}</Text>
                </Center>
                <Button variant="link" onPress={() => { onClickNextWeek() }}>
                    <ButtonIcon as={ArrowRightIcon} color="blue" />
                </Button>
            </HStack>
            <ScrollView horizontal={true} >
                <HStack space="md" style={{ minWidth: 500 }}>
                    {shiftList.map((schedule) => {
                        
                        const formattedDate = schedule.date?.format("YYYY-MM-DD");
                        const holidayName = getHolidayName(formattedDate!);

                        return (
                            <VStack key={schedule.day} space="md" rounded="$md" shadowRadius="$1" style={{ minHeight: 300 }}>
                                <Center bg="$primary400" style={{ minWidth: 200, minHeight: 50 }}>
                                    <Text color="$white">{schedule.day}</Text>
                                    <Text color="white">{schedule.date?.format('YYYY-MM-DD')}</Text>
                                </Center>
                                <VStack padding={10}>

                                    {holidayName ? (
                                        <Box
                                            //bg="$green100"
                                            borderRadius={8}
                                            padding={8}
                                            marginBottom={8}
                                            alignItems="center"
                                        >
                                            <Text fontWeight="bold" color="$green700">
                                                {holidayName}
                                            </Text>
                                        </Box>
                                    ) : null}

                                    <ShiftCell workers={schedule.workers} shifts={schedule.shifts} onUpdated={reload}></ShiftCell>
                                </VStack>
                            </VStack>
                        )
                    })}
                </HStack>
            </ScrollView>
            <Button width={"$1/6"} onPress={() => { reload() }} margin={10}>
                <ButtonIcon as={RepeatIcon} />
            </Button>
            {showStatistic ? (calculate()) : null}
        </View>
    )
}