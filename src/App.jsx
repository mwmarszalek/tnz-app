import { useState, useEffect } from "react";
import { database, ref, set, onValue } from "./firebase";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useAutoClear } from "./hooks/useAutoClear";
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
  const [view, setView] = useState("departures");
  const [scheduleType, setScheduleType] = useState("school");
  const [currentDeparture, setCurrentDeparture] = useState(null);
  const [selectedStops, setSelectedStops] = useState({});
  const [savedSchedules, setSavedSchedules] = useState({});
  const [sentSMS, setSentSMS] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const [driverPhone, setDriverPhone] = useLocalStorage(
    "driverPhone",
    DEFAULT_PHONE
  );

  // Nasłuchuj zmian savedSchedules w Firebase
  useEffect(() => {
    const schedulesRef = ref(database, "savedSchedules");
    const unsubscribe = onValue(schedulesRef, (snapshot) => {
      const data = snapshot.val();
      setSavedSchedules(data || {});
    });

    return () => unsubscribe();
  }, []);

  // Nasłuchuj zmian sentSMS w Firebase
  useEffect(() => {
    const smsRef = ref(database, "sentSMS");
    const unsubscribe = onValue(smsRef, (snapshot) => {
      const data = snapshot.val();
      setSentSMS(data || {});
    });

    return () => unsubscribe();
  }, []);

  // 🔄 Automatyczne czyszczenie danych o 19:25
  useAutoClear(() => {
    set(ref(database, "savedSchedules"), {});
    set(ref(database, "sentSMS"), {});
    setSelectedStops({});
    setView("departures");
  });

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
    const newSchedules = { ...savedSchedules, [scheduleKey]: selectedStops };
    setSavedSchedules(newSchedules);
    set(ref(database, "savedSchedules"), newSchedules);
    setView("departures");
  };

  const updateSentSMS = (newSMS) => {
    setSentSMS(newSMS);
    set(ref(database, "sentSMS"), newSMS);
  };

  const updateSavedSchedules = (newSchedules) => {
    setSavedSchedules(newSchedules);
    set(ref(database, "savedSchedules"), newSchedules);
  };

  return (
    <div className="container">
      {view === "departures" && (
        <DeparturesList
          scheduleType={scheduleType}
          setScheduleType={setScheduleType}
          getCurrentSchedule={getCurrentSchedule}
          savedSchedules={savedSchedules}
          setSavedSchedules={updateSavedSchedules}
          selectDeparture={selectDeparture}
          setView={setView}
          sentSMS={sentSMS}
          setSentSMS={updateSentSMS}
          scrollPosition={scrollPosition}
          setScrollPosition={setScrollPosition}
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
          setSentSMS={updateSentSMS}
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
