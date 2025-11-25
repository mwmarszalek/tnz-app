import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";
import { ref, set } from "firebase/database";
import { database } from "./firebase";

const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      console.log("FCM Token:", token);

      if (token) {
        await set(ref(database, `fcmTokens/${token}`), token);
        console.log("Token zapisany w Firebase");
      }

      return token;
    } else {
      console.log("Brak pozwolenia na powiadomienia");
      return null;
    }
  } catch (error) {
    console.error("Błąd FCM:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Otrzymano powiadomienie:", payload);
      resolve(payload);
    });
  });
