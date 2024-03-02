import React, { useEffect } from "react";
import {Text, VStack, Box, HStack, Center} from "@gluestack-ui/themed"
import { View, ScrollView } from "react-native";
import { ShiftCell } from "./ShiftCell";
import { getScheduleThisWeek } from "@/service/ShiftService";
import { Schedule } from "@/model/Schedule";


export const ScheduleTable:React.FC = () => {

    const [shiftList, setShiftList] = React.useState<Schedule[]>([])

    useEffect(() => {
        getScheduleThisWeek(new Date()).then(
            (data) => {
                setShiftList(data)
            }
        ).catch(
            (error) => {
                console.log((error as Error).message)
            }
        )
        
    }, [])

    return (
        <View>
            <Text>{shiftList[0]==undefined?"":shiftList[0].date.toDateString()}</Text>
            <Text>-</Text>
            <Text>{shiftList[6]==undefined?"":shiftList[6].date.toDateString()}</Text>
            <ScrollView horizontal={true}>
                
                <HStack space="md" style={{minWidth: 500}}>
                    { shiftList.map((schedule) =>{
                        const workers:Schedule[] = schedule.workers;
                        return (
                            
                            <VStack key={schedule.day} space="md" rounded="$md" shadowRadius="$1"style={{minHeight: 300}}>
                                <Center  bg="$primary400" style={{minWidth: 200, minHeight: 50}}>
                                    <Text color="$white">{schedule.day}</Text>
                                    <Text color="white">{schedule.date.toDateString()}</Text>
                                </Center>
                                <VStack padding={10}>
                                    <ShiftCell workers={schedule.workers}></ShiftCell>
                                </VStack>
                            </VStack>
                        )
                    })}
                </HStack>
            </ScrollView>
            
        </View>
    )
}