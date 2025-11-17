import { useState } from "react";

function Settings({ driverPhone, setDriverPhone, setView }) {
  const [phoneInput, setPhoneInput] = useState(driverPhone);

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

  const requestNotifications = () => {
    if (window.OneSignal) {
      window.OneSignal.Slidedown.promptPush();
    }
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

        <div className="action-buttons">
          <button className="btn btn-save" onClick={savePhoneNumber}>
            💾 Zapisz numer
          </button>
          <button className="btn btn-save" onClick={requestNotifications}>
            🔔 Włącz powiadomienia
          </button>
        </div>
      </div>
    </>
  );
}

export default Settings;
