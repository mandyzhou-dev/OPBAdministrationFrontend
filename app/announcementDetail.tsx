import { getAnnouncementById, readAnnouncement } from "@/service/AnnouncementService";
import { Card, ScrollView, Heading, VStack, Text, HStack } from "@gluestack-ui/themed";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import announcement from "./announcement";
import { Announcement } from "@/model/Announcement";
import moment from "moment";

export default function AnnouncementDetail() {
    const params = useLocalSearchParams();
    const [announcement, setAnnouncement] = React.useState<Announcement>(new Announcement());
    useEffect(
        () => {
            getAnnouncementById(parseInt(params.announcementId)).then(
                (data) => {
                    setAnnouncement(data);
                }
            ).catch(
                (error) => {
                    console.log((error as Error).message)
                }
            )

            let user = JSON.parse(localStorage.getItem('user') as string);

            let announcementReadLog = {
                reader: user.username
            }
            readAnnouncement(announcement.id ?? 0, announcementReadLog);
        }

    )
    return (
        
            <ScrollView>
<Card margin={3}>
                <Heading >{announcement.title}</Heading>
                <HStack marginBottom={3}>
                    <VStack w={"50%"}>
                        <Text color="gray" size="xs">
                            {announcement.publisher}
                        </Text>
                    </VStack >
                    <VStack w={"50%"}>
                        <Text color="gray" size="xs">
                            EXP:{moment(announcement.expiryDate?.toString()).format("YYYY-MM-DD")}
                        </Text>
                    </VStack>
                </HStack>
                <VStack marginTop={10}>
                    <Text>
                        {announcement.content}
                    </Text>
                </VStack>
                </Card>
            </ScrollView>
        
    )
}