
import React, { useState, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { 
  Play, Pause, SkipBack, SkipForward, Music, 
  ChevronDown, MoreVertical, Mic2, Heart,
  Shuffle, Repeat, Repeat1, Loader
} from './Icons';
import ProgressBar from './ProgressBar';
import PlayerMenu from './PlayerMenu';
import SongInfoModal from './SongInfoModal';
import MarqueeText from './MarqueeText';
import AnimatedBackground from './AnimatedBackground';
import LyricsManager from './LyricsManager';
import { Song, LyricLine } from '../types';
import { RepeatMode } from '../hooks/useAudioPlayer';
import { useAlternatingText } from '../hooks/useUIHooks';

interface FullPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isBuffering?: boolean; // New Prop
  isExpanded: boolean;
  onCollapse: () => void;
  onNext: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
  onSaveLyrics: (id: string, lyrics: LyricLine[]) => void;
  onDelete: (id: string) => void;
  
  waveSurferRef: React.MutableRefObject<WaveSurfer | null>;
  currentTime: number;
  duration: number;
  setDuration: (d: number) => void;

  isShuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  toggleRepeat: () => void;
  
  onOpenTimer: () => void;
  timeLeft: number | null;

  colorPalette?: string[];
  onToggleFavorite: (id: string) => void;
}

