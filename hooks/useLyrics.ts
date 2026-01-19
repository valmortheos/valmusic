
import { LyricLine } from '../types';
import { parseLyrics, stringifyLyrics } from '../utils/lyricsUtils';

export const useLyrics = () => {
  
  // Mencari index lirik aktif berdasarkan waktu saat ini
  // UPDATED: Menambahkan parameter timeOffset (default 0.25s) 
  // Agar lirik ke-trigger sedikit lebih cepat dari audio (Pre-roll feel)
  const getActiveLyricIndex = (lyrics: LyricLine[] | undefined, currentTime: number, timeOffset: number = 0.25): number => {
      if (!lyrics || lyrics.length === 0) return -1;
      
      // Waktu efektif yang digunakan untuk pengecekan (Waktu asli + Offset kompensasi)
      const adjustedTime = currentTime + timeOffset;

      // Jika waktu masih di awal sekali
      if (adjustedTime < lyrics[0].time) return -1;

      // Cari index menggunakan range dengan adjustedTime
      const index = lyrics.findIndex((line, i) => {
          const nextLine = lyrics[i + 1];
          // Logic: Apakah adjustedTime berada di rentang baris ini?
          if (!nextLine) return true; 
          return adjustedTime >= line.time && adjustedTime < nextLine.time;
      });

      // Fallback mechanism
      if (index === -1) {
          for (let i = lyrics.length - 1; i >= 0; i--) {
              if (lyrics[i].time <= adjustedTime + 0.1) { 
                  return i;
              }
          }
      }

      return index;
  };

  return { parseLyrics, stringifyLyrics, getActiveLyricIndex };
};
