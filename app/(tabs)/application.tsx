import { MenuItem } from "@/components/FreeStyle/MenuItem";
import { Divider, GlobeIcon, HStack } from "@gluestack-ui/themed";
import { Pressable, View, Text, Card, Icon } from "@gluestack-ui/themed";
import { router } from "expo-router";
import {User} from "@/model/User"
import React, { useEffect } from "react";

export default function ApplicationScreen() {
    const [showReview,setShowReview] = React.useState(false);
    const [showHistory,setShowHistory] = React.useState(false);
    const [showPostAnnouncement,setShowPostAnnouncement] = React.useState(false);
    useEffect(()=>{
        let user = JSON.parse(localStorage.getItem("user")as string)
        if(user!=null && user.roles=='Manager'){
            setShowHistory(true);
            setShowReview(true);
            setShowPostAnnouncement(true);

        }
        else
            //setShowReview(false);
            setShowHistory(false);
    })
    return (
        <View>
            <MenuItem text="New Leave Application" onPress={()=>{router.navigate("/applications/NewApplication")}}></MenuItem>
            <MenuItem text="My Applications" onPress={()=>{router.navigate("/applications/MyApplications")}}></MenuItem>
            {showReview?<MenuItem text="Review Applications" onPress={()=>{router.navigate("/applications/ReviewApplications")}}></MenuItem>:null}
            {showHistory?<MenuItem text="History" onPress={()=>{router.navigate("/applications/History")}}></MenuItem>:null}
            <Divider my="$2.5" />
            {showPostAnnouncement?<MenuItem text="Post new announcement" onPress={()=>{router.navigate("/applications/NewAnnouncement")}}></MenuItem>:null}
            <MenuItem text="Regulations" onPress={()=>{router.navigate("/applications/Regulations")}}></MenuItem>
            <Divider my="$2.5" />
            <MenuItem text="Select my prefer workdate" onPress={()=>{router.navigate("/applications/MyPreferShift")}}></MenuItem>
        </View>
    )
}