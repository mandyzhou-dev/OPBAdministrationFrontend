
import { getKPIByDateAndGroup } from "@/service/ShiftService";
import { Card, HStack, Heading, ScrollView, Text, View } from "@gluestack-ui/themed";
import dayjs from "dayjs";
import { useEffect, useState } from "react";


export default function target() {
    const [TVNumber, setTVNumber] = useState(0);
    useEffect(()=>{
        getKPIByDateAndGroup("surrey",dayjs()).then(
            
            (data)=>{
                setTVNumber(data.target??0);
                console.log(dayjs())
            }
        ).catch(
            (error) => {
                console.log((error as Error).message)
            }
        )
    })
    return (
        <ScrollView>
            <Card mr={3}>
                <Heading>TV Target today</Heading>
                <HStack w="20%">
                    <Text size="6xl">{TVNumber}</Text>
                    <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                        <Text >units</Text>
                    </View>

                </HStack>

            </Card>
        </ScrollView>
    )
}
