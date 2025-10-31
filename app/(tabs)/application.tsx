import { MenuItem } from "@/components/FreeStyle/MenuItem";
import { Divider, GlobeIcon, HStack } from "@gluestack-ui/themed";
import { Pressable, View, Text, Card, Icon } from "@gluestack-ui/themed";
import { router } from "expo-router";
import {User} from "@/model/User"
import React, { useEffect, useState } from "react";

export default function ApplicationScreen() {
      const [isManager, setIsManager] = useState(false);
      useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") as string);
        if (user) {
          setIsManager(user.roles?.toLowerCase() === 'manager');
        } else {
            router.navigate("/my"); 
            return;
        }
      });

    return (
        <View>
            {isManager?null:<MenuItem text="Request Time Off" onPress={()=>{router.navigate("/applications/NewApplication")}}></MenuItem>}
            {isManager?null:<MenuItem text="My Applications" onPress={()=>{router.navigate("/applications/MyApplications")}}></MenuItem>}
            {isManager?<MenuItem text="Time Off Requests" onPress={()=>{router.navigate("/applications/ReviewApplications")}}></MenuItem>:null}
            {isManager?<MenuItem text="History" onPress={()=>{router.navigate("/applications/History")}}></MenuItem>:null}

            <Divider my="$2.5" />
            {isManager?<MenuItem text="Resignation Requests" onPress={()=>{router.navigate("/applications/ResigReq")}}></MenuItem>:null}
            {isManager?null:<MenuItem text="Submit a Resignation" onPress={()=>{router.navigate("/applications/NewResignation")}}></MenuItem>}

            <Divider my="$2.5" />
            {isManager?<MenuItem text="Post new announcement" onPress={()=>{router.navigate("/applications/NewAnnouncement")}}></MenuItem>:null}
            <MenuItem text="Regulations" onPress={()=>{router.navigate("/applications/Regulations")}}></MenuItem>

            <Divider my="$2.5" />
            {isManager?null:<MenuItem text="Select my prefer workdate" onPress={()=>{router.navigate("/applications/MyPreferShift")}}></MenuItem>}
        </View>
    )
}