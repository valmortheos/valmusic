
import React, { useState } from 'react';
import { 
  Home, Library, Disc, Mic2, Settings, Upload, 
  Music, Play, Pause, Search, User, Trash2, ListMusic, UserCheck
} from './Icons';
import { ViewState, Song, UserProfile } from '../types';
import GenrePlaylist from './library/GenrePlaylist';
import ArtistPlaylist from './library/ArtistPlaylist';

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
         {/* Tab Search dihapus dari navigasi bawah, akses via Header saja */}
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
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // Added prop
}

export const LibraryView: React.FC<LibraryViewProps> = React.memo(({ songs, currentSong, playSong, onDelete, handleFileUpload }) => {
    // Menambahkan state tab 'artist'
    const [activeTab, setActiveTab] = useState<'all' | 'genre' | 'artist'>('all');

    return (
        <div className="pb-32 animate-fade-in">
           {/* Header & Controls */}
           <div className="flex flex-col gap-5 mb-6">
               <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-bold text-gray-800">Pustaka Lagu</h2>
                   
                   {/* Persistent Upload Button */}
                   <label className="cursor-pointer bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95 group">
                        <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                            <Upload size={16} />
                        </div>
                        <span className="hidden sm:inline">Tambah Musik</span>
                        <span className="sm:hidden">Upload</span>
                        {/* UPDATE ACCEPT ATTRIBUTE */}
                        <input type="file" multiple accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.opus,.lrc,.txt" className="hidden" onChange={handleFileUpload} />
                   </label>
               </div>
               
               {/* Tab Switcher */}
               <div className="flex bg-gray-100 p-1.5 rounded-2xl self-start overflow-x-auto max-w-full no-scrollbar">
                   <button 
                     onClick={() => setActiveTab('all')}
                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                     Semua Lagu ({songs.length})
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
               </div>
           </div>
           
           {songs.length === 0 ? (
               <div className="text-gray-500 text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-inner">
                        <Music size={40} />
                    </div>
                    <p className="font-bold text-gray-700 text-lg mb-2">Pustaka Kosong</p>
                    <p className="text-sm text-gray-400 max-w-[250px] leading-relaxed">Belum ada lagu. Tekan tombol <span className="font-bold text-[var(--color-primary)]">Upload</span> di atas untuk menambahkan musik lokal.</p>
               </div>
           ) : (
             <>
                {activeTab === 'all' && (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        {songs.map((song, i) => (
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
                                        <div className="text-xs text-gray-500 truncate">{song.artist}</div>
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
             </>
           )}
        </div>
    );
});

// --- SETTINGS VIEW ---
export const SettingsView = ({ userProfile, setUserProfile }: { userProfile: UserProfile, setUserProfile: any }) => (
    <div className="pb-32 animate-fade-in">
       <h2 className="text-2xl font-bold mb-6 text-gray-800">Pengaturan</h2>
       <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><User size={20}/> Profil</h3>
          <div className="flex gap-4">
             <img src={userProfile.avatar} className="w-16 h-16 rounded-full object-cover" />
             <div className="flex-1 space-y-2">
               <input type="text" value={userProfile.name} onChange={e=>setUserProfile({...userProfile, name:e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Nama" />
               <input type="text" value={userProfile.avatar} onChange={e=>setUserProfile({...userProfile, avatar:e.target.value})} className="w-full border p-2 rounded-lg text-sm" placeholder="URL Avatar" />
             </div>
          </div>
       </div>
    </div>
);
