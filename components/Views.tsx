
import React, { useState, useMemo } from 'react';
import { 
  Home, Library, Disc, Mic2, Settings, Upload, 
  Music, Play, Pause, Search, User, Trash2, ListMusic, UserCheck, Cloud, AlertCircle, HardDrive, ChevronDown, SortAsc, BarChart2, WifiOff, Heart, Github, Instagram, ExternalLink
} from './Icons';
import { ViewState, Song, UserProfile } from '../types';
import GenrePlaylist from './library/GenrePlaylist';
import ArtistPlaylist from './library/ArtistPlaylist';
import OfflineLibrarySection from './library/OfflineLibrarySection'; 
import StorageInspector from './settings/StorageInspector'; 
import { sortSongs, SortOption } from '../utils/sorting';

// --- NAVIGATION COMPONENT ---
export const Navigation = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col md:flex-row items-center md:space-x-4 p-2 md:px-4 md:py-3 rounded-2xl transition-all duration-300 ${active ? 'text-[var(--color-primary)] md:bg-gray-50 md:font-semibold transform scale-105 md:scale-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
      {icon}
      <span className="text-[10px] md:text-sm mt-1 md:mt-0 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40 md:static md:flex-col md:h-screen md:w-64 md:border-r md:justify-start md:space-y-8 md:p-6 md:border-t-0 md:bg-white flex-shrink-0">
       <div className="hidden md:flex items-center space-x-3 mb-6">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[var(--color-primary)]/30">V</div>
            <span className="font-bold text-2xl tracking-tight text-slate-800">ValMusic</span>
         </div>
       </div>
       <div className="flex md:flex-col md:w-full md:space-y-2 justify-between w-full md:justify-start">
         <NavItem icon={<Home size={24} />} label="Beranda" active={view === ViewState.HOME} onClick={() => setView(ViewState.HOME)} />
         <NavItem icon={<Library size={24} />} label="Pustaka" active={view === ViewState.LIBRARY} onClick={() => setView(ViewState.LIBRARY)} />
         <NavItem icon={<Disc size={24} />} label="Album" active={view === ViewState.ALBUM} onClick={() => setView(ViewState.ALBUM)} />
         <NavItem icon={<Mic2 size={24} />} label="Artis" active={view === ViewState.ARTIST} onClick={() => setView(ViewState.ARTIST)} />
       </div>
       <div className="hidden md:block mt-auto w-full pt-6 border-t border-gray-100">
         <div className="hidden md:block mt-4 text-xs text-gray-400 font-medium">Created by Valmortheos</div>
       </div>
    </div>
  );
};

// --- LIBRARY VIEW ---
interface LibraryViewProps {
    songs: Song[];
    currentSong: Song | null;
    playSong: (s: Song) => void;
    onDelete?: (id: string) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleFolderScan: () => void; 
    isScanning: boolean; 
}