const FullPlayer: React.FC<FullPlayerProps> = ({
  currentSong, isPlaying, isBuffering = false, isExpanded, onCollapse, 
  onNext, onPrev, onTogglePlay, onSaveLyrics, onDelete,
  waveSurferRef, currentTime, duration, setDuration,
  isShuffle, toggleShuffle, repeatMode, toggleRepeat,
  onOpenTimer, timeLeft, colorPalette, onToggleFavorite
}) => {
  const [showLyrics, setShowLyrics] = useState(false);
  const [isEditingLyrics, setIsEditingLyrics] = useState(false); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [textColorIndex, setTextColorIndex] = useState(0);

  const primaryColor = colorPalette?.[0] || '#6366f1';

  useEffect(() => {
    if (!colorPalette || colorPalette.length === 0) return;
    const interval = setInterval(() => {
        setTextColorIndex((prev) => (prev + 1) % colorPalette.length);
    }, 2000); 
    return () => clearInterval(interval);
  }, [colorPalette]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const secs = s % 60;
    return `Sisa Waktu: ${m}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const bottomLabel = useAlternatingText(
    isBuffering ? "Memuat Audio..." : "ValMusic", 
    timeLeft !== null ? formatTimer(timeLeft) : null,
    4000
  );

  useEffect(() => {
    setShowLyrics(false);
    setIsEditingLyrics(false);
    setIsMenuOpen(false);
  }, [currentSong?.id]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (time: number) => {
      if(waveSurferRef.current && !isBuffering) {
          waveSurferRef.current.setTime(time);
      }
  };

  if (!currentSong) return null;

  const noTapHighlight = { WebkitTapHighlightColor: 'transparent' };

  return (
    <>
    <div className={`fixed inset-0 z-[60] flex flex-col bg-[#f8fafc] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'translate-y-0' : 'translate-y-[110%]'}`} style={{ willChange: 'transform' }}>
         
         <AnimatedBackground palette={colorPalette} />
         
         <div className="relative z-10 flex flex-col h-full px-6 md:px-8 max-w-md mx-auto w-full safe-area-top safe-area-bottom">
            
            {/* 1. Header */}
            <div className="relative flex items-center justify-between mb-4 flex-shrink-0 w-full min-h-[44px]">
               <button 
                onClick={onCollapse} 
                className="relative z-20 p-2.5 bg-gray-100/50 backdrop-blur-md rounded-full hover:bg-gray-200 transition-colors text-gray-800 focus:outline-none border border-gray-200/50 shadow-sm"
                style={noTapHighlight}
               >
                 <ChevronDown size={22} />
               </button>

               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-12">
                 <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Sedang Diputar</span>
               </div>

               <button 
                 onClick={() => setIsMenuOpen(true)} 
                 className={`relative z-20 p-2.5 rounded-full transition-all shadow-sm focus:outline-none bg-gray-100/50 text-gray-800 hover:bg-gray-200`}
                 style={noTapHighlight}
               >
                 <MoreVertical size={22} />
               </button>
            </div>

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col relative min-h-0 w-full justify-center">
              {showLyrics ? (
                <LyricsManager 
                    song={currentSong}
                    currentTime={currentTime}
                    isEditing={isEditingLyrics}
                    setIsEditing={setIsEditingLyrics}
                    onSave={onSaveLyrics}
                    onSeek={handleSeek}
                />
              ) : (
                <div className="flex flex-col w-full h-full animate-fade-in justify-center pb-8">
                   {/* Cover Art Container */}
                   <div className="flex-shrink-1 flex items-center justify-center w-full mb-2 mt-4">
                       <div className="relative w-[65%] aspect-square rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden group border border-white/20 transform-gpu">
                         {/* Loading Overlay */}
                         <div className={`absolute inset-0 z-20 bg-black/20 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${isBuffering ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                 <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                         </div>
                         
                         {currentSong.coverArt ? (
                           <img src={currentSong.coverArt} className={`w-full h-full object-cover transition-transform duration-[3s] ${isBuffering ? 'scale-105' : 'group-hover:scale-110'}`} alt="Art" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                             <Music size={80} />
                           </div>
                         )}
                       </div>
                   </div>
                   
                   {/* Song Details */}
                   <div className="flex flex-col items-center justify-center w-full px-4 flex-shrink-0 mt-8">
                      <div className="w-full max-w-[90%] mx-auto mb-0 flex justify-center">
                        <MarqueeText 
                          text={currentSong.title} 
                          className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight text-center"
                          speed={15}
                          delay={2}
                        />
                      </div>
                      <div className="w-full flex justify-center px-2 mt-1">
                         <p className="text-sm font-medium text-gray-500 text-center truncate">
                            {currentSong.artist}
                         </p>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* 3. Controls */}
            <div className="flex-shrink-0 w-full mb-4 px-2 relative z-20">
               <div className="mb-6 h-14 flex flex-col justify-center"> {/* Fixed Height Container */}
                  <div className={`transition-opacity duration-300 ${isBuffering ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                      <ProgressBar 
                        currentTime={currentTime} 
                        duration={duration} 
                        onSeek={handleSeek} 
                        color={primaryColor}
                      />
                  </div>
                  
                  <div className="flex justify-between text-xs font-bold text-gray-400 font-mono mt-1 px-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{isBuffering ? '--:--' : formatTime(duration)}</span>
                  </div>
               </div>

               <div className="flex justify-between items-center w-full px-2">
                  <button 
                    onClick={toggleShuffle} 
                    className={`p-3 rounded-full transition-all focus:outline-none hover:bg-white/40 active:scale-95`}
                    style={{ 
                        color: isShuffle ? primaryColor : '#9ca3af',
                        backgroundColor: isShuffle ? `${primaryColor}15` : 'transparent',
                        ...noTapHighlight 
                    }}
                  >
                    <Shuffle size={20} />
                  </button>

                  <div className="flex items-center gap-6 md:gap-8">
                      <button 
                        onClick={onPrev} 
                        disabled={isBuffering}
                        className="p-3 hover:scale-110 active:scale-95 focus:outline-none transition-transform disabled:opacity-50"
                        style={{ 
                            color: primaryColor, 
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                            ...noTapHighlight 
                        }}
                      >
                        <SkipBack size={32} fill="currentColor" />
                      </button>

                      <button 
                       onClick={onTogglePlay}
                       disabled={isBuffering}
                       className="w-20 h-20 rounded-full flex items-center justify-center hover:scale-105 transition-all active:scale-95 focus:outline-none border-4 border-white/50"
                       style={{ 
                           backgroundColor: primaryColor,
                           color: '#ffffff',
                           boxShadow: '0 12px 30px -8px rgba(0,0,0,0.3)',
                           ...noTapHighlight 
                       }}
                      >
                        {isBuffering ? (
                            <Loader size={32} className="animate-spin" />
                        ) : isPlaying ? (
                            <Pause size={32} fill="currentColor" />
                        ) : (
                            <Play size={32} fill="currentColor" className="ml-1" />
                        )}
                      </button>

                      <button 
                        onClick={() => onNext()} 
                        disabled={isBuffering}
                        className="p-3 hover:scale-110 active:scale-95 focus:outline-none transition-transform disabled:opacity-50"
                        style={{ 
                            color: primaryColor, 
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                            ...noTapHighlight 
                        }}
                      >
                        <SkipForward size={32} fill="currentColor" />
                      </button>
                  </div>

                  <button 
                    onClick={toggleRepeat} 
                    className={`p-3 rounded-full transition-all focus:outline-none hover:bg-white/40 active:scale-95`}
                    style={{ 
                        color: repeatMode !== 'OFF' ? primaryColor : '#9ca3af',
                        backgroundColor: repeatMode !== 'OFF' ? `${primaryColor}15` : 'transparent',
                        ...noTapHighlight 
                    }}
                  >
                    {repeatMode === 'ONE' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                  </button>
               </div>
            </div>

            {/* 4. Bottom Accessories */}
            <div className="flex justify-between items-center px-4 mt-2 h-14 relative z-20 pb-2">
                 <button 
                    onClick={() => {
                        setShowLyrics(!showLyrics);
                        if (showLyrics) setIsEditingLyrics(false);
                    }} 
                    className={`transition-all duration-300 focus:outline-none p-3 rounded-full hover:bg-gray-100 ${showLyrics ? 'bg-white shadow-lg scale-110' : 'text-gray-400 hover:text-gray-600'}`} 
                    style={{ color: showLyrics ? primaryColor : undefined, ...noTapHighlight }}
                 >
                   <Mic2 size={24} fill={showLyrics ? "currentColor" : "none"} />
                 </button>
                 
                 <div className="relative h-8 flex items-center justify-center overflow-hidden w-40">
                   <div key={bottomLabel} className="absolute inset-0 flex items-center justify-center animate-fade-in">
                     <span 
                        className="text-[10px] font-bold bg-white/40 px-4 py-1.5 rounded-full border border-white/30 uppercase tracking-widest select-none whitespace-nowrap backdrop-blur-md transition-colors duration-1000"
                        style={{ color: colorPalette ? colorPalette[textColorIndex] : '#6b7280' }}
                     >
                       {bottomLabel}
                     </span>
                   </div>
                 </div>

                 <button 
                    onClick={() => onToggleFavorite(currentSong.id)}
                    className={`transition-colors focus:outline-none p-3 rounded-full hover:bg-gray-100 active:scale-90 ${currentSong.isFavorite ? '' : 'text-gray-400 hover:text-rose-400'}`} 
                    style={{ 
                        color: currentSong.isFavorite ? primaryColor : undefined,
                        ...noTapHighlight
                    }}
                 >
                    <Heart size={24} fill={currentSong.isFavorite ? "currentColor" : "none"} />
                 </button>
            </div>
         </div>
    </div>
    <PlayerMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        song={currentSong} 
        onDelete={onDelete}
        onOpenTimer={onOpenTimer}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        timerActive={timeLeft !== null}
    />
    <SongInfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        song={currentSong}
    />
    <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
    `}</style>
    </>
  );
};

export default FullPlayer;
