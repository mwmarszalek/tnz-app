import { busStops } from "../data/schedules";
import { copyToClipboardFallback } from "../utils/helpers";

function StopsList({
  currentDeparture,
  selectedStops,
  setSelectedStops,
  getCurrentSchedule,
  saveStops,
  setView,
  driverPhone,
}) {
  const schedule = getCurrentSchedule();
  const stopTimes = schedule[currentDeparture] || {};
  const availableStops = busStops.filter(
    (stop) => stopTimes[stop] !== undefined
  );
  const count = Object.values(selectedStops).filter(Boolean).length;

  const toggleStop = (stop) => {
    setSelectedStops((prev) => ({
      ...prev,
      [stop]: !prev[stop],
    }));
  };

  const clearCurrentStops = () => {
    if (
      confirm("Czy na pewno chcesz wyczyścić wszystkie zaznaczone przystanki?")
    ) {
      setSelectedStops({});
    }
  };

  const sendSMS = () => {
    const selected = busStops.filter((stop) => selectedStops[stop]);

    if (selected.length === 0) {
      alert("Nie zaznaczono żadnych przystanków!");
      return;
    }

    const text = `Lista przystanków na kurs o godzinie ${currentDeparture}:\n\n${selected
      .map((stop, i) => `${i + 1}. ${stop} - ${stopTimes[stop] || "--:--"}`)
      .join("\n")}`;

    const encodedText = encodeURIComponent(text);
    const smsURL = `sms:${driverPhone}?body=${encodedText}`;
    window.location.href = smsURL;
  };

  const copyToClipboard = async () => {
    const selected = busStops.filter((stop) => selectedStops[stop]);

    if (selected.length === 0) {
      alert("Nie zaznaczono żadnych przystanków!");
      return;
    }

    const text = `Lista przystanków na kurs o godzinie ${currentDeparture}:\n\n${selected
      .map((stop, i) => `${i + 1}. ${stop} - ${stopTimes[stop] || "--:--"}`)
      .join("\n")}`;

    try {
      await navigator.clipboard.writeText(text);
      const btn = document.querySelector("#copy-btn-stops");
      const originalText = btn.textContent;
      btn.textContent = "✓ Skopiowano!";
      btn.classList.add("copied");

      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove("copied");
      }, 2000);
    } catch {
      copyToClipboardFallback(text);
    }
  };

  return (
    <>
      <div className="header">
        <button className="back-btn" onClick={() => setView("departures")}>
          ← Powrót
        </button>
        <h1>📍 Kurs {currentDeparture}</h1>
        <p>Zaznacz przystanki ({count} wybrano)</p>
      </div>

      <div className="content">
        {availableStops.map((stop) => {
          const isSelected = selectedStops[stop];

          return (
            <button
              key={stop}
              className={`stop-btn ${isSelected ? "selected" : ""}`}
              onClick={() => toggleStop(stop)}
            >
              <div className="stop-left">
                <div className="checkbox">{isSelected ? "✓" : ""}</div>
                <span className="stop-name">{stop}</span>
              </div>
              <span className="stop-time">{stopTimes[stop]}</span>
            </button>
          );
        })}
      </div>

      <div className="action-buttons">
        <button className="btn btn-save" onClick={saveStops}>
          💾 Zapisz
        </button>
        <button className="btn btn-sms" onClick={sendSMS}>
          📱 Wyślij SMS
        </button>
        <button
          className="btn btn-copy"
          id="copy-btn-stops"
          onClick={copyToClipboard}
        >
          📋 Skopiuj listę
        </button>
        <button className="btn btn-clear" onClick={clearCurrentStops}>
          🗑️ Wyczyść przystanki
        </button>
      </div>
    </>
  );
}

export default StopsList;
