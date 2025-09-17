import { PreferWorkdays } from "@/model/PreferWorkdays";
import { getBoardByUser, getCurrentMonth, updatePreferWorkday, updatePreferWorkdayOfCurrentMonth } from "@/service/ShiftBoardService";
import { getStatutoryHolidays } from "@/service/StatutoryHolidayService";
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
    const [statutoryHolidays,setStatutoryHolidays] = React.useState<dayjs.Dayjs[]>([])
    const onChange: DatePickerProps<Dayjs[]>['onChange'] = (date, dateString) => {
        setpreferDates(date)
    };
    const handle=()=>{
        let user = JSON.parse(localStorage.getItem("user") as string);
        if(user == undefined) return;
        let preferWorkdays = new PreferWorkdays()
        preferWorkdays.username = user.username;
        preferWorkdays.dates = preferDates;
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

    function disabledDate(current: Dayjs) {
        return statutoryHolidays.some(holiday => current.isSame(holiday, 'day'));
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
        getStatutoryHolidays().then(
            (data) => {
                setStatutoryHolidays(data.map(date => dayjs(date)))
            }).catch(
                (error) => {
                    console.log((error as Error).message)
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