import React from "react"
import { Text, Badge, BadgeText,InfoIcon, BadgeIcon, VStack } from "@gluestack-ui/themed"
import { View } from "react-native"
import { User } from "@/model/User";

interface ShiftCellProps {
    workers: User[];
}

export const ShiftCell: React.FC<ShiftCellProps> = ({workers}) => {
    return (
        <View>
            <VStack space="md">
            {workers.map((worker) =>{
                return (
                    
                        <Badge key={worker.username} size="md" variant="solid" action="success" h={"$10"}>
                            <BadgeIcon as={InfoIcon} mr="$2" />
                            <BadgeText>{worker.realname}</BadgeText>
                        </Badge>
                    
                )
            })}
            </VStack>
        </View>
    )
}