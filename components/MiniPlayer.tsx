
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, Loader } from './Icons';
import { Song } from '../types';
import MarqueeText from './MarqueeText';

interface MiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isBuffering?: boolean; // New Prop
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onExpand: () => void;
  colorPalette?: string[];
  songCount?: number;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ 
  currentSong, isPlaying, isBuffering = false, onTogglePlay, onNext, onPrev, onExpand, colorPalette, songCount = 0
}) => {
  if (!currentSong) return null;

  const primaryColor = colorPalette?.[0] || '#1f2937';

  return (
    <div 
      onClick={onExpand}
      // UPDATE: Width diperlebar (left-1 right-1) dan container lebih luas
      className="fixed bottom-[5.5rem] md:bottom-6 left-1 right-1 md:left-4 md:right-4 max-w-screen-2xl mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl md:rounded-3xl p-2 md:p-3 cursor-pointer hover:scale-[1.005] transition-transform z-50 flex items-center justify-between group overflow-hidden border border-white/40"
    >
      {/* Dynamic Background with Fade & Blur */}
      <div className="absolute inset-0 z-0 bg-white/95 backdrop-blur-xl"></div>
      
      {currentSong.coverArt && (
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-20 blur-2xl scale-125 transition-all duration-700"
            style={{ backgroundImage: `url(${currentSong.coverArt})` }}
        />
      )}
      
      {/* Content - Z-Index Higher */}
      <div className="relative z-10 flex items-center gap-3 overflow-hidden flex-1 pl-1">
        {/* Vinyl Effect Container */}
        <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
            <div className={`w-full h-full bg-white/50 overflow-hidden shadow-sm border border-white/20 transition-all duration-700 ease-in-out ${isPlaying && !isBuffering ? 'rounded-full animate-[spin_4s_linear_infinite]' : 'rounded-xl'}`}>
            {currentSong.coverArt ? (
                <img 
                    src={currentSong.coverArt} 
                    className="w-full h-full object-cover" 
                    alt="Art" 
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)]"><Music size={20} /></div>
            )}
            <div className={`absolute inset-0 m-auto w-3 h-3 bg-white/80 rounded-full border border-gray-200 transition-opacity duration-500 ${isPlaying && !isBuffering ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>
            
            {/* Loading Overlay on Cover */}
            {isBuffering && (
                <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
        </div>

        <div className="flex flex-col overflow-hidden min-w-0 pr-2 w-full justify-center h-full">
          <div className="w-full">
            <MarqueeText text={currentSong.title} className="font-bold text-sm md:text-base text-gray-900 drop-shadow-sm" speed={8} />
          </div>
          <p className="text-xs md:text-sm text-gray-600 truncate font-medium">{currentSong.artist}</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-1 md:gap-3 flex-shrink-0 pr-1" onClick={(e) => e.stopPropagation()}>
         {/* Tampilkan tombol Prev hanya jika ada 2 lagu atau lebih */}
         {songCount > 1 && (
             <button 
                onClick={onPrev} 
                className="p-2 transition-colors hover:bg-white/50 rounded-full active:scale-90 hidden sm:block"
                style={{ color: primaryColor }}
                disabled={isBuffering}
             >
               <SkipBack size={22} fill="currentColor" />
             </button>
         )}
         
         <button 
          onClick={onTogglePlay}
          disabled={isBuffering}
          className="w-10 h-10 md:w-12 md:h-12 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-90 mx-1"
          style={{ backgroundColor: primaryColor }}
         >
           {isBuffering ? (
               <Loader size={20} className="animate-spin" />
           ) : isPlaying ? (
               <Pause size={20} fill="currentColor" />
           ) : (
               <Play size={20} fill="currentColor" className="ml-0.5" />
           )}
         </button>
         
         <button 
            onClick={onNext} 
            className="p-2 transition-colors hover:bg-white/50 rounded-full active:scale-90"
            style={{ color: primaryColor }}
            disabled={isBuffering}
         >
           <SkipForward size={24} fill="currentColor" />
         </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
