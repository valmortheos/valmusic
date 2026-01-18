
import { useState, useEffect, useCallback } from 'react';
import { Song, UserProfile } from '../types';
import { saveSongToDB, getAllSongsFromDB, deleteSongFromDB } from '../utils/db';
import { getColorPalette } from '../utils/themeUtils';
import { THEME_OPTIONS } from '../constants';

export type RepeatMode = 'OFF' | 'ALL' | 'ONE';

export const useAudioPlayer = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // New States
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('OFF');
  const [colorPalette, setColorPalette] = useState<string[]>(['#6366f1', '#4f46e5', '#818cf8']);
  
  // History untuk navigasi Back yang lebih pintar saat Shuffle
  const [history, setHistory] = useState<string[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Pengguna ValMusic',
    avatar: "https://picsum.photos/200/200",
    themeColor: THEME_OPTIONS[0].hex,
    settings: {
        minDurationFilter: 60, // Default 60 detik (1 menit)
        enableDurationFilter: false // Default mati
    }
  });

  // Load songs on mount
  useEffect(() => {
    const loadSavedSongs = async () => {
      try {
        const savedSongs = await getAllSongsFromDB();
        if (savedSongs.length > 0) setSongs(savedSongs);
      } catch (error) {
        console.error("Gagal memuat lagu lokal:", error);
      }
    };
    loadSavedSongs();
  }, []);

  // Update theme color globally
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', userProfile.themeColor);
  }, [userProfile.themeColor]);

  // Sync currentSong with songs list updates (e.g. metadata loaded)
  // FIX: Ini penting agar saat metadata (Cover/Judul) dari Cloud terload, player UI ikut update
  useEffect(() => {
    if (currentSong) {
      const updatedSong = songs.find(s => s.id === currentSong.id);
      // Hanya update jika referensi objek berbeda tetapi ID sama
      if (updatedSong && updatedSong !== currentSong) {
        setCurrentSong(updatedSong);
        
        // Update palette jika cover art berubah
        if (updatedSong.coverArt !== currentSong.coverArt) {
             if (updatedSong.coverArt) {
                getColorPalette(updatedSong.coverArt).then(palette => {
                    setColorPalette(palette);
                    setUserProfile(prev => ({ ...prev, themeColor: palette[0] }));
                });
             }
        }
      }
    }
  }, [songs]);

  const playSong = useCallback(async (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(prev => !prev);
    } else {
      // Add to history before changing
      if (currentSong) {
        setHistory(prev => {
            const newHist = [...prev, currentSong.id];
            // Batasi history agar tidak terlalu panjang
            if (newHist.length > 20) return newHist.slice(newHist.length - 20);
            return newHist;
        });
      }

      setIsPlaying(false);
      setCurrentSong(song);
      setTimeout(() => setIsPlaying(true), 0);

      // Theme logic
      if (song.coverArt) {
        const palette = await getColorPalette(song.coverArt);
        setColorPalette(palette);
        setUserProfile(prev => ({ ...prev, themeColor: palette[0] }));
      } else {
        const defaultPalette = ['#6366f1', '#4f46e5', '#818cf8'];
        setColorPalette(defaultPalette);
        setUserProfile(prev => ({ ...prev, themeColor: '#6366f1' }));
      }
    }
  }, [currentSong]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'OFF') return 'ALL';
      if (prev === 'ALL') return 'ONE';
      return 'OFF';
    });
  }, []);

  const toggleFavorite = useCallback(async (songId: string) => {
    const targetSong = songs.find(s => s.id === songId);
    if (!targetSong) return;

    const updatedSong = { ...targetSong, isFavorite: !targetSong.isFavorite };
    
    // Update State
    setSongs(prev => prev.map(s => s.id === songId ? updatedSong : s));
    if (currentSong?.id === songId) {
        setCurrentSong(updatedSong);
    }

    // Update DB
    await saveSongToDB(updatedSong);
  }, [songs, currentSong]);

  const handleNext = useCallback((isAutoFinish: boolean = false) => {
    if (!currentSong || songs.length === 0) return;

    // Logika Repeat One hanya berlaku jika lagu selesai sendiri (Auto Finish)
    // Jika user klik tombol Next, tetap pindah lagu.
    if (isAutoFinish && repeatMode === 'ONE') {
        // Trick untuk replay: set playing false lalu true trigger re-render di controller
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 50);
        return;
    }

    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    let nextIndex;

    if (isShuffle) {
        if (songs.length <= 1) {
            nextIndex = 0;
        } else {
            // Pastikan lagu berikutnya tidak sama dengan lagu sekarang
            do {
                nextIndex = Math.floor(Math.random() * songs.length);
            } while (nextIndex === currentIndex);
        }
    } else {
        // Sequential
        if (repeatMode === 'OFF' && currentIndex === songs.length - 1 && isAutoFinish) {
            // Jika repeat off dan sudah di akhir playlist, stop.
            setIsPlaying(false);
            return; 
        }
        nextIndex = (currentIndex + 1) % songs.length;
    }

    playSong(songs[nextIndex]);
  }, [currentSong, songs, playSong, isShuffle, repeatMode]);

  const handlePrev = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    
    // Jika Shuffle aktif, tombol back kembali ke history (jika ada)
    if (isShuffle && history.length > 0) {
        const lastSongId = history[history.length - 1];
        const lastSong = songs.find(s => s.id === lastSongId);
        
        // Remove last from history
        setHistory(prev => prev.slice(0, -1));

        if (lastSong) {
             // Manual set current song tanpa nambah history lagi (untuk prevent loop history)
             setIsPlaying(false);
             setCurrentSong(lastSong);
             setTimeout(() => setIsPlaying(true), 0);
             return;
        }
    }

    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex]);
  }, [currentSong, songs, playSong, isShuffle, history]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const deleteSong = useCallback(async (id: string) => {
     try {
         await deleteSongFromDB(id);
         setSongs(prev => {
             const newSongs = prev.filter(s => s.id !== id);
             return newSongs;
         });

         if (currentSong?.id === id) {
             setIsPlaying(false);
             setCurrentSong(null);
         }
     } catch (e) {
         console.error("Gagal menghapus lagu", e);
         alert("Gagal menghapus lagu dari database browser.");
     }
  }, [currentSong]);

  return {
    songs,
    setSongs,
    currentSong,
    setCurrentSong,
    isPlaying,
    setIsPlaying,
    userProfile,
    setUserProfile,
    playSong,
    handleNext, // Sekarang menerima parameter optional boolean
    handlePrev,
    togglePlay,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    deleteSong,
    colorPalette,
    toggleFavorite
  };
};
