import {
  formatDepartureLabel,
  getScheduleKey,
  copyToClipboardFallback,
} from "../utils/helpers";

import { useState, useEffect, useRef } from "react";

import DailyReportModal from "./DailyReportModal";
import { busStops } from "../data/schedules";

function DeparturesList({
  scheduleType,
  setScheduleType,
  getCurrentSchedule,
  savedSchedules,
  setSavedSchedules,
  selectDeparture,
  selectStop,
  setView,
  sentSMS,
  setSentSMS,
  scrollPosition,
  setScrollPosition,
  busNumber,
  setBusNumber,
  direction,
}) {
  const [showModal, setShowModal] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const content = document.querySelector(".content");
    if (content && scrollPosition) {
      content.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // Zamknij menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
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

  const isShowingStops = busNumber === "908";

  // Dla 908: pokaż przystanki, dla 904: pokaż godziny
  const items = isShowingStops
    ? (() => {
        // Zbierz wszystkie unikalne przystanki z obu kierunków
        const allStops = new Set([
          ...busStops[908].direction1,
          ...busStops[908].direction2,
        ]);
        return Array.from(allStops);
      })()
    : Object.keys(getCurrentSchedule());

  const getSelectedCount = (time) => {
    const scheduleKey = getScheduleKey(
      scheduleType,
      time,
      busNumber,
      direction
    );
    const stops = savedSchedules[scheduleKey] || {};
    return Object.values(stops).filter(Boolean).length;
  };

  const getStopSelectedCount = (stopName) => {
    const scheduleKey = getScheduleKey(
      scheduleType,
      stopName,
      busNumber,
      "all"
    );
    const times = savedSchedules[scheduleKey] || {};
    return Object.values(times).filter(Boolean).length;
  };

  const clearDeparture = (e, time) => {
    e.stopPropagation();
    if (
      confirm(`Czy na pewno chcesz wyczyścić przystanki dla kursu o ${time}?`)
    ) {
      const scheduleKey = getScheduleKey(
        scheduleType,
        time,
        busNumber,
        direction
      );
      const updated = { ...savedSchedules };
      delete updated[scheduleKey];
      setSavedSchedules(updated);

      const updatedSMS = { ...sentSMS };
      delete updatedSMS[scheduleKey];
      setSentSMS(updatedSMS);
    }
  };

  const clearStop = (e, stopName) => {
    e.stopPropagation();
    if (
      confirm(
        `Czy na pewno chcesz wyczyścić rezerwacje dla przystanku ${stopName}?`
      )
    ) {
      const scheduleKey = getScheduleKey(
        scheduleType,
        stopName,
        busNumber,
        "all"
      );
      const updated = { ...savedSchedules };
      delete updated[scheduleKey];
      setSavedSchedules(updated);

      const updatedSMS = { ...sentSMS };
      delete updatedSMS[scheduleKey];
      setSentSMS(updatedSMS);
    }
  };

  const clearAllData = () => {
    if (confirm("Czy na pewno chcesz wyczyścić wszystkie dane?")) {
      setSavedSchedules({});
      setSentSMS({});
      setMenuOpen(false);
    }
  };

  const hasAnyData =
    Object.keys(savedSchedules).length > 0 || Object.keys(sentSMS).length > 0;

  const copyDepartureList = async (e, time) => {
    e.stopPropagation();

    const scheduleKey = getScheduleKey(
      scheduleType,
      time,
      busNumber,
      direction
    );
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

  const handleBusChange = (newBusNumber) => {
    setBusNumber(newBusNumber);
  };

  const get908Label = () => {
    return "🚌 908";
  };

  return (
    <>
      <div className="header">
        <button className="settings-btn" onClick={() => setView("settings")}>
          ⚙️
        </button>

        <h1>🚌 Odjazdy Autobusu</h1>
        <p>
          {isShowingStops
            ? "Wybierz przystanek"
            : "Wybierz autobus i godzinę odjazdu"}
        </p>

        {/* Wybór autobusu */}
        <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
          <button
            className={`schedule-toggle ${busNumber === "904" ? "active" : ""}`}
            onClick={() => handleBusChange("904")}
          >
            🚌 904
          </button>
          <button
            className={`schedule-toggle ${busNumber === "908" ? "active" : ""}`}
            onClick={() => handleBusChange("908")}
          >
            {get908Label()}
          </button>
        </div>

        {/* Typ rozkładu + Hamburger */}
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            position: "relative",
          }}
        >
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

          {/* Hamburger menu */}
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            ref={menuButtonRef}
            style={{
              position: "absolute",
              right: "0",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            ⋮
          </button>

          {menuOpen && (
            <div
              className="dropdown-menu"
              ref={menuRef}
              style={{
                top: "60px",
                right: "0",
              }}
            >
              <button
                className="menu-item"
                onClick={() => {
                  setShowModal(true);
                  setMenuOpen(false);
                }}
              >
                📊 Wyślij raport dzienny
              </button>
              {hasAnyData && (
                <button
                  className="menu-item clear-menu-item"
                  onClick={clearAllData}
                >
                  🗑️ Wyczyść wszystkie dane
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="content">
        {items.map((item) => {
          if (isShowingStops) {
            // Wyświetl przystanek (dla 908)
            const count = getStopSelectedCount(item);
            const hasSavedTimes = count > 0;
            const scheduleKey = getScheduleKey(
              scheduleType,
              item,
              busNumber,
              "all"
            );
            const smsSent = sentSMS[scheduleKey];

            return (
              <div key={item} className="departure-item">
                <div
                  className="departure-main"
                  onClick={() => {
                    const content = document.querySelector(".content");
                    setScrollPosition(content?.scrollTop || 0);
                    selectStop(item);
                  }}
                >
                  <div className="departure-time">
                    <div className="time-icon">📍</div>
                    <span className="time-text">{item}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      alignItems: "flex-end",
                    }}
                  >
                    {hasSavedTimes && (
                      <span className="badge">
                        ✓ {count} {count === 1 ? "kurs" : "kursy"}
                      </span>
                    )}
                    {smsSent && (
                      <span className="badge badge-sms">📱 SMS wysłany</span>
                    )}
                  </div>
                </div>

                {(hasSavedTimes || smsSent) && (
                  <div className="departure-buttons">
                    <button
                      className="departure-btn-small clear-small"
                      onClick={(e) => clearStop(e, item)}
                    >
                      🗑️ Wyczyść
                    </button>
                  </div>
                )}
              </div>
            );
          } else {
            // Wyświetl godzinę odjazdu (dla 904)
            const time = item;
            const count = getSelectedCount(time);
            const hasSavedStops = count > 0;
            const formatted = formatDepartureLabel(time);
            const scheduleKey = getScheduleKey(
              scheduleType,
              time,
              busNumber,
              direction
            );
            const smsSent = sentSMS[scheduleKey];

            return (
              <div key={time} className="departure-item">
                <div
                  className="departure-main"
                  onClick={() => {
                    const content = document.querySelector(".content");
                    setScrollPosition(content?.scrollTop || 0);
                    selectDeparture(time);
                  }}
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

                {(hasSavedStops || smsSent) && (
                  <div className="departure-buttons">
                    {hasSavedStops && (
                      <button
                        className="departure-btn-small copy-small"
                        onClick={(e) => copyDepartureList(e, time)}
                      >
                        📋 Skopiuj
                      </button>
                    )}
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
          }
        })}
      </div>

      {/* Modal raportu dziennego */}
      {showModal && (
        <DailyReportModal
          onClose={() => setShowModal(false)}
          savedSchedules={savedSchedules}
          scheduleType={scheduleType}
          getCurrentSchedule={getCurrentSchedule}
          setSavedSchedules={setSavedSchedules}
          setSentSMS={setSentSMS}
        />
      )}
    </>
  );
}

export default DeparturesList;
