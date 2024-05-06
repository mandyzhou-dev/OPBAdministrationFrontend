import { DeviceEventEmitter, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { ScheduleTable } from '@/components/shift/ScheduleTable';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView } from '@gluestack-ui/themed';
import {getUnreadListByReader } from '@/service/AnnouncementService';
import { UnreadModal } from '@/components/announcements/UnreadModal';
export default function TabOneScreen() {
  //const [showCurrentAnnouncement,setShowCurrentAnnouncement] = React.useState<Announcement[]>([]);
  const [refreshCount, setRefreshCount] = React.useState(0)
  const [showModal,setShowModal] = React.useState(false);
  const [unreadList , setUnreadList] = React.useState<number[]>([]);
  let listener = null;
  /*useEffect(() => {
    getAnnouncementByAfter(new Date()).then(
      (data)=>{
          setShowCurrentAnnouncement(data);
      }
  ).catch(
      (error) => {
          console.log((error as Error).message)
      }
  )
  },[])*/

  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user") as string);
    if(user == undefined)
      return;

    /*alert(user.active)
    alert(user.email)
    if(user.active!==1){
      alert(user.active)
      localStorage.removeItem("user")
      return;
    }*/
      
    getUnreadListByReader(user.username).then(
      (data)=>{
          setUnreadList(data);
          console.log(data)
          if(data.length==0){
            setShowModal(false);
          }
          else{
            setShowModal(true);
          }
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
      let user = JSON.parse(localStorage.getItem("user") as string)
      if (user == null) {
        router.navigate('my')
      }
    }, [])
  )
        
  return ( 
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Schedule</Text>
        
        <ScheduleTable ></ScheduleTable>
        {showModal?<UnreadModal count={unreadList.length}></UnreadModal>:null}

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
