importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAgnQbbhuWsVqe11d8LHhElBEGN2i-Xhmk",
  authDomain: "runner-629c5.firebaseapp.com",
  projectId: "runner-629c5",
  storageBucket: "runner-629c5.firebasestorage.app",
  messagingSenderId: "317634121562",
  appId: "1:317634121562:web:06b46d32bb50256da8ad63",
  measurementId: "G-NJYSFJS639"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/pwa-192x192.png'
  });
});