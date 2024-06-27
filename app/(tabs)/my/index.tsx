import { DeviceEventEmitter, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import * as UserService from '@/service/UserService';
import {Login} from '@/components/Login';
import {Profile} from '@/components/Profile';
import { router } from 'expo-router';
import { ScrollView } from '@gluestack-ui/themed';

export default function MyScreen() {

    const [showLogin, setShowLogin]=useState(true)
    useEffect(()=>{
        
        const items = JSON.parse(localStorage.getItem('user') as string);

        if(items){
            setShowLogin(false)
            console.log(items)
        }
        else setShowLogin(true);
        
    },[showLogin]);
    return (
        <ScrollView style={styles.container}>
            <View style={styles.container}>
                <View style={styles.separator} >
                    {showLogin?<Login onLogined={() => {
                        setShowLogin(false)
                        DeviceEventEmitter.emit("userlogin", "logined")
                        router.navigate("")
                    }}></Login>:<Profile></Profile>}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#92a8d1",
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 50,
        height: 0,
        width: '100%',
        //alignItems:'center'
    },
});