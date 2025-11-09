import { useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  scheduleSchool,
  scheduleVacation,
  DEFAULT_PHONE,
} from "./data/schedules";
import DeparturesList from "./components/DeparturesList";
import StopsList from "./components/StopsList";
import Settings from "./components/Settings";
import "./App.css";

function App() {
  const [view, setView] = useState("departures"); // 'departures', 'stops', 'settings'
  const [scheduleType, setScheduleType] = useState("vacation");
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

  const getCurrentSchedule = () => {
    return scheduleType === "school" ? scheduleSchool : scheduleVacation;
  };

  const selectDeparture = (time) => {
    setCurrentDeparture(time);
    const scheduleKey = `${scheduleType}_${time}`;
    setSelectedStops(savedSchedules[scheduleKey] || {});
    setView("stops");
  };

  const saveStops = () => {
    const scheduleKey = `${scheduleType}_${currentDeparture}`;
    setSavedSchedules({ ...savedSchedules, [scheduleKey]: selectedStops });
    setView("departures");
  };

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
