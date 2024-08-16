import { PreferWorkdays } from "@/model/PreferWorkdays";
import { getBoardByUser, getCurrentMonth, updatePreferWorkday, updatePreferWorkdayOfCurrentMonth } from "@/service/ShiftBoardService";
import { Alert, AlertIcon, AlertText, Button,ButtonText, Card, Heading, InfoIcon, ScrollView, Text } from "@gluestack-ui/themed";
import type { DatePickerProps } from 'antd';
import { DatePicker, Flex } from 'antd';
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import React,{useEffect} from "react";
export default function MyPreferShift() {
    const [preferDates,setpreferDates] = React.useState<Dayjs[]>([]);
    const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);
    const [showErrorAlert,setShowErrorAlert] = React.useState(false);
    const [minDate,setMinDate] = React.useState<Dayjs>(dayjs().date(1));
    const [maxDate,setMaxDate] = React.useState<Dayjs>(dayjs().date(31))
    const onChange: DatePickerProps<Dayjs[]>['onChange'] = (date, dateString) => {
        console.log(date, dateString);
        setpreferDates(date)
    };
    const handle=()=>{
        let user = JSON.parse(localStorage.getItem("user") as string);
        if(user == undefined) return;
        let preferWorkdays = new PreferWorkdays()
        preferWorkdays.username = user.username;
        preferWorkdays.dates = preferDates;
        console.log("hello")
        console.log(preferDates)
        updatePreferWorkdayOfCurrentMonth(preferWorkdays).then(()=>{
            setShowSuccessAlert(true)
            setTimeout(()=>{setShowSuccessAlert(false)},10000)}
        ).catch(
            (error)=>{
                setShowErrorAlert(true);
                setTimeout(()=>{setShowErrorAlert(false)},10000)
                
            }
        );
    }
    function getCanadianHolidays() {
        return [
          dayjs("2024-01-01"), // New Year's Day
          dayjs("2024-02-19"), //Family Day
          dayjs("2024-03-29"), // Good Friday
          dayjs("2024-05-20"), //Victoria Day
          dayjs("2024-07-01"), // Canada Day
          dayjs("2024-08-05"), //British Columbia Day
          dayjs("2024-09-02"), // Labour Day 
          dayjs("2024-09-30"), //National Day for Truth and Reconciliation
          dayjs("2024-10-14"), // Thanksgiving 
          dayjs("2024-11-11"), //Remembrance Day
          dayjs("2024-12-25"), // Christmas Day
        ];
      }
    function disabledDate(current: Dayjs) {
        const holidays = getCanadianHolidays();
        return holidays.some(holiday => current.isSame(holiday, 'day'));
      }
    useEffect(()=>{
        let user = JSON.parse(localStorage.getItem("user") as string);
        if(user == undefined) return;
        getCurrentMonth().then(
            (data)=>{
                setMinDate(minDate.month(data-1));
                setMaxDate(maxDate.month(data-1).endOf("month"));
            }
        )
        getBoardByUser(user.username).then(
            
            (data)=>{
                setpreferDates(data.map((e) =>{
                    return dayjs(e);
                }))
            }
            
        )
    },[setpreferDates])
    
    return (
        <ScrollView>
            {showSuccessAlert?
            (<Alert mx="$2.5" action="success" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    Successfully postted!
                </AlertText>
            </Alert>):null}
            {
                showErrorAlert?
                (
                    <Alert mx="$2.5" action="error" variant="solid" >
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>
                    Failed!
                </AlertText>
            </Alert>
                ):null}
            <Card margin={3}>
                <Heading>
                    Please select your prefer workdays next month.
                </Heading>
                <Flex vertical gap="small">
                    <DatePicker
                        multiple
                        onChange={onChange}
                        maxTagCount="responsive"
                        size="large"
                        value={preferDates}
                        allowClear={false}
                        minDate={minDate}
                        maxDate={maxDate}
                        disabledDate={disabledDate}/>
                </Flex>
            </Card>
            <Card>
            <Heading>
                    After selection, please remember to click the submit button
            </Heading>
            <Button action="positive" margin={3} onPress={handle} w={"40%"}>
                    <ButtonText>
                        Submit
                    </ButtonText>
                </Button>
            </Card>
        </ScrollView>
    )
}