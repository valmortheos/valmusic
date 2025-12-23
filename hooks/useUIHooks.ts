
import { useState, useEffect } from 'react';

// Hook untuk mengganti teks secara berkala (misal: ValMusic <-> Timer)
export const useAlternatingText = (
  primaryText: string, 
  secondaryText: string | null, 
  intervalMs: number = 4000
) => {
  const [showPrimary, setShowPrimary] = useState(true);

  useEffect(() => {
    // Jika tidak ada teks kedua, selalu tampilkan teks utama
    if (!secondaryText) {
      setShowPrimary(true);
      return;
    }

    const interval = setInterval(() => {
      setShowPrimary((prev) => !prev);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [secondaryText, intervalMs]);

  return showPrimary ? primaryText : secondaryText;
};
