import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";

const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BDaIwUGT51aMyfcHW6tKCuK3gvgfHHCXwg5DjN69rxOY7RxC6NbgZi5S8bGW1SMxSPO-jhg_TJ25g4HytQNhuYs",
      });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("Brak pozwolenia na powiadomienia");
      return null;
    }
  } catch (error) {
    console.error("Błąd powiadomień:", error);
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
