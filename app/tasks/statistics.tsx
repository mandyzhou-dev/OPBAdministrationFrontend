import { View } from "@/components/Themed";
import { ScrollView, Heading ,Divider, VStack,Card} from "@gluestack-ui/themed";
import { StyleSheet } from 'react-native';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import React from "react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from "dayjs";
import "react-datepicker/dist/react-datepicker.css";
import { WorkTimeStatisticList } from "@/components/statistics/WorkTimeStatisticList";
export default function statistics() {
    const [startDate,setStartDate] = React.useState<Dayjs|null>(dayjs())
    const [endDate,setEndDate] = React.useState<Dayjs|null>(dayjs())

    return (
        <ScrollView>
            <View style={styles.container}>

                <Heading alignSelf="center" size="xl">Search</Heading>
                <Heading>Date Range</Heading>
                <Divider my="$1.5" />
                <Card margin={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs} >
                    {<DatePicker
                    label="FROM"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                    />}
                </LocalizationProvider>
                </Card>
                
                <Card margin={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {<DatePicker
                    label="TO"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                    />}
                </LocalizationProvider>
                </Card>

                <WorkTimeStatisticList
                start={startDate?.toDate()}
                end={endDate?.toDate()}
                ></WorkTimeStatisticList>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 10,
        height: 1,
        width: '80%',
    },
});