import { useState } from "react";

function DailyReportModal({
  onClose,
  savedSchedules,
  scheduleType,
  getCurrentSchedule,
}) {
  const [passengerCount, setPassengerCount] = useState("");
  const [dispatchers, setDispatchers] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!passengerCount || !dispatchers) {
      alert("Wypełnij wszystkie pola!");
      return;
    }

    setSending(true);

    const schedule = getCurrentSchedule();
    const stopsText = Object.keys(savedSchedules)
      .filter((key) => key.startsWith(scheduleType))
      .map((key) => {
        const time = key.split("_")[1];
        const stops = savedSchedules[key];
        const selectedStops = Object.keys(stops).filter((stop) => stops[stop]);

        if (selectedStops.length === 0) return null;

        const stopTimes = schedule[time] || {};
        return `${time}: ${selectedStops
          .map((stop) => `${stop} (${stopTimes[stop] || "--:--"})`)
          .join(", ")}`;
      })
      .filter(Boolean)
      .join(" | ");

    const data = {
      passengerCount,
      dispatchers,
      scheduleType,
      stops: stopsText || "Brak zaznaczonych przystanków",
    };

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxFM3vM6t9JhbKlVTH8MuZqNlBrbT1jExH_0OsqpGuzU1wVoq3Xp9tkWH1F7t4tYzCzaQ/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      alert("✅ Dane wysłane do Google Sheets!");
      onClose();
    } catch (error) {
      alert("❌ Błąd wysyłania: " + error.message);
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
            {sending ? "Wysyłanie..." : "📤 Wyślij"}
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
