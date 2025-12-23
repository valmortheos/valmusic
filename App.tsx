
import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { ViewState, LyricLine, Song } from './types';
import { saveSongToDB } from './utils/db';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useSleepTimer } from './hooks/useSleepTimer';
import { useLibrary } from './hooks/useLibrary';
import { usePreloadedSongs } from './hooks/usePreloadedSongs';
import MiniPlayer from './components/MiniPlayer';
import FullPlayer from './components/FullPlayer';
import AudioController from './components/AudioController';
import SleepTimerModal from './components/SleepTimerModal';
import MainContent from './components/MainContent';
import { Navigation } from './components/Views';
import { Header } from './components/Header';
import { ToastProvider } from './context/ToastContext'; // Import Provider

// Declare jsmediatags globally
declare global {
  interface Window {
    jsmediatags: any;
  }
}

// Komponen Utama App Internal
const ValMusicApp: React.FC = () => {
  // --- Custom Hook for Audio Logic ---
  const {
    songs, setSongs, currentSong, setCurrentSong, isPlaying, setIsPlaying,
    userProfile, setUserProfile, playSong, handleNext, handlePrev, togglePlay,
    isShuffle, toggleShuffle, repeatMode, toggleRepeat, deleteSong, colorPalette,
    toggleFavorite 
  } = useAudioPlayer();

  // --- Preloaded Songs Logic (NEW) ---
  usePreloadedSongs(songs, setSongs);

  // --- Library Logic (sekarang bisa akses useToast karena di dalam Provider) ---
  const { handleFileUpload } = useLibrary(songs, setSongs, playSong, currentSong);

  // --- Sleep Timer Hook ---
  const { timeLeft, startTimer, cancelTimer } = useSleepTimer(() => {
    setIsPlaying(false);
  });

  // --- UI State ---
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  
  // --- Waveform & Time Sync State ---
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  // --- Sync Timer ---
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        if(waveSurferRef.current && waveSurferRef.current.isPlaying()) {
          setCurrentTime(waveSurferRef.current.getCurrentTime() || 0);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset time on song change
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentSong?.id]);

  const handleSaveLyrics = async (id: string, lyrics: LyricLine[]) => {
    const updatedSongs = songs.map(s => s.id === id ? { ...s, lyrics } : s);
    setSongs(updatedSongs);
    
    const updatedSong = updatedSongs.find(s => s.id === id);
    if(updatedSong && !id.startsWith('preloaded-')) {
        await saveSongToDB(updatedSong);
    }

    if (currentSong?.id === id && updatedSong) {
         setCurrentSong(updatedSong);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] text-[#0f172a] overflow-hidden font-sans selection:bg-[var(--color-primary)] selection:text-white transition-colors duration-700">
      <Navigation view={view} setView={setView} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <main className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-8">
          <div className="flex-shrink-0 max-w-6xl mx-auto w-full">
             <Header 
               userProfile={userProfile} 
               setView={setView} 
               handleFileUpload={handleFileUpload}
             />
          </div>
          
          <MainContent 
            view={view}
            setView={setView}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            playSong={playSong}
            handleFileUpload={handleFileUpload}
            toggleFavorite={toggleFavorite}
            deleteSong={deleteSong}
            colorPalette={colorPalette}
          />
        </main>

        <MiniPlayer 
          currentSong={currentSong} 
          isPlaying={isPlaying} 
          onTogglePlay={togglePlay} 
          onNext={() => handleNext(false)} 
          onPrev={handlePrev} 
          onExpand={() => setIsPlayerExpanded(true)}
          colorPalette={colorPalette}
          songCount={songs.length}
        />
        
        <FullPlayer 
          currentSong={currentSong}
          isPlaying={isPlaying}
          isExpanded={isPlayerExpanded}
          onCollapse={() => setIsPlayerExpanded(false)}
          onNext={() => handleNext(false)}
          onPrev={handlePrev}
          onTogglePlay={togglePlay}
          onSaveLyrics={handleSaveLyrics}
          onDelete={deleteSong}
          waveSurferRef={waveSurferRef}
          currentTime={currentTime}
          duration={duration}
          setDuration={setDuration}
          isShuffle={isShuffle}
          toggleShuffle={toggleShuffle}
          repeatMode={repeatMode}
          toggleRepeat={toggleRepeat}
          onOpenTimer={() => setIsTimerModalOpen(true)}
          timeLeft={timeLeft} 
          colorPalette={colorPalette}
          onToggleFavorite={toggleFavorite}
        />

        <SleepTimerModal 
          isOpen={isTimerModalOpen}
          onClose={() => setIsTimerModalOpen(false)}
          onSetTimer={startTimer}
          onCancelTimer={cancelTimer}
          timeLeft={timeLeft}
        />

        {currentSong && (
          <AudioController 
            key={currentSong.id} 
            url={currentSong.url}
            isPlaying={isPlaying}
            onFinish={() => handleNext(true)}
            onReady={setDuration}
            setWaveSurferRef={(ws) => waveSurferRef.current = ws}
          />
        )}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// Wrapper Provider
const App: React.FC = () => {
    return (
        <ToastProvider>
            <ValMusicApp />
        </ToastProvider>
    );
}

export default App;
