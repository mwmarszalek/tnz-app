import { useState, useEffect, useCallback } from "react";
import { database, ref, set, onValue } from "./firebase";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useAutoClear } from "./hooks/useAutoClear";
import { getScheduleKey } from "./utils/helpers";
import {
  scheduleSchool904,
  scheduleVacation904,
  scheduleSchool908Dir1,
  scheduleSchool908Dir2,
  scheduleVacation908Dir1,
  scheduleVacation908Dir2,
  busStops,
  DEFAULT_PHONE,
} from "./data/schedules";
import DeparturesList from "./components/DeparturesList";
import StopsList from "./components/StopsList";
import Settings from "./components/Settings";
import {
  requestNotificationPermission,
  onMessageListener,
} from "./firebase-messaging";
import "./App.css";

function App() {
  const [view, setView] = useState("departures");
  const [scheduleType, setScheduleType] = useState("school");
  const [busNumber, setBusNumber] = useState("904");
  const [direction, setDirection] = useState("1");
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

  useEffect(() => {
    const smsRef = ref(database, "sentSMS");
    const unsubscribe = onValue(smsRef, (snapshot) => {
      const data = snapshot.val();
      setSentSMS(data || {});
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    requestNotificationPermission();

    onMessageListener()
      .then((payload) => {
        console.log("Otrzymano powiadomienie:", payload);
        // Pokaż powiadomienie w UI
      })
      .catch((err) => console.log("Błąd:", err));
  }, []);

  useEffect(() => {
    document.body.className = `bus-${busNumber}`;
  }, [busNumber]);

  useAutoClear(() => {
    set(ref(database, "savedSchedules"), {});
    set(ref(database, "sentSMS"), {});
    setSelectedStops({});
    setView("departures");
  });

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
    const newSchedules = { ...savedSchedules, [scheduleKey]: selectedStops };
    setSavedSchedules(newSchedules);
    set(ref(database, "savedSchedules"), newSchedules);
    setView("departures");
  };

  const updateSentSMS = (newSMS) => {
    setSentSMS(newSMS);
    set(ref(database, "sentSMS"), newSMS);
  };

  const updateSavedSchedules = useCallback((newSchedules) => {
    setSavedSchedules(newSchedules);
    set(ref(database, "savedSchedules"), newSchedules);
  }, []);

  return (
    <div className={`container bus-${busNumber}`}>
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
          setSentSMS={updateSentSMS}
          savedSchedules={savedSchedules}
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
