import { MenuItem } from "@/components/FreeStyle/MenuItem";
import { GlobeIcon, HStack } from "@gluestack-ui/themed";
import { Pressable, View, Text, Card, Icon } from "@gluestack-ui/themed";
import { router } from "expo-router";

export default function ApplicationScreen() {
    return (
        <View>
            <MenuItem text="New Application" onPress={()=>{router.navigate("/applications/NewApplication")}}></MenuItem>
            <MenuItem text="My Applications" onPress={()=>{router.navigate("/applications/MyApplications")}}></MenuItem>
            <MenuItem text="Review Applications" onPress={()=>{console.log("hello")}}></MenuItem>
            <MenuItem text="History" onPress={()=>{console.log("hello")}}></MenuItem>

        </View>
    )
}