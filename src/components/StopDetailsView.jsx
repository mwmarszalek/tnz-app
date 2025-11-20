import { useState, useEffect } from "react";
import { getScheduleKey } from "../utils/helpers";
import {
  scheduleSchool908Dir1,
  scheduleSchool908Dir2,
  scheduleVacation908Dir1,
  scheduleVacation908Dir2,
} from "../data/schedules";

function StopDetailsView({
  stopName,
  scheduleType,
  setView,
  savedSchedules,
  setSavedSchedules,
  busNumber,
  sentSMS,
  setSentSMS,
  driverPhone,
}) {
  const [selectedTimes, setSelectedTimes] = useState({});

  // Załaduj zapisane dane przy wejściu
  useEffect(() => {
    const scheduleKey = getScheduleKey(
      scheduleType,
      stopName,
      busNumber,
      "all"
    );
    setSelectedTimes(savedSchedules[scheduleKey] || {});
  }, [scheduleType, stopName, busNumber, savedSchedules]);

  // Pobierz wszystkie godziny dla tego przystanku w obu kierunkach
  const getTimesForStop = (direction) => {
    const schedule =
      direction === "1"
        ? scheduleType === "school"
          ? scheduleSchool908Dir1
          : scheduleVacation908Dir1
        : scheduleType === "school"
        ? scheduleSchool908Dir2
        : scheduleVacation908Dir2;

    const times = [];
    Object.keys(schedule).forEach((departureTime) => {
      const stops = schedule[departureTime];
      if (stops[stopName]) {
        times.push({
          departure: departureTime,
          arrival: stops[stopName],
        });
      }
    });
    return times;
  };

  const timesDir1 = getTimesForStop("1");
  const timesDir2 = getTimesForStop("2");

  const toggleTime = (time, direction) => {
    const key = `${direction}_${time}`;
    setSelectedTimes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const saveSelection = () => {
    const scheduleKey = getScheduleKey(
      scheduleType,
      stopName,
      busNumber,
      "all"
    );
    setSavedSchedules({
      ...savedSchedules,
      [scheduleKey]: selectedTimes,
    });
    setView("departures");
  };

  const sendSMS = () => {
    const selectedDir1 = timesDir1.filter(
      ({ departure }) => selectedTimes[`1_${departure}`]
    );
    const selectedDir2 = timesDir2.filter(
      ({ departure }) => selectedTimes[`2_${departure}`]
    );

    let text = `Zamówione kursy dla przystanku ${stopName}:\n\n`;

    if (selectedDir1.length > 0) {
      text += `➡️ Kierunek: Chobolańska → Maczka\n`;
      text += selectedDir1
        .map(
          ({ departure, arrival }, i) =>
            `${i + 1}. Odjazd: ${departure}, Przyjazd: ${arrival}`
        )
        .join("\n");
      text += "\n\n";
    }

    if (selectedDir2.length > 0) {
      text += `⬅️ Kierunek: Maczka → Chobolańska\n`;
      text += selectedDir2
        .map(
          ({ departure, arrival }, i) =>
            `${i + 1}. Odjazd: ${departure}, Przyjazd: ${arrival}`
        )
        .join("\n");
    }

    if (selectedDir1.length === 0 && selectedDir2.length === 0) {
      text = `Przystanek ${stopName} - brak zamówionych kursów.`;
    }

    const scheduleKey = getScheduleKey(
      scheduleType,
      stopName,
      busNumber,
      "all"
    );
    setSentSMS({ ...sentSMS, [scheduleKey]: true });

    const encodedText = encodeURIComponent(text);
    const smsURL = `sms:${driverPhone}?body=${encodedText}`;
    window.location.href = smsURL;
  };

  const selectedCount = Object.values(selectedTimes).filter(Boolean).length;

  return (
    <>
      <div className="header">
        <button
          className="back-btn"
          onClick={() => {
            saveSelection();
            setView("departures");
          }}
        >
          ← Powrót
        </button>
        <h1>📍 {stopName}</h1>
        <p>Wybierz godziny odjazdów ({selectedCount} wybrano)</p>
      </div>

      <div className="content">
        {/* Kierunek 1: Chobolańska → Maczka */}
        <div style={{ marginBottom: "30px" }}>
          <h3
            style={{
              padding: "10px 0",
              color: "#10b981",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            ➡️ Chobolańska → Maczka
          </h3>
          {timesDir1.length === 0 ? (
            <p style={{ color: "#999", padding: "10px 0" }}>
              Brak kursów w tym kierunku dla tego przystanku
            </p>
          ) : (
            timesDir1.map(({ departure, arrival }) => (
              <button
                key={`1_${departure}`}
                className={`stop-btn ${
                  selectedTimes[`1_${departure}`] ? "selected" : ""
                }`}
                onClick={() => toggleTime(departure, "1")}
              >
                <div className="stop-left">
                  <div className="checkbox">
                    {selectedTimes[`1_${departure}`] ? "✓" : ""}
                  </div>
                  <span className="stop-name">Odjazd: {departure}</span>
                </div>
                <span className="stop-time">{arrival}</span>
              </button>
            ))
          )}
        </div>

        {/* Kierunek 2: Maczka → Chobolańska */}
        <div>
          <h3
            style={{
              padding: "10px 0",
              color: "#10b981",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            ⬅️ Maczka → Chobolańska
          </h3>
          {timesDir2.length === 0 ? (
            <p style={{ color: "#999", padding: "10px 0" }}>
              Brak kursów w tym kierunku dla tego przystanku
            </p>
          ) : (
            timesDir2.map(({ departure, arrival }) => (
              <button
                key={`2_${departure}`}
                className={`stop-btn ${
                  selectedTimes[`2_${departure}`] ? "selected" : ""
                }`}
                onClick={() => toggleTime(departure, "2")}
              >
                <div className="stop-left">
                  <div className="checkbox">
                    {selectedTimes[`2_${departure}`] ? "✓" : ""}
                  </div>
                  <span className="stop-name">Odjazd: {departure}</span>
                </div>
                <span className="stop-time">{arrival}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-save" onClick={saveSelection}>
          💾 Zapisz
        </button>
        <button className="btn btn-sms" onClick={sendSMS}>
          📱 Wyślij SMS
        </button>
      </div>
    </>
  );
}

export default StopDetailsView;
