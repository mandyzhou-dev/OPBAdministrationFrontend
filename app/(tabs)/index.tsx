import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { ScheduleTable } from '@/components/shift/ScheduleTable';
import { useFocusEffect } from 'expo-router';
import React from 'react';

export default function TabOneScreen() {

  const [refreshCount, setRefreshCount] = React.useState(0)
  
  useFocusEffect(
    React.useCallback(() =>{
      setRefreshCount(refreshCount+1)
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
