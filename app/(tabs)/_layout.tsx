import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, router } from 'expo-router';
import { Pressable } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import {User} from '@/model/User'

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const [showAssignment, setShowAssignment]= useState(false);
  const [showSchedule,setShowSchedule] = useState(false);
  const [showApplication,setShowApplication] = useState(false);
  useEffect(()=>{
    let user = JSON.parse(localStorage.getItem("user") as string)
    if(user){
      setShowSchedule(true)
      setShowApplication(true)
      if(user != null && user.roles=='Manager')
        setShowAssignment(true)
    }
    else{
      setShowAssignment(false);
      setShowSchedule(false);
    }
  },);
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        tabBarLabelPosition:'below-icon'
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Schedule',
          href:showSchedule?"":null,
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Assignment',
          href:showAssignment?"two":null,
          tabBarIcon: ({ color }) => <TabBarIcon name="edit" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="application"
        options={{
          title:'Application',
          href:showApplication?"application":null,
          tabBarIcon: ({ color }) => <Entypo size={28} name="documents" color={color} />,
        }}
      />

<Tabs.Screen
        name="my"
        options={{
          title:'My',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
          href:'my'
        }}
      />
    </Tabs>
    
  );
}
