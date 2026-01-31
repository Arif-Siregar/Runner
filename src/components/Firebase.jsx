import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig)

export default function Firebase(){
    const messaging = getMessaging(app)
    async function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            throw new Error("Service workers not supported");
        }

        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        return registration;
    }


    async function getPushToken() { 
        const supported = await isSupported();
        if (!supported){
            throw new Error("Firebase messaging not supported in this browser");
        }
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
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {throw new Error("Notification permission denied")};
                
                const token = await getPushToken();
                console.log(token);
            }

        } catch (err) {
            console.error("Push setup failed:", err);
        }

    }

    return (
        <button
            onClick={requestNotificationPermission}
        >
            Accept notification
        </button>
    )
}
