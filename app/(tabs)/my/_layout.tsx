import { Stack } from 'expo-router/stack';
import Colors from '@/constants/Colors';
import { Link, Tabs } from 'expo-router';
export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ 
        headerShown: false ,
        
        }} />
    </Stack>
  );
}