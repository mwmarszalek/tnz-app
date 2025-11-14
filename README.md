# 🚌 Transport Na Żądanie - Aplikacja PWA

Aplikacja mobilna do zarządzania przystankami autobusowymi dla transportu na żądanie.

## 📋 Opis

Aplikacja umożliwia:

- 📍 Wybór przystanków dla konkretnych kursów autobusowych
- 📱 Wysyłanie SMS do kierowcy z listą przystanków
- 💾 Automatyczne zapisywanie wyborów
- 📊 Generowanie raportów dziennych do Google Sheets
- 🔄 Przełączanie między rozkładami (dni szkolne/wolne)

## 🚀 Technologie

- **React** - biblioteka UI
- **Vite** - bundler i dev server
- **PWA** - Progressive Web App (działa offline)
- **Google Apps Script** - integracja z Google Sheets
- **Netlify** - hosting

## 📦 Instalacja

```bash
# Sklonuj repozytorium
git clone [URL_REPO]

# Przejdź do katalogu
cd bus-app

# Zainstaluj zależności
npm install

# Uruchom lokalnie
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

## 🏗️ Build

```bash
# Build produkcyjny
npm run build

# Podgląd buildu
npm run preview
```

## 🌐 Wdrożenie

### Netlify (automatyczne)

Aplikacja jest automatycznie wdrażana na Netlify po każdym push do brancha `main`.

**URL produkcyjny:** https://tnz-app.netlify.app

### Manualne wdrożenie

```bash
# Build
npm run build

