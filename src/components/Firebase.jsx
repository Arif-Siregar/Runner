import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
import "./Firebase.css";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig)

export default function Firebase(){
    const [loading, setLoading] = useState(false);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        isSupported().then(setSupported);
    }, []);

    async function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            throw new Error("Service workers not supported");
        }

        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        return registration;
    }


    async function getPushToken() { 
        const messaging = getMessaging(app);
        const swRegistration = await registerServiceWorker();
        
        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: swRegistration
        });
        if (!token) throw new Error("No token generated");
        return token;
    }

    async function requestNotificationPermission() {
        try{
            if (Notification.permission === "denied"){
                alert("Notifications are blocked in browser settings.");
                return;
            }

            if (Notification.permission !== "granted"){
                setLoading(true);
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    setLoading(false);
                    throw new Error("Notification permission denied");
                }
                
                const token = await getPushToken();
                const { error: dbError } = await supabase
                    .from("tokens")
                    .insert([{token: token}])
                
                if (dbError) {
                    setLoading(false);
                    return alert("Error uploading token: " + dbError.message);
                }
                setLoading(false);

            }

        } catch (err) {
            setLoading(false);
            console.error("Push setup failed:", err);
        }

    }
    if (!supported) return null;
    return (
        <button
            disabled={loading}
            className="notification-btn"
            onClick={requestNotificationPermission}
        >
            {loading? "Loading..." : "Accept notification"}
        </button>
    )
}
