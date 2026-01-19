
import React, { useState, useMemo } from 'react';
import { ViewState, Song, UserProfile } from '../types';
import { getGreeting } from '../constants';
import { Music, Upload, Heart, BarChart2 } from './Icons';
import ValMusicBadge from './ValMusicBadge';
import ResponsiveSongGrid from './home/ResponsiveSongGrid';
import { sortSongs, hasPlayHistory } from '../utils/sorting';

interface HomeViewProps {
    userProfile: UserProfile;
    songs: Song[];
    currentSong: Song | null;
    isPlaying: boolean;
    playSong: (s: Song) => void;
    setView: (v: ViewState) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    toggleFavorite: (id: string) => void;
    colorPalette?: string[];
}

const HomeView: React.FC<HomeViewProps> = ({ 
    userProfile, songs, currentSong, isPlaying, playSong, setView, handleFileUpload, toggleFavorite, colorPalette
}) => {
    const [activeTab, setActiveTab] = useState<'recent' | 'favorite'>('recent');
    const primaryColor = colorPalette?.[0] || '#6366f1';

    // LOGIC SORTING OTOMATIS BERANDA
    // Menggunakan useMemo untuk mencegah kalkulasi ulang yang tidak perlu
    // dan memastikan array referensi stabil.
    const displayedSongs = useMemo(() => {
        let baseList: Song[] = [];

        if (activeTab === 'favorite') {
             baseList = songs.filter(s => s.isFavorite);
        } else {
             // Pastikan clone array agar tidak memutasi state asli
             baseList = [...songs];
        }

        const shouldSortByPopularity = hasPlayHistory(baseList);

        let sorted;
        if (shouldSortByPopularity) {
            sorted = sortSongs(baseList, 'MOST_PLAYED');
        } else {
            sorted = sortSongs(baseList, 'AZ');
        }

        // Slice setelah sorting, pastikan max 21 lagu untuk performa Home
        return sorted.slice(0, 21);
    }, [songs, activeTab]);

    const isPopularityMode = activeTab === 'recent' && hasPlayHistory(songs);

    return (
        <div className="flex flex-col h-full animate-fade-in overflow-hidden pb-32 transform-gpu">
          {/* 1. Hero Section - COMPACT & ANIMATED BADGE */}
          <div className="flex-shrink-0 mb-4 px-2 pt-2">
              <div 
                className="rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden group transition-all duration-500 min-h-[110px] flex flex-row items-center justify-between"
                style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #1e1b4b)`
                }}
              >
                {/* Background Icon Decoration */}
                <div className="absolute -bottom-4 -right-4 opacity-10 transform rotate-12 pointer-events-none">
                    <Music size={100} />
                </div>
                
                <div className="relative z-10 flex-1">
                    <ValMusicBadge />
                    
                    <h2 className="text-2xl font-extrabold tracking-tight leading-tight mt-1">
                        {getGreeting()}, <br/>
                        <span className="opacity-90 font-normal text-lg">{userProfile.name.split(' ')[0]}</span>
                    </h2>
                </div>

                <div className="relative z-10">
                    <button onClick={() => setView(ViewState.LIBRARY)} className="bg-white/90 text-[var(--color-primary)] px-4 py-2 rounded-xl font-bold text-[10px] transition-transform active:scale-95 shadow-lg flex items-center gap-2 hover:bg-white">
                        <Music size={14} /> Pustaka
                    </button>
                </div>
              </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0 px-2">
              <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-800">Dengarkan Lagi</h3>
                  
                  {/* UPDATE: Hapus border, gunakan background solid transparan agar tidak terlihat seperti tanda kurung */}
                  {isPopularityMode && (
                      <span 
                        className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in font-bold"
                        style={{
                            backgroundColor: `${primaryColor}20`, // Lebih solid dari 15
                            color: primaryColor,
                            // Hapus border color yang mungkin menyebabkan efek tanda kurung
                        }}
                      >
                          <BarChart2 size={10} /> Sering Diputar
                      </span>
                  )}
              </div>
              
              <div className="flex bg-gray-100 p-1 rounded-lg shadow-inner scale-90 origin-right">
                 <button 
                    onClick={() => setActiveTab('recent')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-300 ${activeTab === 'recent' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    Utama
                 </button>
                 <button 
                    onClick={() => setActiveTab('favorite')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-300 flex items-center gap-1 ${activeTab === 'favorite' ? 'bg-white shadow-sm text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    Favorit
                 </button>
              </div>
          </div>

          {/* 2. Responsive Song Grid */}
          <div className="flex-1 min-h-0 relative">
             <ResponsiveSongGrid 
                songs={displayedSongs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                playSong={playSong}
                toggleFavorite={toggleFavorite}
             />
          </div>
        </div>
    );
};

export default HomeView;
