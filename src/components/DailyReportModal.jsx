import { useState } from "react";
import {
  scheduleSchool904,
  scheduleVacation904,
  scheduleSchool908Dir1,
  scheduleSchool908Dir2,
  scheduleVacation908Dir1,
  scheduleVacation908Dir2,
} from "../data/schedules";

function DailyReportModal({
  onClose,
  savedSchedules,
  scheduleType,
  setSavedSchedules,
  setSentSMS,
}) {
  const [passengerCount, setPassengerCount] = useState("");
  const [dispatchers, setDispatchers] = useState("");
  const [sending, setSending] = useState(false);

  const getScheduleForBus = (bus, dir = null) => {
    if (bus === "904") {
      return scheduleType === "school"
        ? scheduleSchool904
        : scheduleVacation904;
    } else if (bus === "908") {
      if (scheduleType === "school") {
        return dir === "1" ? scheduleSchool908Dir1 : scheduleSchool908Dir2;
      } else {
        return dir === "1" ? scheduleVacation908Dir1 : scheduleVacation908Dir2;
      }
    }
    return {};
  };

  const formatSchedulesByBus = () => {
    const buses = {
      904: [],
      "908_dir1": [],
      "908_dir2": [],
    };

    Object.keys(savedSchedules).forEach((key) => {
      const stops = savedSchedules[key];
      const selectedStops = Object.keys(stops).filter((stop) => stops[stop]);

      if (selectedStops.length === 0) return;

      const parts = key.split("_");
      const bus = parts[0]; // "904" lub "908"
      const schedType = parts[1]; // "school" lub "vacation"

      if (schedType !== scheduleType) return;

      const timeMatch = key.match(/(\d{2})_(\d{2})/);
      if (!timeMatch) return;

      const time = `${timeMatch[1]}:${timeMatch[2]}`;

      let dir = null;
      if (bus === "908") {
        const lastPart = parts[parts.length - 1];
        if (lastPart === "1" || lastPart === "2") {
          dir = lastPart;
        }
      }

      const schedule = getScheduleForBus(bus, dir);

      let stopTimes = {};
      const scheduleKeys = Object.keys(schedule);
      const matchingKey = scheduleKeys.find((k) => k.startsWith(time));

      if (matchingKey) {
        stopTimes = schedule[matchingKey];
      }

      const stopsText = `${time}: ${selectedStops
        .map((stop) => `${stop} (${stopTimes[stop] || "--:--"})`)
        .join(", ")}`;

      if (bus === "904") {
        buses["904"].push(stopsText);
      } else if (bus === "908") {
        if (dir === "1") {
          buses["908_dir1"].push(stopsText);
        } else if (dir === "2") {
          buses["908_dir2"].push(stopsText);
        }
      }
    });

    return buses;
  };
  const handleSubmit = async () => {
    if (!passengerCount || !dispatchers) {
      alert("Wypełnij wszystkie pola!");
      return;
    }

    setSending(true);

    const buses = formatSchedulesByBus();

    const stops904 =
      buses["904"].length > 0 ? buses["904"].join(" | ") : "Brak zamówień";

    const stops908Dir1 =
      buses["908_dir1"].length > 0
        ? buses["908_dir1"].join(" | ")
        : "Brak zamówień";

    const stops908Dir2 =
      buses["908_dir2"].length > 0
        ? buses["908_dir2"].join(" | ")
        : "Brak zamówień";

    const data = {
      passengerCount,
      dispatchers,
      scheduleType,
      stops904,
      stops908Dir1,
      stops908Dir2,
    };

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxRnVKupI-zBLSf9m8XHz1ForYR2NRoo6maT_M9jY9icJkoKNEWSdqU-qczuv4LWfHieQ/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      alert("✅ Raport wysłany! Wszystkie dane zostały wyczyszczone.");

      setSavedSchedules({});
      setSentSMS({});

      onClose();
    } catch (error) {
      alert("❌ Błąd wysyłania: " + error.message);
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>📊 Raport dzienny</h2>

        <div className="form-group">
          <label>Liczba pasażerów:</label>
          <input
            type="number"
            value={passengerCount}
            onChange={(e) => setPassengerCount(e.target.value)}
            placeholder="np. 25"
          />
        </div>

        <div className="form-group">
          <label>Dyspozytorzy:</label>
          <input
            type="text"
            value={dispatchers}
            onChange={(e) => setDispatchers(e.target.value)}
            placeholder="np. Jan, Anna"
          />
        </div>

        <div className="modal-buttons">
          <button
            className="btn btn-save"
            onClick={handleSubmit}
            disabled={sending}
          >
            {sending ? "Wysyłanie..." : "📤 Wyślij raport"}
          </button>
          <button className="btn btn-clear" onClick={onClose}>
            ❌ Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}

export default DailyReportModal;
