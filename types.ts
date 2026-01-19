
export interface LyricWord {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
  words?: LyricWord[]; // Optional: For word-by-word sync
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url: string; // blob url or http url
  lyricsUrl?: string; // New: Dynamic lyrics URL
  file?: File; // Optional now, because online songs don't have File object
  coverArt?: string; // URL for cover art
  lyrics?: LyricLine[];
  format?: string; // e.g., 'MP3', 'WAV', 'M4A'
  bitrate?: string; // e.g., '320kbps'
  fileSize?: string; // e.g. '4.2 MB'
  year?: string;
  genre?: string;
  sampleRate?: string;
  isFavorite?: boolean; 
  isOnline?: boolean; // New flag for online songs
  playCount?: number; // New: Counter seberapa sering lagu diputar
}

export interface AppSettings {
  minDurationFilter: number; // dalam detik (misal: 60 untuk 1 menit)
  enableDurationFilter: boolean;
}

export interface UserProfile {
  name: string;
  avatar: string;
  themeColor: string; // Hex code
  settings: AppSettings; // Added settings object
}

export enum ViewState {
  HOME = 'HOME',
  ALBUM = 'ALBUM',
  ARTIST = 'ARTIST',
  LIBRARY = 'LIBRARY',
  SETTINGS = 'SETTINGS',
  SEARCH = 'SEARCH' // Added Search View
}

export interface ThemeOption {
  name: string;
  color: string;
  hex: string;
}
