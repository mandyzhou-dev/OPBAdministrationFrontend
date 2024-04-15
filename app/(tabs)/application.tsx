import { MenuItem } from "@/components/FreeStyle/MenuItem";
import { View } from "@gluestack-ui/themed";
import { router } from "expo-router";
import {User} from "@/model/User"
import React, { useEffect } from "react";

export default function ApplicationScreen() {
    const [showReview,setShowReview] = React.useState(false);
    const [showHistory,setShowHistory] = React.useState(false);
    useEffect(()=>{
        let user = localStorage.getItem("user") as User | null
        if(user!=null && user.roles=='Manager'){
            setShowHistory(true);
            setShowReview(true);

        }
        else
            //setShowReview(false);
            setShowHistory(false);
    })
    return (
        <View>
            <MenuItem text="New Application" onPress={()=>{router.navigate("/applications/NewApplication")}}></MenuItem>
            <MenuItem text="My Applications" onPress={()=>{router.navigate("/applications/MyApplications")}}></MenuItem>
            {showReview?<MenuItem text="Review Applications" onPress={()=>{router.navigate("/applications/ReviewApplications")}}></MenuItem>:null}
            {showHistory?<MenuItem text="History" onPress={()=>{router.navigate("/applications/History")}}></MenuItem>:null}

        </View>
    )
}