# Deploy przez Netlify CLI
netlify deploy --prod
```

## 📱 Instalacja jako PWA

### Android:

1. Otwórz aplikację w Chrome
2. Menu (⋮) → "Dodaj do ekranu głównego"
3. Aplikacja zainstaluje się jako PWA

### iOS:

1. Otwórz aplikację w Safari
2. Przycisk "Udostępnij" → "Dodaj do ekranu początkowego"

## 🎯 Funkcjonalności

### 1. Lista Odjazdów

- Wyświetlanie wszystkich kursów z aktualnego rozkładu
- Przełączanie między "Dni szkolne" i "Dni wolne"
- Badge pokazujący liczbę zaznaczonych przystanków
- Badge "SMS wysłany" dla kursów z wysłanym SMS
- Kopiowanie listy przystanków
- Czyszczenie wybranych przystanków

### 2. Wybór Przystanków

- Lista dostępnych przystanków dla wybranego kursu
- Wyświetlanie godzin odjazdu z każdego przystanku
- Automatyczne zapisywanie przy każdej zmianie
- Wysyłanie SMS do kierowcy (nawet bez zaznaczonych przystanków)
- Menu kontekstowe (⋮) z opcjami:
  - Kopiowanie listy
  - Czyszczenie przystanków

### 3. Raport Dzienny

- Formularz z danymi:
  - Liczba pasażerów
  - Dyspozytorzy
- Wysyłanie danych do Google Sheets
- Automatyczne czyszczenie wszystkich danych po wysłaniu

### 4. Ustawienia

- Zmiana numeru telefonu kierowcy
- Zapisywanie w localStorage

### 5. Automatyczne Funkcje

- Auto-save przy każdej zmianie przystanków
- Zapisywanie przez przycisk "Powrót"
- Zapisywanie przy odświeżeniu strony
- Zapamiętywanie pozycji scrolla
- Automatyczne czyszczenie danych o 19:25

## 📂 Struktura Projektu

```
bus-app/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker
│   └── icon-*.png             # Ikony PWA
├── src/
│   ├── components/
│   │   ├── DeparturesList.jsx # Lista odjazdów
│   │   ├── StopsList.jsx      # Lista przystanków
│   │   ├── Settings.jsx       # Ustawienia
│   │   └── DailyReportModal.jsx # Modal raportu
│   ├── hooks/
│   │   ├── useLocalStorage.js # Hook do localStorage
│   │   └── useAutoClear.js    # Hook czyszczenia o 19:25
│   ├── utils/
│   │   └── helpers.js         # Funkcje pomocnicze
│   ├── data/
│   │   └── schedules.js       # Rozkłady jazdy
│   ├── App.jsx                # Główny komponent
│   ├── App.css                # Style
│   └── main.jsx               # Entry point
├── index.html                 # HTML template
├── netlify.toml               # Konfiguracja Netlify
└── package.json               # Dependencies
```

## 🔑 Kluczowe Komponenty

### `App.jsx`

Główny komponent zarządzający stanem aplikacji:

- `scheduleType` - typ rozkładu (school/vacation)
- `savedSchedules` - zapisane przystanki
- `sentSMS` - kursy z wysłanym SMS
- `driverPhone` - numer telefonu kierowcy

### `DeparturesList.jsx`

Lista wszystkich kursów z funkcjami:

- Wyświetlanie badge'y (przystanki, SMS)
- Kopiowanie i czyszczenie
- Raport dzienny

### `StopsList.jsx`

Wybór przystanków dla kursu:

- Automatyczne zapisywanie
- Wysyłanie SMS
- Menu kontekstowe

### `DailyReportModal.jsx`

Formularz raportu dziennego:

- Liczba pasażerów
- Dyspozytorzy
- Wysyłanie do Google Sheets

## 🗄️ localStorage

Aplikacja zapisuje dane lokalnie:

- `busSchedules` - zaznaczone przystanki
- `sentSMS` - informacje o wysłanych SMS
- `driverPhone` - numer telefonu kierowcy

**Format klucza:** `{scheduleType}_{departureTime}`  
**Przykład:** `vacation_07:10`

## 📊 Integracja Google Sheets

### Konfiguracja:

1. Otwórz arkusz: [Link do arkusza](https://docs.google.com/spreadsheets/d/1Ra-3FZg0wH0wMDxNmZY4jMo_vTyOB7EMB3s8DHEQmJM/)
2. Extensions → Apps Script
3. Wklej kod z `INTEGRATION.md` (jeśli jest)
4. Deploy → Web app
5. Skopiuj URL i zaktualizuj w `DailyReportModal.jsx`

### Struktura danych w Sheets:

| Data             | Liczba pasażerów | Dyspozytorzy | Typ rozkładu | Przystanki                              |
| ---------------- | ---------------- | ------------ | ------------ | --------------------------------------- |
| 2025-01-15 14:30 | 25               | Jan, Anna    | Dni szkolne  | 07:10: SKM (07:10), Metalowa (07:12)... |

## 🔧 Konfiguracja

### Zmiana rozkładów jazdy

Edytuj plik `src/data/schedules.js`:

```javascript
export const scheduleSchool = {
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

### Zmiana godziny automatycznego czyszczenia

W `src/hooks/useAutoClear.js`:

```javascript
if (hours === 19 && minutes === 25) {
  // Zmień godzinę tutaj
}
```

## 🐛 Rozwiązywanie Problemów

### PWA nie instaluje się

- Sprawdź czy używasz HTTPS
- Sprawdź czy ikony istnieją (192x192 i 512x512)
- Wyczyść cache przeglądarki

### SMS nie wysyła się

- Sprawdź numer telefonu w Ustawieniach
- Testuj na prawdziwym urządzeniu (nie emulator)

### Dane nie zapisują się

```javascript
// Sprawdź localStorage w DevTools:
localStorage.getItem("busSchedules");
localStorage.getItem("sentSMS");
```

### Biały ekran na iOS

- Wyczyść cache: Settings → Safari → Clear History
- Sprawdź console w Safari (iPhone + Mac: Safari → Develop)

## 📝 TODO / Przyszłe Funkcje

- [ ] Powiadomienia push o zbliżających się kursach
- [ ] Historia raportów w aplikacji
- [ ] Eksport raportów do PDF
- [ ] Dark mode
- [ ] Multi-language support

## 👥 Autorzy

- **Michał Marszałek** - Główny developer

## 📄 Licencja

MIT License - możesz swobodnie używać i modyfikować.

## 🤝 Wsparcie

W razie problemów:

1. Sprawdź sekcję "Rozwiązywanie Problemów"
2. Otwórz issue na GitHub
3. Skontaktuj się z developerem

---

**Wersja:** 1.0.5
**Ostatnia aktualizacja:** Listopad 2025
