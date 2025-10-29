import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, router } from 'expo-router';
import { Pressable } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { View ,Text} from '@gluestack-ui/themed';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const [isManager, setIsManager] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") as string);
    if (user) {
      setIsLoggedIn(true);
      setIsManager(user.roles?.toLowerCase() === 'manager');
    } else {
      setIsLoggedIn(false);
      setIsManager(false);
    }
  }, );
  // FIXME: useEffect runs on every render because dependency array is omitted; optimize later

  const colorScheme = useColorScheme();

  return (
    <>
    {isManager?"":<View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          backgroundColor: '#f9fafb',
          borderTopWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        <Text style={{ color: '#2563eb', fontSize: 13 }}>
          IT Support: mandychou98@outlook.com
        </Text>
    </View>}
    
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
          href:isLoggedIn?"":null,
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerRight: () => (
            <Link href="/announcement" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons 
                  name="notifications" 
                  size={24} 
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
          href:isManager?"two":null,
          tabBarIcon: ({ color }) => <TabBarIcon name="edit" color={color} />,
        }}
      />
      <Tabs.Screen
        name="target"
        options={{
          title: 'KPI',
          href:isLoggedIn?'target':null,
          tabBarIcon: ({ color }) => <FontAwesome name="bar-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="application"
        options={{
          title:'Application',
          href:isLoggedIn?"application":null,
          tabBarIcon: ({ color }) => <Entypo size={28} name="documents" color={color} />,
        }}
      />
    <Tabs.Screen
        name="team"
        options={{
          title: 'Team',
          href:isManager?"team":null,
          tabBarIcon: ({ color }) => <AntDesign name="team" size={24} color={color} />,
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

    
        
      </>
    
  );
}
