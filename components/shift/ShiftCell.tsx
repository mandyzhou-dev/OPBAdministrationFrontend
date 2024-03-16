import React, { useEffect, useState } from "react"
import { Badge, BadgeText, InfoIcon, BadgeIcon, VStack, HStack} from "@gluestack-ui/themed"
import { TextInput, View } from "react-native"
import { User } from "@/model/User";
import { Schedule } from "@/model/Schedule";
import moment from "moment";
import { TimePickerModal } from "react-native-paper-dates";
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { ShiftDetailModal } from "./ShiftDetailModal";
import {Shift} from "@/model/Shift"
interface ShiftCellProps {
    workers: User[];
    shifts: Map<string, Shift>;
    onUpdated:Function;
}

export const ShiftCell: React.FC<ShiftCellProps> = ({ workers, shifts,onUpdated }) => {
    const [currentShift, setCurrentShift] = React.useState(new Shift())
    const [showModal, setShowModal] = React.useState(false)



    const callModals=(currentShift:Shift)=>{
        console.log("cliked")
        try{
            const items = JSON.parse(localStorage.getItem("user")).roles;
            if(items=="Manager") {
            setCurrentShift(currentShift)
            setShowModal(true);
        }}catch(error){
        }
    }

    return (
        <View>
            <VStack space="md">
                {workers.map((worker) => {
                    return (
                        <div key={worker.username} onClick={()=>callModals(shifts.get(worker.username))}>
                            <Badge key={worker.username} size="md" variant="solid" action="success" h={"$10"} >
                                <VStack >
                                    <HStack>
                                        <BadgeIcon as={InfoIcon} mr="$2" />
                                        <BadgeText>{worker.name}</BadgeText>
                                    </HStack>
                                    <BadgeText>{moment(shifts.get(worker.username ? worker.username : "")?.start ?? "").format("HH:mm")}-
                                        {moment(shifts.get(worker.username ? worker.username : "")?.end ?? "").format("HH:mm")}
                                    </BadgeText>
                                </VStack>
                                <ShiftDetailModal currentShift={currentShift} showModal={showModal} setShowModal={setShowModal} onClose={onUpdated}>
                                </ShiftDetailModal>
                            </Badge>
                        </div>


                    )
                })}
            </VStack>
        </View>
    )
}