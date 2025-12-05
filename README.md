# 🚌 Transport Na Żądanie - Aplikacja PWA

Aplikacja mobilna do zarządzania przystankami autobusowymi dla transportu na żądanie (linie 904 i 908 w Szczecinie).

**URL produkcyjny:** https://tnz-app.netlify.app

## 🎯 Główne Funkcje

- 📍 Wybór przystanków dla konkretnych kursów
- 📱 Wysyłanie SMS do kierowcy z listą przystanków
- 💾 Automatyczne zapisywanie wyborów
- 📊 Raporty dzienne do Google Sheets
- 🔄 Przełączanie między rozkładami (dni szkolne/wakacje)
- 🗺️ Śledzenie lokalizacji kierowcy GPS na mapie
- 🔔 Powiadomienia push o zbliżających się kursach

## 🚀 Szybki Start

```bash
# Instalacja
npm install

# Uruchomienie lokalnie
npm run dev

# Build produkcyjny
npm run build
```

## 📱 Instalacja jako PWA

**Android:** Chrome → Menu (⋮) → "Dodaj do ekranu głównego"
**iOS:** Safari → Udostępnij → "Dodaj do ekranu początkowego"

## 🛠️ Technologie

- React 19.1 + Vite
- Firebase (Realtime Database, Cloud Functions, Cloud Messaging)
- Leaflet + OpenStreetMap (mapy)
- PWA (Service Workers)
- Netlify (hosting + CI/CD)

## 📂 Struktura Projektu

```
src/
├── components/
│   ├── DeparturesList.jsx    # Lista odjazdów
│   ├── StopsList.jsx          # Wybór przystanków
│   ├── DriverMap.jsx          # Mapa GPS kierowcy
│   ├── DailyReportModal.jsx   # Raport dzienny
│   └── Settings.jsx           # Ustawienia
├── data/
│   └── schedules.js           # Rozkłady jazdy (904, 908)
├── hooks/
│   └── useLocalStorage.js     # Hook localStorage
└── App.jsx                    # Główny komponent
```

## 🔧 Konfiguracja

### Zmiana rozkładów jazdy

Edytuj `src/data/schedules.js`:

```javascript
export const scheduleSchool904 = {
  "07:10": {
    "SKM Podjuchy": "07:10",
    Metalowa: "07:12",
    // ...
  },
};
```

### Zmiana domyślnego numeru telefonu

W `src/data/schedules.js`:

```javascript
export const DEFAULT_PHONE = "572138563";
```

### Zmienne środowiskowe

Utwórz `.env.production`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_DATABASE_URL=your_db_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

## 📊 Integracja Google Sheets

Aplikacja wysyła raporty dzienne do Google Sheets przez Google Apps Script webhook.

**Arkusz:** [Link do arkusza](https://docs.google.com/spreadsheets/d/1Ra-3FZg0wH0wMDxNmZY4jMo_vTyOB7EMB3s8DHEQmJM/)

Dane w arkuszu:

- Data i godzina
- Liczba pasażerów
- Dyspozytorzy
- Typ rozkładu
- Lista przystanków

## 🗄️ Przechowywanie Danych

**Firebase Realtime Database:**

- `savedSchedules/{key}` - zaznaczone przystanki
- `sentSMS/{key}` - status wysłanych SMS
- `driverLocation` - pozycja GPS kierowcy
- `driverGPSEnabled` - status online/offline kierowcy
- `fcmTokens/{token}` - tokeny urządzeń dla powiadomień

**localStorage:**

- `driverPhone` - numer telefonu kierowcy

## 🔔 Firebase Cloud Functions

Automatyczne powiadomienia push 5 minut przed odjazdem:

- Działa Pon-Pt, 6:00-16:00 (czas warszawski)
- Sprawdza rozkład co minutę
- Wysyła powiadomienia FCM do zarejestrowanych urządzeń

## 🐛 Rozwiązywanie Problemów

**PWA nie instaluje się:**

- Sprawdź HTTPS
- Wyczyść cache przeglądarki

**SMS nie wysyła się:**

- Sprawdź numer w Ustawieniach
- Testuj na prawdziwym urządzeniu

**Dane nie zapisują się:**

```javascript
// Sprawdź w DevTools Console:
localStorage.getItem("driverPhone");
```

## 🌐 Wdrożenie

Aplikacja automatycznie wdraża się na Netlify po push do `main`.

**Manualne wdrożenie:**

```bash
npm run build
netlify deploy --prod
```

## 👥 Autor

**Michał Marszałek**

## 📄 Licencja

MIT License

---

**Wersja:** 1.0.5
**Ostatnia aktualizacja:** Grudzień 2025
