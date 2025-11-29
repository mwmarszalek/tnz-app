const { scheduler } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

const scheduleSchool904 = [
  "06:27",
  "06:40",
  "07:10",
  "07:40",
  "08:10",
  "08:40",
  "09:10",
  "09:33",
  "10:00",
  "10:30",
  "11:00",
  "12:15",
  "12:45",
  "13:15",
  "13:45",
  "14:15",
  "14:45",
  "15:15",
  "15:45",
  "16:15",
];

const sendNotification = async (departureTime) => {
  try {
    const tokensSnapshot = await admin
      .database()
      .ref("/fcmTokens")
      .once("value");

    const tokens = [];
    tokensSnapshot.forEach((child) => {
      tokens.push(child.val());
    });

    if (tokens.length === 0) {
      console.log("Brak tokenów FCM");
      return;
    }

    console.log(`Wysyłam do ${tokens.length} urządzeń...`);

    const promises = tokens.map((token) => {
      const message = {
        notification: {
          title: "🚌 Odjazd za 5 minut!",
          body: `Autobus 904 o ${departureTime}`,
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            priority: "max",
          },
        },
        token: token,
      };

      return admin
        .messaging()
        .send(message)
        .then(() => {
          console.log(`✓ Wysłano do: ${token.substring(0, 20)}...`);
          return { success: true };
        })
        .catch((error) => {
          console.error(`✗ Błąd: ${error.code}`);

          if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            admin.database().ref(`/fcmTokens/${token}`).remove();
            return { success: false };
          }
          return { success: false };
        });
    });

    const results = await Promise.all(promises);
    const successCount = results.filter((r) => r.success).length;

    console.log(`✅ Wysłano: ${successCount}/${tokens.length}`);
  } catch (error) {
    console.error("Błąd:", error);
  }
};

exports.checkAndSendNotifications = scheduler.onSchedule(
  {
    schedule: "* 6-16 * * 1-5",
    timeZone: "Europe/Warsaw",
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("pl-PL", {
      timeZone: "Europe/Warsaw",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      weekday: "long",
    });

    const parts = formatter.formatToParts(now);
    const currentHour = parseInt(parts.find((p) => p.type === "hour").value);
    const currentMinute = parseInt(
      parts.find((p) => p.type === "minute").value
    );
    const currentTime = `${String(currentHour).padStart(2, "0")}:${String(
      currentMinute
    ).padStart(2, "0")}`;

    const dayOfWeek = now.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log(`Weekend (${dayOfWeek === 0 ? 'niedziela' : 'sobota'}) - pomijam powiadomienia`);
      return null;
    }

    console.log(`Sprawdzam o ${currentTime}...`);

    for (const departureTime of scheduleSchool904) {
      const [hours, minutes] = departureTime.split(":").map(Number);

      let notifMinutes = minutes - 5;
      let notifHours = hours;

      if (notifMinutes < 0) {
        notifMinutes += 60;
        notifHours -= 1;
      }

      const notificationTime = `${String(notifHours).padStart(2, "0")}:${String(
        notifMinutes
      ).padStart(2, "0")}`;

      if (notificationTime === currentTime) {
        console.log(`⏰ Czas na powiadomienie dla ${departureTime}`);
        await sendNotification(departureTime);
      }
    }

    return null;
  }
);
