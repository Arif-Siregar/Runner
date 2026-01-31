import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

export default function Firebase(){
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    const app = initializeApp(firebaseConfig)
    const messaging = getMessaging(app)

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        return registration;
    }


    async function getPushToken() {
        const swRegistration = await registerServiceWorker();
        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: swRegistration
        });

        if (!token) throw new Error("No token generated");
        return token;
    }

    async function requestNotificationPermission() {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            throw new Error("Notification permission denied");
        }

        const token = await getPushToken();
        console.log(token);
    }

    return (
        <button
            onClick={requestNotificationPermission}
        >
            Accept notification
        </button>
    )
}