export const LibraryView: React.FC<LibraryViewProps> = React.memo(({ songs, currentSong, playSong, onDelete, handleFileUpload, handleFolderScan, isScanning }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'genre' | 'artist' | 'offline'>('all');
    const [sortOption, setSortOption] = useState<SortOption>('AZ');

    const sortedSongs = useMemo(() => {
        return sortSongs(songs, sortOption);
    }, [songs, sortOption]);

    return (
        <div className="pb-32 animate-fade-in">
           {/* Header & Controls */}
           <div className="flex flex-col gap-5 mb-6">
               <div className="flex items-center justify-between flex-wrap gap-2">
                   <h2 className="text-2xl font-bold text-gray-800">Pustaka Lagu</h2>
                   
                   <div className="flex items-center gap-2">
                       <label className="cursor-pointer bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95 group">
                            <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                                <Upload size={16} />
                            </div>
                            <span className="hidden sm:inline">Upload File</span>
                            <span className="sm:hidden">Upload</span>
                            <input type="file" multiple accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.opus,.lrc,.txt" className="hidden" onChange={handleFileUpload} />
                       </label>
                   </div>
               </div>
               
               <div className="flex flex-wrap items-center justify-between gap-3">
                   {/* Tab Switcher */}
                   <div className="flex bg-gray-100 p-1.5 rounded-2xl overflow-x-auto max-w-full no-scrollbar flex-1 min-w-[200px]">
                       <button 
                         onClick={() => setActiveTab('all')}
                         className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                       >
                         Semua ({songs.length})
                       </button>
                       <button 
                         onClick={() => setActiveTab('genre')}
                         className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${activeTab === 'genre' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                       >
                         <ListMusic size={14}/> Genre
                       </button>
                       <button 
                         onClick={() => setActiveTab('artist')}
                         className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${activeTab === 'artist' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                       >
                         <UserCheck size={14}/> Artis
                       </button>
                       <button 
                         onClick={() => setActiveTab('offline')}
                         className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${activeTab === 'offline' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                       >
                         <WifiOff size={14}/> Offline
                       </button>
                   </div>

                   {/* SORTING CONTROLS */}
                   {activeTab === 'all' && (
                       <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setSortOption('AZ')}
                                className={`p-2 rounded-lg transition-all ${sortOption === 'AZ' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                title="A-Z"
                            >
                                <SortAsc size={16} />
                            </button>
                            <button
                                onClick={() => setSortOption('MOST_PLAYED')}
                                className={`p-2 rounded-lg transition-all ${sortOption === 'MOST_PLAYED' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Paling Sering Diputar"
                            >
                                <BarChart2 size={16} />
                            </button>
                       </div>
                   )}
               </div>
           </div>
           
           {songs.length === 0 ? (
               <div className="text-gray-500 text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-inner">
                        <Music size={40} />
                    </div>
                    <p className="font-bold text-gray-700 text-lg mb-2">Pustaka Kosong</p>
                    <p className="text-sm text-gray-400 max-w-[250px] leading-relaxed">Belum ada lagu. Upload file audio untuk memulai.</p>
               </div>
           ) : (
             <>
                {activeTab === 'all' && (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        {sortedSongs.map((song, i) => (
                            <div key={song.id} className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 group ${currentSong?.id === song.id ? 'bg-[var(--color-primary)]/5' : ''}`}>
                                <div className="flex-1 min-w-0 flex items-center" onClick={() => playSong(song)}>
                                    <span className="w-8 text-center text-gray-400 text-xs font-bold flex-shrink-0 group-hover:hidden">{i+1}</span>
                                    <span className="w-8 text-center text-[var(--color-primary)] hidden group-hover:block flex-shrink-0">
                                        <Play size={16} fill="currentColor" />
                                    </span>
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mx-4 flex-shrink-0 relative">
                                        {song.coverArt ? <img src={song.coverArt} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300"><Music size={20}/></div>}
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <div className={`font-bold text-sm truncate ${currentSong?.id === song.id ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>{song.title}</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs text-gray-500 truncate">{song.artist}</div>
                                            {(song.playCount || 0) > 0 && (
                                                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 flex items-center gap-1">
                                                    <BarChart2 size={8} /> {song.playCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden sm:block text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded mr-3 flex-shrink-0">{song.format}</div>
                                {onDelete && (
                                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Hapus?')) onDelete(song.id); }} className="p-2 text-gray-300 hover:text-red-500 flex-shrink-0 hover:bg-red-50 rounded-full transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'genre' && (
                    <GenrePlaylist songs={songs} playSong={playSong} currentSong={currentSong} />
                )}

                {activeTab === 'artist' && (
                    <ArtistPlaylist songs={songs} playSong={playSong} currentSong={currentSong} />
                )}

                {activeTab === 'offline' && (
                    <OfflineLibrarySection 
                        songs={songs} 
                        playSong={playSong} 
                        currentSong={currentSong} 
                        onDelete={onDelete}
                    />
                )}
             </>
           )}
        </div>
    );
});

// --- SETTINGS VIEW ---
export const SettingsView = ({ userProfile, setUserProfile, songs }: { userProfile: UserProfile, setUserProfile: any, songs: Song[] }) => {
    const [showStorage, setShowStorage] = useState(false);

    return (
    <div className="pb-32 animate-fade-in">
       <h2 className="text-2xl font-bold mb-6 text-gray-800">Pengaturan</h2>
       
       <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-6 space-y-6">
          {/* Profile Section */}
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700"><User size={20}/> Profil Pengguna</h3>
            <div className="flex gap-4">
                <img src={userProfile.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                <div className="flex-1 space-y-2">
                <input type="text" value={userProfile.name} onChange={e=>setUserProfile({...userProfile, name:e.target.value})} className="w-full border p-2 rounded-lg text-sm font-medium" placeholder="Nama Pengguna" />
                <input type="text" value={userProfile.avatar} onChange={e=>setUserProfile({...userProfile, avatar:e.target.value})} className="w-full border p-2 rounded-lg text-sm" placeholder="URL Avatar" />
                </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* Filter Logic Section */}
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700"><AlertCircle size={20}/> Filter Audio</h3>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm font-bold text-gray-800">Abaikan Audio Pendek</p>
                    <p className="text-xs text-gray-500">Jangan tampilkan audio di bawah durasi tertentu.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={userProfile.settings?.enableDurationFilter || false}
                        onChange={(e) => setUserProfile({
                            ...userProfile, 
                            settings: { ...userProfile.settings, enableDurationFilter: e.target.checked }
                        })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
            </div>

            {userProfile.settings?.enableDurationFilter && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500">Minimum Durasi</span>
                        <span className="text-xs font-bold text-[var(--color-primary)]">{userProfile.settings.minDurationFilter} Detik</span>
                    </div>
                    <input 
                        type="range" 
                        min="10" 
                        max="300" 
                        step="5"
                        value={userProfile.settings.minDurationFilter}
                        onChange={(e) => setUserProfile({
                            ...userProfile,
                            settings: { ...userProfile.settings, minDurationFilter: parseInt(e.target.value) }
                        })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                    />
                </div>
            )}
          </div>
          
          <div className="h-px bg-gray-100 w-full"></div>

          {/* Storage Inspector Section */}
          <div>
            <div 
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setShowStorage(!showStorage)}
            >
                <h3 className="font-bold flex items-center gap-2 text-gray-700 group-hover:text-gray-900 transition-colors">
                    <HardDrive size={20}/> Storage
                </h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform ${showStorage ? 'rotate-180' : ''}`} />
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showStorage ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <StorageInspector songs={songs} />
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* --- LIGHT THEME CREDITS & DONATION SECTION --- */}
          <div>
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
                  <Heart size={20} className="text-rose-500 fill-rose-100"/> Dukungan & Kredit
              </h3>
              
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-1 relative overflow-hidden group shadow-sm hover:border-gray-200 transition-colors">
                   {/* Background Clean White */}
                   <div className="absolute inset-0 bg-white"></div>
                   
                   <div className="relative z-10 p-5 flex items-center gap-4">
                       <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-gray-200 to-gray-300 shadow-inner">
                           <img 
                                src="https://fastly.picsum.photos/id/203/4032/3024.jpg?hmac=yeLnHOEAWUYBtMnanR0-0Q7gSvYbyxPG3PLJYvm170Q" 
                                className="w-full h-full rounded-full object-cover border-2 border-white"
                                alt="Dev"
                           />
                       </div>
                       <div>
                           <h4 className="font-extrabold text-lg leading-tight text-gray-900">Valmortheos</h4>
                           <p className="text-xs text-gray-500 font-bold">Fullstack Web Engineer</p>
                       </div>
                   </div>

                   <div className="relative z-10 px-5 pb-5 pt-0">
                       <div className="flex gap-2 mt-2">
                           <a href="https://www.instagram.com/valmortheos" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors text-gray-700 border border-gray-200">
                               <Instagram size={14}/> Instagram
                           </a>
                           <a href="https://www.github.com/valmortheos" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                               <Github size={14}/> GitHub
                           </a>
                       </div>

                       <div className="mt-4 pt-4 border-t border-gray-100">
                            <a href="https://saweria.co/vlmsc" target="_blank" rel="noreferrer" className="block w-full">
                                <div className="bg-[#fff9c4] hover:bg-[#fff59d] border border-yellow-200 p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer group/donate">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-400 p-1.5 rounded-lg text-white shadow-sm group-hover/donate:scale-110 transition-transform">
                                            <Heart size={16} fill="currentColor"/>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-800 opacity-80">Dukung Developer</p>
                                            <p className="font-extrabold text-sm text-gray-900">Traktir Kopi di Saweria</p>
                                        </div>
                                    </div>
                                    <ExternalLink size={16} className="text-yellow-700" />
                                </div>
                            </a>
                       </div>
                   </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-4 font-medium">
                  ValMusic v1.0.0 • Dibuat dengan 💜 di Indonesia
              </p>
          </div>

       </div>
    </div>
  );
};
