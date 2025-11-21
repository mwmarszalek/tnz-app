import { useState, useEffect } from "react";
import { requestNotificationPermission } from "../firebase-messaging";

function Settings({ driverPhone, setDriverPhone, setView }) {
  const [phoneInput, setPhoneInput] = useState(driverPhone);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Sprawdź przy starcie czy powiadomienia są włączone
  useEffect(() => {
    const fcmToken = localStorage.getItem("fcmToken");
    if (fcmToken) {
      setNotificationsEnabled(true);
    }
  }, []);

  const savePhoneNumber = () => {
    const input = phoneInput.trim();

    if (!input) {
      alert("Proszę wpisać numer telefonu!");
      return;
    }

    const cleanPhone = input.replace(/[^\d+]/g, "");

    if (cleanPhone.length < 9) {
      alert("Numer telefonu jest za krótki!");
      return;
    }

    setDriverPhone(cleanPhone);
    alert(`✅ Numer zapisany: ${cleanPhone}`);
    setView("departures");
  };

  const handleEnableNotifications = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setNotificationsEnabled(true);
        localStorage.setItem("fcmToken", token);
        alert("✅ Powiadomienia zostały włączone!");
      } else {
        alert(
          "❌ Nie udało się włączyć powiadomień. Sprawdź uprawnienia przeglądarki."
        );
      }
    } catch (error) {
      console.error("Błąd włączania powiadomień:", error);
      alert("❌ Wystąpił błąd podczas włączania powiadomień.");
    }
  };

  const handleDisableNotifications = () => {
    localStorage.removeItem("fcmToken");
    setNotificationsEnabled(false);
    alert("🔕 Powiadomienia zostały wyłączone");
  };

  return (
    <>
      <div className="header">
        <button className="back-btn" onClick={() => setView("departures")}>
          ← Powrót
        </button>
        <h1>⚙️ Ustawienia</h1>
        <p>Skonfiguruj aplikację</p>
      </div>

      <div className="settings-form">
        <div className="phone-info">
          <p>Aktualny numer telefonu:</p>
          <p>
            <strong>{driverPhone}</strong>
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="phone-input">Numer telefonu kierowcy:</label>
          <input
            type="tel"
            id="phone-input"
            placeholder="np. 502111222"
            maxLength="15"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
          />
        </div>

        <button
          className="btn btn-save"
          onClick={savePhoneNumber}
          style={{ width: "100%", marginBottom: "20px" }}
        >
          💾 Zapisz numer
        </button>

        {/* Sekcja powiadomień */}
        <div className="form-group" style={{ marginTop: "30px" }}>
          <label>Powiadomienia push</label>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
            {notificationsEnabled
              ? "Powiadomienia są włączone. Otrzymasz alerty o nowych rezerwacjach."
              : "Włącz powiadomienia, aby otrzymywać alerty o rezerwacjach."}
          </p>
          {!notificationsEnabled ? (
            <button
              className="btn btn-save"
              onClick={handleEnableNotifications}
              style={{ width: "100%" }}
            >
              🔔 Włącz powiadomienia
            </button>
          ) : (
            <button
              className="btn btn-clear"
              onClick={handleDisableNotifications}
              style={{ width: "100%" }}
            >
              🔕 Wyłącz powiadomienia
            </button>
          )}
        </div>

        {/* Info o powiadomieniach */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f0f4ff",
            borderRadius: "10px",
            fontSize: "14px",
            color: "#555",
          }}
        >
          <p>
            <strong>ℹ️ O powiadomieniach:</strong>
          </p>
          <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
            <li>Otrzymasz alert gdy ktoś zapisze rezerwację</li>
            <li>Powiadomienia działają nawet gdy aplikacja jest zamknięta</li>
            <li>Możesz je wyłączyć w każdej chwili</li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Settings;
