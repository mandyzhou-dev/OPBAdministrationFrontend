import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { SelectShiftFrom } from '@/components/shift/SelectShiftForm';
import { useEffect, useState } from 'react';

export default function TabTwoScreen() {

    
  return (
    <View style={styles.container}>
      <View style={styles.separator}>
            <SelectShiftFrom></SelectShiftFrom>
      </View>
      
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
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: '80%',
  },
});
