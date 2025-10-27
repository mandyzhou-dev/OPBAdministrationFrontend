import { HStack, ScrollView, View } from "@gluestack-ui/themed";
import React, { useEffect } from "react";
import { ReviewOfApplicationCard } from "@/components/applications/ReviewOfApplicationCard"
import { LeaveApplication } from "@/model/LeaveApplication";
import { DeviceEventEmitter } from "react-native";
import { getReviewApplicationByHandler } from "@/service/ApplicationService";
import moment from "moment";
import { ReviewModal } from "@/components/applications/ReviewModal";
export default function ReviewApplications() {

    const [applicationList, setApplicationList] = React.useState<LeaveApplication[]>([])
    const [currentApplication, setCurrentApplication] =React.useState<LeaveApplication>(new LeaveApplication())
    const [refreshCount, setRefreshCount] = React.useState(0)
    const [showModal,setShowModal] = React.useState(false);
    const callModals=(application:LeaveApplication)=>{
        console.log("clicked")
        setCurrentApplication(application);
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
            getReviewApplicationByHandler(user.username).then(
                (data) => {
                    //console.log(JSON.stringify(data))
                    setApplicationList(data)
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
                    applicationList.map((application) => {
                        return (
                            <div key={application.id}>
                                <ReviewOfApplicationCard key={application.id} name={application.applicant}
                                    leaveType={application.leaveType}
                                    start={moment(application.start).format("YYYY-MM-DD HH:mm")}
                                    end={moment(application.end).format("YYYY-MM-DD HH:mm")}
                                    reason={application.reason} 
                                    onClick={()=>callModals(application)}/>
                                
                            </div>
                        )
                    }
                    )            
                }
                <ReviewModal currentApplication={currentApplication} showModal={showModal} setShowModal={setShowModal} onClose={()=>{setShowModal(false);onUpdated()}}>
                </ReviewModal>
            </HStack>

        </ScrollView>
    )
}