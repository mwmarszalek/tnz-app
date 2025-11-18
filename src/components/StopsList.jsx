import { useState, useEffect, useRef } from "react";

import { busStops } from "../data/schedules";
import { copyToClipboardFallback, getScheduleKey } from "../utils/helpers";

function StopsList({
  currentDeparture,
  selectedStops,
  setSelectedStops,
  getCurrentSchedule,
  saveStops,
  setView,
  driverPhone,
  scheduleType,
  sentSMS,
  setSentSMS,
  savedSchedules,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Załaduj zapisane przystanki przy wejściu
  useEffect(() => {
    const scheduleKey = getScheduleKey(scheduleType, currentDeparture);
    setSelectedStops(savedSchedules[scheduleKey] || {});
  }, [currentDeparture, scheduleType, savedSchedules, setSelectedStops]);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Zamknięcie menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

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
      setMenuOpen(false);
    }
  };

  const sendSMS = () => {
    const selected = busStops.filter((stop) => selectedStops[stop]);

    let text;
    if (selected.length === 0) {
      text = `Kurs o godzinie ${currentDeparture} - brak zamówionych przystanków.`;
    } else {
      text = `Lista przystanków na kurs o godzinie ${currentDeparture}:\n\n${selected
        .map((stop, i) => `${i + 1}. ${stop} - ${stopTimes[stop] || "--:--"}`)
        .join("\n")}`;
    }

    const scheduleKey = getScheduleKey(scheduleType, currentDeparture);
    setSentSMS({ ...sentSMS, [scheduleKey]: true });

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
      alert("✓ Skopiowano do schowka!");
      setMenuOpen(false);
    } catch {
      copyToClipboardFallback(text);
      setMenuOpen(false);
    }
  };

  return (
    <>
      <div className="header">
        <button
          className="back-btn"
          onClick={() => {
            saveStops();
            setView("departures");
          }}
        >
          ← Powrót
        </button>

        <button
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          ref={buttonRef}
        >
          ⋮
        </button>

        <h1>📍 Kurs {currentDeparture}</h1>
        <p>Zaznacz przystanki ({count} wybrano)</p>

        {menuOpen && (
          <div className="dropdown-menu" ref={menuRef}>
            <button
              className="menu-item copy-menu-item"
              onClick={copyToClipboard}
            >
              📋 Skopiuj listę
            </button>
            <button
              className="menu-item clear-menu-item"
              onClick={clearCurrentStops}
            >
              🗑️ Wyczyść przystanki
            </button>
          </div>
        )}
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
      </div>
    </>
  );
}

export default StopsList;
