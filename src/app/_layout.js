import AppProviders from '@/contexts';
import {Slot} from 'expo-router';
import React, {useEffect} from 'react';
import "../global.css";
// import '@react-native-firebase/app';
// import messaging from '@react-native-firebase/messaging';

export default function RootLayoutRoute() {

    // async function requestUserPermission() {
    //     const authStatus = await messaging().requestPermission();
    //     const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    //
    //     if (enabled) {
    //         console.log('Authorization status:', authStatus);
    //     }
    // }
    //
    // const getToken = async () => {
    //     const token = await messaging().getToken();
    //     console.log("Token: ", token);
    // }

    useEffect(() => {
        console.log("App mounted");
    }, []);

    return (<AppProviders>
        <Slot/>
    </AppProviders>);
}