import { useState, useEffect, useRef, useCallback } from 'react';

export const useSleepTimer = (onTimerEnd: () => void) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // dalam detik
  const intervalRef = useRef<number | null>(null);
  const onTimerEndRef = useRef(onTimerEnd);

  // Selalu update ref callback agar tidak perlu restart interval jika function berubah
  useEffect(() => {
    onTimerEndRef.current = onTimerEnd;
  }, [onTimerEnd]);

  const startTimer = useCallback((minutes: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setTimeLeft(minutes * 60);

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          onTimerEndRef.current(); // Panggil callback
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const cancelTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeLeft(null);
  }, []);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    timeLeft,
    startTimer,
    cancelTimer
  };
};