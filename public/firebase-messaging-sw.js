/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCrp_3Wjq_wnXrTh5zjkk6Ggms9BKoI1tU",
  authDomain: "transport-na-zadanie-dev.firebaseapp.com",
  projectId: "transport-na-zadanie-dev",
  storageBucket: "transport-na-zadanie-dev.firebasestorage.app",
  messagingSenderId: "262004289982",
  appId: "1:262004289982:web:be7f86ac74b791190789ef",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Powiadomienie w tle:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
