
import React, { useState, useMemo } from 'react';
import { ViewState, Song, UserProfile, LyricLine } from '../types';
import HomeView from './HomeView';
import { LibraryView, SettingsView } from './Views';
import { AlbumView, ArtistView } from './LibraryViews';
import { Search, Music, Play, X } from './Icons';
import { smartSearch } from '../utils/searchUtils';

interface MainContentProps {
  view: ViewState;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  setView: (view: ViewState) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleFavorite: (id: string) => void;
  deleteSong: (id: string) => void;
  colorPalette?: string[];
  handleFolderScan: () => void; // New Prop
  isScanning: boolean; // New Prop
}

// Sub-component untuk Pencarian Lokal
const LocalSearchView = ({ 
    songs, 
    playSong, 
    currentSong 
}: { 
    songs: Song[], 
    playSong: (s: Song) => void, 
    currentSong: Song | null 
}) => {
    const [query, setQuery] = useState('');

    // Menggunakan Smart Search Logic
    const filteredSongs = useMemo(() => {
        return smartSearch(songs, query);
    }, [songs, query]);

    return (
        <div className="pb-32 animate-fade-in flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center md:text-left">Cari Musik</h2>
            
            {/* SEARCH INPUT CONTAINER - Fixed Width (Narrower) & Centered */}
            <div className="relative mb-8 w-full max-w-sm mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Search size={20} />
                </div>
                <input 
                    type="text" 
                    className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent shadow-sm text-gray-800 font-bold transition-all text-sm placeholder-gray-400"
                    placeholder="Judul, artis, atau album..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
                {query && (
                    <button 
                        onClick={() => setQuery('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 active:scale-90 transition-transform"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {query.trim() === '' ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50 mt-4">
                        <Search size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-400 text-sm font-medium">Ketik untuk mencari di pustaka lokalmu</p>
                    </div>
                ) : filteredSongs.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>Tidak ditemukan hasil untuk "{query}"</p>
                        {query.length === 1 && <p className="text-xs mt-2 text-gray-300">Tips: Ketik lebih banyak huruf untuk pencarian yang lebih luas.</p>}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden max-w-3xl mx-auto w-full">
                         <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredSongs.length} Hasil Ditemukan</p>
                         </div>
                         {filteredSongs.map((song) => (
                            <div key={song.id} className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 group ${currentSong?.id === song.id ? 'bg-[var(--color-primary)]/5' : ''}`}>
                                <div className="flex-1 min-w-0 flex items-center" onClick={() => playSong(song)}>
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden mr-4 flex-shrink-0 relative">
                                        {song.coverArt ? <img src={song.coverArt} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300"><Music size={20}/></div>}
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <div className={`font-bold text-sm truncate ${currentSong?.id === song.id ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>{song.title}</div>
                                        <div className="text-xs text-gray-500 truncate">{song.artist}</div>
                                    </div>
                                </div>
                                <button onClick={() => playSong(song)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-all">
                                    <Play size={16} fill="currentColor" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const MainContent: React.FC<MainContentProps> = ({
  view,
  userProfile,
  setUserProfile,
  songs,
  currentSong,
  isPlaying,
  playSong,
  setView,
  handleFileUpload,
  toggleFavorite,
  deleteSong,
  colorPalette,
  handleFolderScan,
  isScanning
}) => {
  
  // Logic Filter Durasi
  // Kita filter list 'songs' yang dikirim ke child components
  const filteredSongs = React.useMemo(() => {
    if (!userProfile.settings?.enableDurationFilter) return songs;
    
    return songs.filter(song => {
        // Jika duration 0 (belum pernah diputar/dimuat), kita tetap tampilkan dulu
        // agar user bisa memutarnya. Setelah diputar, duration akan terupdate.
        // Atau jika duration > minDuration.
        const minDur = userProfile.settings.minDurationFilter;
        return song.duration === 0 || song.duration >= minDur;
    });
  }, [songs, userProfile.settings]);

  return (
    <div className="flex-1 min-h-0 max-w-6xl mx-auto w-full">
      {view === ViewState.HOME && (
        <HomeView 
          userProfile={userProfile}
          songs={filteredSongs} // Use filtered
          currentSong={currentSong}
          isPlaying={isPlaying}
          playSong={playSong}
          setView={setView}
          handleFileUpload={handleFileUpload}
          toggleFavorite={toggleFavorite}
          colorPalette={colorPalette}
        />
      )}
      
      <div className="h-full overflow-y-auto no-scrollbar">
        {view === ViewState.LIBRARY && (
          <LibraryView 
            songs={filteredSongs} // Use filtered
            currentSong={currentSong}
            playSong={playSong}
            onDelete={deleteSong}
            handleFileUpload={handleFileUpload}
            handleFolderScan={handleFolderScan}
            isScanning={isScanning}
          />
        )}

        {view === ViewState.ALBUM && (
          <AlbumView
            songs={filteredSongs} // Use filtered
            playSong={playSong}
            currentSong={currentSong}
            isPlaying={isPlaying}
          />
        )}

        {view === ViewState.ARTIST && (
          <ArtistView
            songs={filteredSongs} // Use filtered
            playSong={playSong}
            currentSong={currentSong}
            isPlaying={isPlaying}
          />
        )}
        
        {view === ViewState.SETTINGS && (
          <SettingsView userProfile={userProfile} setUserProfile={setUserProfile} songs={songs} />
        )}
        
        {view === ViewState.SEARCH && (
            <LocalSearchView 
                songs={filteredSongs} // Use filtered
                playSong={playSong} 
                currentSong={currentSong} 
            />
        )}
      </div>
    </div>
  );
};

export default MainContent;
