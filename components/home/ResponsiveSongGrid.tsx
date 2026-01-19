
import React from 'react';
import { Song } from '../../types';
import { Play, Pause, Music, Heart, BarChart2 } from '../Icons';

interface ResponsiveSongGridProps {
    songs: Song[];
    currentSong: Song | null;
    isPlaying: boolean;
    playSong: (s: Song) => void;
    toggleFavorite: (id: string) => void;
}

const ResponsiveSongGrid: React.FC<ResponsiveSongGridProps> = React.memo(({
    songs,
    currentSong,
    isPlaying,
    playSong,
    toggleFavorite
}) => {
    if (songs.length === 0) {
        return (
            <div className="w-full h-40 flex flex-col items-center justify-center text-center px-4 animate-fade-in opacity-80 border-2 border-dashed border-gray-100 rounded-3xl mt-2">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 shadow-sm text-gray-400">
                    <Music size={24} />
                </div>
                <h4 className="text-sm font-bold text-gray-700">Daftar Kosong</h4>
                <p className="text-xs text-gray-400 mt-1">Belum ada lagu untuk ditampilkan.</p>
            </div>
        );
    }

    return (
        <div 
            className="
                grid 
                gap-2 
                px-4 
                pb-24 
                
                /* MOBILE: HORIZONTAL SCROLL */
                grid-flow-col 
                grid-rows-3 
                overflow-x-auto 
                snap-x 
                snap-mandatory 
                no-scrollbar
                
                /* FIX WIDTH: Lebih ramping agar user melihat kartu berikutnya */
                auto-cols-[85vw]
                sm:auto-cols-[300px]
                
                /* DESKTOP: VERTICAL GRID */
                md:grid-flow-row 
                md:grid-rows-none 
                md:grid-cols-2 
                lg:grid-cols-3
                md:overflow-x-visible 
                md:snap-none
                md:pb-0
                md:auto-cols-auto
            "
            style={{
                scrollPaddingLeft: '1rem',
                // Optimasi rendering untuk scroll lancar
                contain: 'content',
            }}
        >
            {songs.map((song, i) => {
                 const isCurrent = currentSong?.id === song.id;
                 
                 return (
                    <div 
                        key={song.id} 
                        className={`
                            snap-start 
                            flex 
                            items-center 
                            p-2 
                            bg-white 
                            rounded-2xl 
                            border 
                            
                            /* Hover & Active States */
                            hover:shadow-md 
                            transition-all 
                            cursor-pointer 
                            group 
                            active:scale-[0.98] 
                            
                            /* Fix Height untuk konsistensi */
                            h-[64px]
                            
                            ${isCurrent ? 'bg-indigo-50/50 border-indigo-100 ring-1 ring-indigo-50' : 'border-gray-100 hover:border-indigo-100'}
                        `}
                        onClick={() => playSong(song)}
                    >
                        {/* Numbering */}
                        <span className={`w-6 text-center text-xs font-bold mr-1 flex-shrink-0 ${isCurrent ? 'text-[var(--color-primary)]' : 'text-gray-300'}`}>
                            {i + 1}
                        </span>

                        {/* Cover Art */}
                        <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden relative bg-gray-100 shadow-sm mr-3 border border-gray-50">
                           {song.coverArt ? (
                               <img src={song.coverArt} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><Music size={18} /></div>
                           )}
                           
                           {/* Overlay Play - Menggunakan opacity alih-alih conditional rendering untuk performa */}
                           <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                               {isCurrent && isPlaying ? (
                                   <Pause size={16} className="text-white drop-shadow-md" fill="currentColor"/>
                               ) : (
                                   <Play size={16} className="text-white drop-shadow-md ml-0.5" fill="currentColor"/>
                               )}
                           </div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                            <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>
                                {song.title}
                            </h4>
                            
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-gray-500 truncate font-medium max-w-[120px]">
                                    {song.artist}
                                </p>
                                
                                {/* Play Count Badge */}
                                {(song.playCount || 0) > 0 && (
                                    <div 
                                        className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200 animate-scale-in origin-left"
                                    >
                                        <BarChart2 size={8} className="text-[var(--color-primary)]" />
                                        <span className="text-[9px] font-bold text-gray-600">{song.playCount}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Heart Button */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }}
                            className={`p-2 rounded-full transition-colors flex-shrink-0 ${song.isFavorite ? 'text-rose-500 bg-rose-50' : 'text-gray-200 hover:text-rose-400 hover:bg-gray-50'}`}
                        >
                            <Heart size={16} fill={song.isFavorite ? "currentColor" : "none"} />
                        </button>
                    </div>
                );
            })}
            
            <div className="w-2 md:hidden"></div>
            
            <style>{`
                @keyframes scale-in {
                    0% { opacity: 0; transform: scale(0.8); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
});

export default ResponsiveSongGrid;
