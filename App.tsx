
import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { ViewState, LyricLine, Song } from './types';
import { saveSongToDB } from './utils/db';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useSleepTimer } from './hooks/useSleepTimer';
import { useLibrary } from './hooks/useLibrary';
import { usePreloadedSongs } from './hooks/usePreloadedSongs';
import { useCloudLibrary } from './hooks/useCloudLibrary'; 
import MiniPlayer from './components/MiniPlayer';
import FullPlayer from './components/FullPlayer';
import AudioController from './components/AudioController';
import SleepTimerModal from './components/SleepTimerModal';
import MainContent from './components/MainContent';
import { Navigation } from './components/Views';
import { Header } from './components/Header';
import { ToastProvider } from './context/ToastContext';
import OnboardingModal from './components/onboarding/OnboardingModal'; // Import Baru

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

  // --- 1. Load Local Assets (assets/music) ---
  usePreloadedSongs(songs, setSongs);

  // --- 2. Load Cloud Streaming Songs (Vercel Blob) - NEW ---
  useCloudLibrary(songs, setSongs);

  // --- Library Logic ---
  const { handleFileUpload, handleFolderScan, isScanning } = useLibrary(songs, setSongs, playSong, currentSong);

  // --- Sleep Timer Hook ---
  const { timeLeft, startTimer, cancelTimer } = useSleepTimer(() => {
    setIsPlaying(false);
  });

  // --- UI State ---
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  
  // --- Loading/Buffering State (Interactive Loading) ---
  const [isBuffering, setIsBuffering] = useState(false);
  
  // --- Waveform & Time Sync State ---
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  // Reset buffering & time on song change
  useEffect(() => {
    if (currentSong) {
        setIsBuffering(true); // Mulai loading saat lagu berganti
        setCurrentTime(0);
        setDuration(0);
    }
  }, [currentSong?.id]);

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

  const handleSaveLyrics = async (id: string, lyrics: LyricLine[]) => {
    const updatedSongs = songs.map(s => s.id === id ? { ...s, lyrics } : s);
    setSongs(updatedSongs);
    
    const updatedSong = updatedSongs.find(s => s.id === id);
    if(updatedSong && !id.startsWith('preloaded-') && !id.startsWith('cloud-')) {
        await saveSongToDB(updatedSong);
    }

    if (currentSong?.id === id && updatedSong) {
         setCurrentSong(updatedSong);
    }
  };

  // Update song duration & Stop Buffering
  const handleAudioReady = (d: number) => {
      setDuration(d);
      setIsBuffering(false); // Audio siap, matikan loading
      
      if (currentSong && currentSong.duration === 0) {
          const updatedSong = { ...currentSong, duration: d };
          
          setSongs(prev => prev.map(s => s.id === currentSong.id ? updatedSong : s));
          setCurrentSong(updatedSong);
          
          if(!currentSong.id.startsWith('preloaded-') && !currentSong.isOnline) {
            saveSongToDB(updatedSong);
          }
      }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] text-[#0f172a] overflow-hidden font-sans selection:bg-[var(--color-primary)] selection:text-white transition-colors duration-700">
      
      {/* Onboarding Modal (Overlay) */}
      <OnboardingModal />

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
            handleFolderScan={handleFolderScan}
            isScanning={isScanning}
          />
        </main>

        <MiniPlayer 
          currentSong={currentSong} 
          isPlaying={isPlaying} 
          isBuffering={isBuffering}
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
          isBuffering={isBuffering}
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
            onReady={handleAudioReady}
            setWaveSurferRef={(ws) => waveSurferRef.current = ws}
          />
        )}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Animation Blob for Onboarding */
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
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
