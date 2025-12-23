
import React, { useState } from 'react';
import { ViewState, Song, UserProfile } from '../types';
import { getGreeting } from '../constants';
import { Music, Play, Pause, Upload, Heart } from './Icons';
import ValMusicBadge from './ValMusicBadge';

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

    // Filter Logic
    const displayedSongs = activeTab === 'favorite' 
        ? songs.filter(s => s.isFavorite) 
        : [...songs].reverse().slice(0, 21); // Ambil kelipatan 3 agar grid rapi

    return (
        <div className="flex flex-col h-full animate-fade-in overflow-hidden pb-32">
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
                    {/* New Animated Badge Component */}
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
              <h3 className="font-bold text-lg text-gray-800">Dengarkan Lagi</h3>
              
              <div className="flex bg-gray-100 p-1 rounded-lg shadow-inner scale-90 origin-right">
                 <button 
                    onClick={() => setActiveTab('recent')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-300 ${activeTab === 'recent' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    Terbaru
                 </button>
                 <button 
                    onClick={() => setActiveTab('favorite')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-300 flex items-center gap-1 ${activeTab === 'favorite' ? 'bg-white shadow-sm text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    Favorit
                 </button>
              </div>
          </div>

          {/* 2. Horizontal Grid Layout (3 Rows Fixed) */}
          <div className="flex-1 min-h-0 relative">
            {displayedSongs.length > 0 ? (
              <div 
                className="grid grid-rows-3 grid-flow-col gap-x-4 gap-y-3 overflow-x-auto snap-x snap-mandatory no-scrollbar h-full px-2 pb-2 content-start"
                style={{
                    // Lebar kolom dinamis: lebar layar dikurangi padding, atau fix 300px di desktop
                    gridAutoColumns: 'max(85vw, 320px)',
                }}
              >
                {displayedSongs.map((song, i) => (
                  <div 
                    key={song.id} 
                    className={`snap-center flex items-center p-3 bg-white rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group active:scale-[0.98] h-[72px] ${currentSong?.id === song.id ? 'bg-indigo-50/50 border-indigo-100' : ''}`}
                    onClick={() => playSong(song)}
                  >
                    {/* Numbering */}
                    <span className={`w-6 text-center text-xs font-bold mr-1 flex-shrink-0 ${currentSong?.id === song.id ? 'text-[var(--color-primary)]' : 'text-gray-300'}`}>
                        {i + 1}
                    </span>

                    {/* Cover Art (Small List Style) */}
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden relative bg-gray-100 shadow-sm mr-3 border border-gray-50">
                       {song.coverArt ? (
                           <img src={song.coverArt} className="w-full h-full object-cover" loading="lazy" />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><Music size={18} /></div>
                       )}
                       
                       {/* Overlay Play */}
                       <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${currentSong?.id === song.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                           {currentSong?.id === song.id && isPlaying ? (
                               <Pause size={16} className="text-white drop-shadow-md" fill="currentColor"/>
                           ) : (
                               <Play size={16} className="text-white drop-shadow-md ml-0.5" fill="currentColor"/>
                           )}
                       </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                        <h4 className={`font-bold text-sm truncate ${currentSong?.id === song.id ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>
                            {song.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 truncate font-medium">
                            {song.artist}
                        </p>
                    </div>

                    {/* Heart Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }}
                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${song.isFavorite ? 'text-rose-500 bg-rose-50' : 'text-gray-200 hover:text-rose-400 hover:bg-gray-50'}`}
                    >
                        <Heart size={16} fill={song.isFavorite ? "currentColor" : "none"} />
                    </button>
                  </div>
                ))}
                
                {/* Spacer di akhir grid horizontal */}
                <div className="w-2"></div>
              </div>
            ) : (
              /* Empty State */
              <div className="w-full h-40 flex flex-col items-center justify-center text-center px-4 animate-fade-in opacity-80 border-2 border-dashed border-gray-100 rounded-3xl mt-2">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 shadow-sm text-gray-400">
                    {activeTab === 'favorite' ? <Heart size={24} /> : <Upload size={24} />}
                </div>
                <h4 className="text-sm font-bold text-gray-700">
                    {activeTab === 'favorite' ? 'Belum Ada Favorit' : 'Pustaka Kosong'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                    {activeTab === 'favorite' ? 'Tekan ikon hati untuk menambahkan.' : 'Upload musikmu sekarang.'}
                </p>
              </div>
            )}
          </div>
        </div>
    );
};

export default HomeView;
