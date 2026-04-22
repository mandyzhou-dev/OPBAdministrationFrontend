import { Card, Heading, HStack, VStack, BadgeText, Button, Text, View, Pressable } from "@gluestack-ui/themed"
import { Announcement } from "@/model/Announcement";
import moment from "moment";
import React, { useEffect } from "react";
import { router } from "expo-router";
interface AnnouncementCardProps {
    announcement: Announcement
    showOperation: boolean
    deleteAnnouncement: (id: number) => void
    modifyAnnouncement: (id: number) => void
    showMore: () => void
}
export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, showOperation, deleteAnnouncement, modifyAnnouncement, showMore }) => {

    //useEffect(()=>{})

    return (
        <Pressable
            onPress={() => router.navigate("/announcementDetail?announcementId=" + announcement.id)}
            overflow="hidden"
            $hover-bg="$secondary100"
        >

            <Card margin={3} width={360} >
                <Heading margin={3}>{announcement.title}</Heading>
                <HStack margin={3}>
                    <VStack w={"50%"}>
                        <Text>
                            {announcement.publisher}
                        </Text>
                    </VStack >
                    <VStack w={"50%"}>
                        <Text>
                            EXP:{announcement.expiryDate?moment(announcement.expiryDate).format("YYYY-MM-DD"):"Permanant"}
                        </Text>
                    </VStack>
                </HStack>
                {showOperation ? <HStack margin={3}>
                    <Button variant="solid" action="primary" w={"20%"} onPress={() => modifyAnnouncement(announcement.id ?? 0)}>
                        <BadgeText size="xs">Modify</BadgeText>
                    </Button>
                    <View w={"50%"}></View>
                    <Button variant="link" action="negative" w={"20%"} onPress={() => deleteAnnouncement(announcement.id ?? 0)}>
                        <BadgeText >Delete</BadgeText>
                    </Button>
                </HStack> : null}


            </Card>
        </Pressable>
    )
}