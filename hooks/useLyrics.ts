
import { LyricLine } from '../types';
import { parseLyrics, stringifyLyrics } from '../utils/lyricsUtils';

export const useLyrics = () => {
  
  // Mencari index lirik aktif berdasarkan waktu saat ini
  const getActiveLyricIndex = (lyrics: LyricLine[] | undefined, currentTime: number): number => {
      if (!lyrics || lyrics.length === 0) return -1;
      
      // Cari index dimana waktu lirik <= waktu sekarang
      let activeIndex = -1;
      for (let i = 0; i < lyrics.length; i++) {
          if (lyrics[i].time <= currentTime) {
              activeIndex = i;
          } else {
              break;
          }
      }
      return activeIndex;
  };

  return { parseLyrics, stringifyLyrics, getActiveLyricIndex };
};
