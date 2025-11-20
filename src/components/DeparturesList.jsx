import {
  formatDepartureLabel,
  getScheduleKey,
  copyToClipboardFallback,
} from "../utils/helpers";

import { useState, useEffect, useRef } from "react";

import DailyReportModal from "./DailyReportModal";

function DeparturesList({
  scheduleType,
  setScheduleType,
  getCurrentSchedule,
  savedSchedules,
  setSavedSchedules,
  selectDeparture,
  setView,
  sentSMS,
  setSentSMS,
  scrollPosition,
  setScrollPosition,
  busNumber,
  setBusNumber,
  direction,
  setDirection,
}) {
  const [showModal, setShowModal] = useState(false);
  const [showDirectionModal, setShowDirectionModal] = useState(false);
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

  const departures = Object.keys(getCurrentSchedule());

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
    if (newBusNumber === "908") {
      setShowDirectionModal(true);
    } else {
      setBusNumber(newBusNumber);
    }
  };

  const handleDirectionSelect = (selectedDirection) => {
    setBusNumber("908");
    setDirection(selectedDirection);
    setShowDirectionModal(false);
  };

  const get908Label = () => {
    if (busNumber === "908") {
      return direction === "1" ? "🚌 908 ➡️ Chobolańska" : "🚌 908 ➡️ Maczka";
    }
    return "🚌 908";
  };

  return (
    <>
      <div className="header">
        <button className="settings-btn" onClick={() => setView("settings")}>
          ⚙️
        </button>

        <h1>🚌 Odjazdy Autobusu</h1>
        <p>Wybierz autobus i godzinę odjazdu</p>

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
        {departures.map((time) => {
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
        })}
      </div>

      {showDirectionModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDirectionModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Wybierz kierunek</h2>
            <p>Wybierz kierunek jazdy autobusu 908:</p>
            <div className="modal-buttons" style={{ flexDirection: "column" }}>
              <button
                className="btn btn-save"
                onClick={() => handleDirectionSelect("1")}
                style={{ width: "100%" }}
              >
                ➡️ Chobolańska
              </button>
              <button
                className="btn btn-sms"
                onClick={() => handleDirectionSelect("2")}
                style={{ width: "100%" }}
              >
                ➡️ Maczka
              </button>
            </div>
          </div>
        </div>
      )}

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
