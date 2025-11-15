import { useState, useEffect } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useAutoClear } from "./hooks/useAutoClear";
import {
  scheduleSchool904,
  scheduleVacation904,
  scheduleVacation908Dir1,
  scheduleVacation908Dir2,
  scheduleSchool908Dir1,
  scheduleSchool908Dir2,
  busStops,
  DEFAULT_PHONE,
} from "./data/schedules";
import DeparturesList from "./components/DeparturesList";
import StopsList from "./components/StopsList";
import Settings from "./components/Settings";
import "./App.css";
import { getScheduleKey } from "./utils/helpers";

function App() {
  const [view, setView] = useState("departures");
  const [scheduleType, setScheduleType] = useState("school");
  const [busNumber, setBusNumber] = useState("904");
  const [direction, setDirection] = useState("1");
  const [currentDeparture, setCurrentDeparture] = useState(null);
  const [selectedStops, setSelectedStops] = useState({});
  const [savedSchedules, setSavedSchedules] = useLocalStorage(
    "busSchedules",
    {}
  );
  const [driverPhone, setDriverPhone] = useLocalStorage(
    "driverPhone",
    DEFAULT_PHONE
  );

  // 🔄 Automatyczne czyszczenie danych o 19:25
  useAutoClear(() => {
    setSavedSchedules({});
    setSelectedStops({});
    setView("departures");
  });

  useEffect(() => {
    document.body.className = `bus-${busNumber}`;
  }, [busNumber]);

  const getCurrentBusStops = () => {
    if (busNumber === "904") {
      return busStops[904];
    } else if (busNumber === "908") {
      return busStops[908][`direction${direction}`];
    }
    return [];
  };

  const getCurrentSchedule = () => {
    if (busNumber === "904") {
      return scheduleType === "school"
        ? scheduleSchool904
        : scheduleVacation904;
    } else if (busNumber === "908") {
      if (scheduleType === "school") {
        return direction === "1"
          ? scheduleSchool908Dir1
          : scheduleSchool908Dir2;
      } else {
        return direction === "1"
          ? scheduleVacation908Dir1
          : scheduleVacation908Dir2;
      }
    }
  };

  const selectDeparture = (time) => {
    setCurrentDeparture(time);
    const scheduleKey = getScheduleKey(
      scheduleType,
      time,
      busNumber,
      direction
    );
    setSelectedStops({ ...(savedSchedules[scheduleKey] || {}) });
    setView("stops");
  };

  const saveStops = () => {
    const scheduleKey = getScheduleKey(
      scheduleType,
      currentDeparture,
      busNumber,
      direction
    );
    setSavedSchedules({ ...savedSchedules, [scheduleKey]: selectedStops });
    setView("departures");
  };

  const [sentSMS, setSentSMS] = useLocalStorage("sentSMS", {});

  const [scrollPosition, setScrollPosition] = useState(0);

  return (
    <div className="container">
      {view === "departures" && (
        <DeparturesList
          scheduleType={scheduleType}
          setScheduleType={setScheduleType}
          getCurrentSchedule={getCurrentSchedule}
          savedSchedules={savedSchedules}
          setSavedSchedules={setSavedSchedules}
          selectDeparture={selectDeparture}
          setView={setView}
          sentSMS={sentSMS}
          setSentSMS={setSentSMS}
          scrollPosition={scrollPosition}
          setScrollPosition={setScrollPosition}
          busNumber={busNumber}
          setBusNumber={setBusNumber}
          direction={direction}
          setDirection={setDirection}
        />
      )}

      {view === "stops" && (
        <StopsList
          currentDeparture={currentDeparture}
          selectedStops={selectedStops}
          setSelectedStops={setSelectedStops}
          getCurrentSchedule={getCurrentSchedule}
          saveStops={saveStops}
          setView={setView}
          driverPhone={driverPhone}
          scheduleType={scheduleType}
          sentSMS={sentSMS}
          setSentSMS={setSentSMS}
          currentBusStops={getCurrentBusStops()}
          busNumber={busNumber}
          direction={direction}
        />
      )}

      {view === "settings" && (
        <Settings
          driverPhone={driverPhone}
          setDriverPhone={setDriverPhone}
          setView={setView}
        />
      )}
    </div>
  );
}

export default App;
