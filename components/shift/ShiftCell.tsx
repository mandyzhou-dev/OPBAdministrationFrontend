import React, { useEffect, useState } from "react"
import { Badge, BadgeText, InfoIcon, BadgeIcon, VStack, HStack } from "@gluestack-ui/themed"
import { TextInput, View } from "react-native"
import { User } from "@/model/User";
import { Schedule } from "@/model/Schedule";
import moment from "moment";
import { TimePickerModal } from "react-native-paper-dates";
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { ShiftDetailModal } from "./ShiftDetailModal";
import { Shift } from "@/model/Shift"
import { useAuth } from "@/util/useAuth";
import {
    normalizeShiftStatus,
    SHIFT_STATUS_COLORS,
    SHIFT_STATUS_TEXT_COLORS
} from "@/constants/ShiftStatus";
interface ShiftCellProps {
    workers: User[];
    shifts: Map<string, Shift>;
    onUpdated: Function;
}

export const ShiftCell: React.FC<ShiftCellProps> = ({ workers, shifts, onUpdated }) => {
    const { canEdit } = useAuth();
    const [currentShift, setCurrentShift] = React.useState(new Shift())
    const [showModal, setShowModal] = React.useState(false)



    const callModals = (currentShift: Shift | undefined) => {
        if (currentShift && canEdit) {
            try {
                    setCurrentShift(currentShift)
                    setShowModal(true);
                } catch (error) {
            }
        }

    }

    return (
        <View>
            <VStack space="md">
                {workers.map((worker) => {
                    const workerShift = shifts.get(worker.username ?? "");
                    const shiftStatus = normalizeShiftStatus(workerShift?.status);
                    const statusBackgroundColor = SHIFT_STATUS_COLORS[shiftStatus];
                    const statusTextColor = SHIFT_STATUS_TEXT_COLORS[shiftStatus];
                    return (
                        <div key={worker.username} onClick={() => callModals(shifts.get(worker.username ?? ""))}>
                            <Badge
                                key={worker.username}
                                size="md"
                                variant="solid"
                                action={worker.groupName=="surrey"?"success":"warning"}
                                h={"$10"}
                                style={statusBackgroundColor ? { backgroundColor: statusBackgroundColor } : undefined}
                            >
                                <VStack >
                                    <HStack>
                                        <BadgeIcon as={InfoIcon} mr="$2" />
                                        <BadgeText style={statusTextColor ? { color: statusTextColor } : undefined}>{worker.name}</BadgeText>
                                    </HStack>
                                    <BadgeText style={statusTextColor ? { color: statusTextColor } : undefined}>{moment(workerShift?.start ?? "").format("HH:mm")}-
                                        {moment(workerShift?.end ?? "").format("HH:mm")}
                                    </BadgeText>
                                </VStack>

                            </Badge>
                        </div>
                    )
                })}
            </VStack>
            <ShiftDetailModal currentShift={currentShift} showModal={showModal} setShowModal={setShowModal} onClose={onUpdated}>
            </ShiftDetailModal>
        </View>
    )
}
