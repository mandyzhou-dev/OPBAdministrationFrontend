import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import * as UserService from '@/service/UserService';
import {Login} from '@/components/Login';
import {Profile} from '@/components/Profile page';

export default function MyScreen() {

    const [showLogin, setShowLogin]=useState(true)
    useEffect(()=>{
        const items = JSON.parse(localStorage.getItem('user'));
        if(items){
            setShowLogin(false)
            console.log(items)
        }
    },[showLogin]);
    return (
        <View style={styles.container}>
            <View style={styles.separator} >
                {showLogin?<Login onLogined={() => setShowLogin(false)}></Login>:<Profile></Profile>}
            </View>
        </View>
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
        width: '90%',
        //alignItems:'center'
    },
});