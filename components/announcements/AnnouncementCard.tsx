import { Card, Heading, HStack, VStack, BadgeText, Button, Text, View} from "@gluestack-ui/themed"
import { Announcement } from "@/model/Announcement";
import moment from "moment";
import React from "react";
interface AnnouncementCardProps {
    announcement: Announcement
    showOperation:boolean
    deleteAnnouncement:(id:number)=>void
    modifyAnnouncement:(id:number)=>void
}
export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement,showOperation,deleteAnnouncement,modifyAnnouncement}) => {
   


    return (
        <Card margin={3} width={360}>
            <Heading margin={3}>{announcement.title}</Heading>
            <HStack margin={3}>
                <VStack w={"50%"}>
                    <Text>
                        {announcement.publisher}
                    </Text>
                </VStack >
                <VStack w={"50%"}>
                    <Text>
                        EXP:{moment(announcement.expiryDate?.toString()).format("YYYY-MM-DD")}
                    </Text>
                </VStack>
            </HStack>
            <VStack>
                <Text margin={3} bold>
                    {announcement.content}
                </Text>
            </VStack>
            {showOperation?<HStack >
                <Button variant="solid" action="primary" w={"20%"} onPress={()=>modifyAnnouncement(announcement.id)}>
                    <BadgeText >Modify</BadgeText>
                </Button>
                <View w={"50%"}></View>
                <Button variant="link" action="negative" w={"20%"} onPress={()=>deleteAnnouncement(announcement.id)}>
                    <BadgeText >Delete</BadgeText>
                </Button>
            </HStack>:null}
            

        </Card>
    )
}