import { HStack, ScrollView, View } from "@gluestack-ui/themed";
import React, { useEffect } from "react";
import { ReviewOfApplicationCard } from "@/components/applications/ReviewOfApplicationCard"
import { LeaveApplication } from "@/model/LeaveApplication";
import { DeviceEventEmitter } from "react-native";
import { getReviewApplicationByHandler } from "@/service/ApplicationService";
import moment from "moment";
import { ReviewModal } from "@/components/applications/ReviewModal";
import { ResignationApplication } from "@/model/ResignationApplication";
import { getAllResignations } from "@/service/ResignationApplicationService";
import { ReviewOfResignationCard } from "@/components/applications/ReviewOfResignationCard";
import dayjs from "dayjs";
export default function ResigReq() {

    const [resignationList, setResignationList] = React.useState<ResignationApplication[]>([])
    const [currentApplication, setCurrentApplication] =React.useState<ResignationApplication>(new ResignationApplication())
    const [refreshCount, setRefreshCount] = React.useState(0)
    const [showModal,setShowModal] = React.useState(false);
    const callModals=(resignation:ResignationApplication)=>{
        console.log("clicked")
        setCurrentApplication(resignation);
        setShowModal(true);
    }
    let listener = null;
    useEffect(() => {
        let user = JSON.parse(localStorage.getItem("user") as string);
        if (user == null) {
            listener = DeviceEventEmitter.addListener('userlogin', () => {
                setRefreshCount(refreshCount + 1)
            })
            return;
        }
        if (user.roles == 'Manager') {
            getAllResignations().then(
                (data) => {
                    //console.log(JSON.stringify(data))
                    setResignationList(data)
                }).catch(
                    (error) => {
                        console.log((error as Error).message)
                    }
                )
        }

    }, [refreshCount])
    const onUpdated=()=>{
        setRefreshCount(refreshCount+1);
    }
    return (
        <ScrollView>
            <HStack flexWrap="wrap">
                {
                    resignationList.map((resignation) => {
                        return (
                            <div key={resignation.id}>
                                <ReviewOfResignationCard key={resignation.id} name={resignation.applicant}
                                    submittedAt={dayjs(resignation.submittedAt).format("YYYY-MM-DD HH:mm")}
                                    lastWorkingDay={resignation.lastWorkingDay}
                                    reason={resignation.reason} 
                                    status={resignation.status}
                                    onClick={()=>callModals(resignation)}/>
                            </div>
                        )
                    }
                    )            
                }
                
            </HStack>

        </ScrollView>
    )
}