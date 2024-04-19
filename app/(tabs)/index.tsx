import { DeviceEventEmitter, StyleSheet } from 'react-native';
import { Textarea, Heading } from '@gluestack-ui/themed'
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { ScheduleTable } from '@/components/shift/ScheduleTable';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect } from 'react';
import { Card, ScrollView } from '@gluestack-ui/themed';
import { Statistic } from '@/components/statistics/WorkTimeStatisticItem';
import { Statistics } from '@/components/statistics/WorkTimeStatisticList';
import { Announcement } from "@/model/Announcement";
import { getAnnouncementByAfter } from '@/service/AnnouncementService';
export default function TabOneScreen() {
  const [showCurrentAnnouncement,setShowCurrentAnnouncement] = React.useState<Announcement[]>([]);
  const [refreshCount, setRefreshCount] = React.useState(0)
  let listener = null;
  useEffect(() => {
    getAnnouncementByAfter(new Date()).then(
      (data)=>{
          setShowCurrentAnnouncement(data);
      }
  ).catch(
      (error) => {
          console.log((error as Error).message)
      }
  )
  },[])

  useFocusEffect(
    React.useCallback(() => {
      setRefreshCount(refreshCount + 1)
      let user = JSON.parse(localStorage.getItem("user"))
      if (user == null) {
        router.navigate('my')
      }
    }, [])
  )
        
  return (
    <ScrollView >
      <View style={styles.container}>
        <Text style={styles.title}>Schedule</Text>
        <Heading size="xs" color="rose50">
          Latest announcement:{showCurrentAnnouncement[0] ? showCurrentAnnouncement[0].title : "loading"}
        </Heading>
        <Textarea>

          {showCurrentAnnouncement[0] ? showCurrentAnnouncement[0].content : "loading"}
        </Textarea>
        <ScheduleTable ></ScheduleTable>

      </View>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
