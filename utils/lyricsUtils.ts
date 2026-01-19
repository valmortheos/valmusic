
import { LyricLine } from '../types';

// Helper: Membaca File menjadi String Text
export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                resolve(e.target.result as string);
            } else {
                resolve('');
            }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};

// Fungsi Parsing LRC yang Robust + Support Plain Text
export const parseLyrics = (lrcString: string): LyricLine[] => {
  if (!lrcString || !lrcString.trim()) return [];

  const lines = lrcString.split('\n');
  const parsedLyrics: LyricLine[] = [];
  let hasTimestamps = false;
  
  // Regex support: [mm:ss.xx] atau [mm:ss:xx] atau [mm:ss.xxx]
  const timeRegex = /^\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\](.*)$/;

  lines.forEach(line => {
    const cleanLine = line.trim();
    if (!cleanLine) return;

    const match = cleanLine.match(timeRegex);
    if (match) {
      hasTimestamps = true;
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      let msStr = match[3] || "0";
      
      // Normalisasi milidetik
      let ms = parseInt(msStr);
      if (msStr.length === 2) ms *= 10; 
      if (msStr.length === 1) ms *= 100;

      const time = min * 60 + sec + (ms / 1000);
      const text = match[4].trim();

      // Izinkan teks kosong jika itu untuk spasi instrumen, tapi lebih baik filter kosong
      if (text) {
           parsedLyrics.push({ time, text });
      }
    }
  });

  // FALLBACK: Jika tidak ada timestamp ditemukan (Plain Text / .txt biasa)
  // Kita buat lirik statis dengan time: 0 agar tetap muncul di viewer
  if (!hasTimestamps && parsedLyrics.length === 0) {
      lines.forEach((line, index) => {
          const cleanLine = line.trim();
          if (cleanLine) {
              // Assign time increment kecil agar urutan terjaga, atau 0 semua
              // Kita assign time berdasarkan index agar tetap terurut
              parsedLyrics.push({ time: 0, text: cleanLine });
          }
      });
  }

  return parsedLyrics.sort((a, b) => a.time - b.time);
};

export const stringifyLyrics = (lyrics: LyricLine[]): string => {
  return lyrics.map(line => {
      // Jika time 0 (unsynced), kita bisa kembalikan text saja, tapi untuk konsistensi editor kita beri [00:00.00]
      // atau biarkan user yang menambah timestamp.
      const min = Math.floor(line.time / 60).toString().padStart(2, '0');
      const sec = Math.floor(line.time % 60).toString().padStart(2, '0');
      const ms = Math.floor((line.time % 1) * 100).toString().padStart(2, '0');
      return `[${min}:${sec}.${ms}] ${line.text}`;
  }).join('\n');
};
