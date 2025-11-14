import {
  formatDepartureLabel,
  getScheduleKey,
  copyToClipboardFallback,
} from "../utils/helpers";

function DeparturesList({
  scheduleType,
  setScheduleType,
  getCurrentSchedule,
  savedSchedules,
  setSavedSchedules,
  selectDeparture,
  setView,
  sentSMS,
}) {
  const departures = Object.keys(getCurrentSchedule());

  const getSelectedCount = (time) => {
    const scheduleKey = getScheduleKey(scheduleType, time);
    const stops = savedSchedules[scheduleKey] || {};
    return Object.values(stops).filter(Boolean).length;
  };

  const clearDeparture = (e, time) => {
    e.stopPropagation();
    if (
      confirm(`Czy na pewno chcesz wyczyścić przystanki dla kursu o ${time}?`)
    ) {
      const scheduleKey = getScheduleKey(scheduleType, time);
      const updated = { ...savedSchedules };
      delete updated[scheduleKey];
      setSavedSchedules(updated);
    }
  };

  const copyDepartureList = async (e, time) => {
    e.stopPropagation();

    const scheduleKey = getScheduleKey(scheduleType, time);
    const stops = savedSchedules[scheduleKey] || {};
    const schedule = getCurrentSchedule();
    const stopTimes = schedule[time] || {};

    const selectedStopNames = Object.keys(stops).filter((stop) => stops[stop]);

    if (selectedStopNames.length === 0) return;

    const text = `Lista przystanków na kurs o godzinie ${time}:\n\n${selectedStopNames
      .map((stop, i) => `${i + 1}. ${stop} - ${stopTimes[stop] || "--:--"}`)
      .join("\n")}`;

    const button = e.target;
    const originalText = button.textContent;

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "✓ Skopiowano";
      button.classList.add("copied");
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
      }, 2000);
    } catch (err) {
      console.error("Błąd kopiowania:", err);
      copyToClipboardFallback(text);
      button.textContent = "✓ Skopiowano";
      button.classList.add("copied");
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
      }, 2000);
    }
  };

  return (
    <>
      <div className="header">
        <button className="settings-btn" onClick={() => setView("settings")}>
          ⚙️
        </button>
        <h1>🚌 Odjazdy Autobusu</h1>
        <p>Wybierz godzinę odjazdu</p>
        <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
          <button
            className={`schedule-toggle ${
              scheduleType === "school" ? "active" : ""
            }`}
            onClick={() => setScheduleType("school")}
          >
            📚 Dni szkolne
          </button>
          <button
            className={`schedule-toggle ${
              scheduleType === "vacation" ? "active" : ""
            }`}
            onClick={() => setScheduleType("vacation")}
          >
            🏖️ Dni wolne
          </button>
        </div>
      </div>

      <div className="content">
        {departures.map((time) => {
          const count = getSelectedCount(time);
          const hasSavedStops = count > 0;
          const formatted = formatDepartureLabel(time);
          const scheduleKey = getScheduleKey(scheduleType, time);
          const smsSent = sentSMS[scheduleKey];

          return (
            <div key={time} className="departure-item">
              <div
                className="departure-main"
                onClick={() => selectDeparture(time)}
              >
                <div className="departure-time">
                  <div className="time-icon">🕐</div>
                  <span className="time-text">
                    {typeof formatted === "string" ? (
                      formatted
                    ) : (
                      <>
                        {formatted.time}
                        <br />
                        <span className="time-sub">{formatted.subtitle}</span>
                      </>
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    alignItems: "flex-end",
                  }}
                >
                  {hasSavedStops && (
                    <span className="badge">
                      ✓ {count} {count === 1 ? "przystanek" : "przystanki"}
                    </span>
                  )}
                  {smsSent && (
                    <span className="badge badge-sms">📱 SMS wysłany</span>
                  )}
                </div>
              </div>

              {hasSavedStops && (
                <div className="departure-buttons">
                  <button
                    className="departure-btn-small copy-small"
                    onClick={(e) => copyDepartureList(e, time)}
                  >
                    📋 Skopiuj
                  </button>
                  <button
                    className="departure-btn-small clear-small"
                    onClick={(e) => clearDeparture(e, time)}
                  >
                    🗑️ Wyczyść
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default DeparturesList;
