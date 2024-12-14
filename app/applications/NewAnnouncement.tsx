import { InfoIcon,Alert, AlertIcon, AlertText,Card, Heading, Input, InputField, HStack, ScrollView, Text, Textarea,TextareaInput,Button,ButtonText, RadioGroup, Radio, RadioIndicator, RadioIcon, CircleIcon, RadioLabel} from "@gluestack-ui/themed";
import moment from "moment";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import React, { useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { postAnnouncement } from "@/service/AnnouncementService";

export default function History() {
    const [date, setDate] = React.useState<Dayjs | null>(dayjs());
    const [title,setTitle] = React.useState("");
    const [content,setContent] = React.useState("");
    //new
    const [groupName, setGroupName] = React.useState("");

    const [showSuccessAlert,setShowSuccessAlert] = React.useState(false);
    const [showErrorAlert,setShowErrorAlert] = React.useState(false);

    const submit=()=>{
        let username = JSON.parse(localStorage.getItem("user") as string).username
        let result = {
            title: title,
            content: content,
            expiryDate:date,
            groupName:groupName,
            publisher:username
        }
        console.log(result);
        postAnnouncement(result).then(()=>{
            setShowSuccessAlert(true)
            setTimeout(()=>{setShowSuccessAlert(false)},10000)}
        ).catch(
            (error)=>{
                console.log(error)
                setShowErrorAlert(true);
                setTimeout(()=>{setShowErrorAlert(false)},10000)
                
            }
        );
    }
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
                <Heading>Title:</Heading>
                <Input
                    variant="outline"
                    size="md"
                    
                >
                    <InputField placeholder="Enter The title of new announcement" onChangeText={(value)=>setTitle(value)}/>
                </Input>

                <Heading>ExpiryDate:</Heading>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {<DatePicker
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                    />}
                </LocalizationProvider>
                </Card>
                <Card margin={3}>
                <Heading>Visibility:</Heading>
                <RadioGroup value={groupName} onChange={(d) => setGroupName(d)}>
    <HStack space="2xl">
        <Radio value="surrey" size="md">
            <RadioIndicator>
                <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel>surrey</RadioLabel>
        </Radio>
        <Radio value="coquitlam" size="md">
            <RadioIndicator>
                <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel>coquitlam</RadioLabel>
        </Radio>
        <Radio value="public" size="md">  {/* 新增的all选项 */}
            <RadioIndicator>
                <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel>public</RadioLabel>
        </Radio>
    </HStack>
</RadioGroup>

                
            </Card>
            <Card margin={3} height="100%">
            <Heading>Content:</Heading>
                <Textarea
                    size="md"
                    w="80%"
                    height="80%"
                >
                    <TextareaInput placeholder="The content of announcement..." onChangeText={(value)=>setContent(value)}/>
                </Textarea>
            </Card>
            <Button
                onPress={() => {
                    submit()
                }}
                margin={"$3"}

            >
                <ButtonText >Post now!</ButtonText>
            </Button>

        </ScrollView>
    )
}