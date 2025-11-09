import { useEffect } from "react";

/**
 * Custom hook do automatycznego czyszczenia danych o 19:25
 * @param {Function} onClear - funkcja wywoływana przy czyszczeniu
 */
export function useAutoClear(onClear) {
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if (hours === 19 && minutes === 25) {
        console.log("🔄 Automatyczne czyszczenie danych o 19:25");
        onClear();
        
        // Opcjonalnie: pokaż alert użytkownikowi
        alert("🔄 Dane zostały automatycznie wyczyszczone o 19:25");
      }
    };

    // Sprawdzaj co minutę
    const interval = setInterval(checkTime, 60 * 1000);

    // Sprawdź od razu przy montowaniu
    checkTime();

    // Cleanup
    return () => clearInterval(interval);
  }, [onClear]);
}
