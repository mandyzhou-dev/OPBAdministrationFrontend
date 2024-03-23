import { DeviceEventEmitter, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { ScheduleTable } from '@/components/shift/ScheduleTable';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect } from 'react';

export default function TabOneScreen() {

  const [refreshCount, setRefreshCount] = React.useState(0)
  let listener = null;
  useEffect(() =>{
    

  })

  useFocusEffect(
    
    React.useCallback(() =>{
      setRefreshCount(refreshCount+1)
      let user = JSON.parse(localStorage.getItem("user"))
      if(user == null){
        router.navigate('my')
      }
    },[])
  )
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule</Text>
      <ScheduleTable ></ScheduleTable>
    </View>
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
