
import React, { useState, useMemo } from 'react';
import { Song } from '../types';
import { Disc, Mic2, Music, ChevronDown, Play, Pause, Cloud } from './Icons';
import ArtistPlaylist from './library/ArtistPlaylist';

// --- HELPER TYPES ---
interface GroupedSongs {
  [key: string]: Song[];
}

// --- HELPER FUNCTIONS ---
const groupSongsBy = (songs: Song[], key: 'album' | 'artist'): GroupedSongs => {
  return songs.reduce((acc, song) => {
    const groupKey = (song[key] || 'Unknown').trim();
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(song);
    return acc;
  }, {} as GroupedSongs);
};

interface BaseViewProps {
  songs: Song[];
  playSong: (s: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

// --- ALBUM VIEW ---
export const AlbumView: React.FC<BaseViewProps> = ({ songs, playSong, currentSong, isPlaying }) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const albums = useMemo(() => groupSongsBy(songs, 'album'), [songs]);
  const albumKeys = Object.keys(albums).sort();

  if (selectedAlbum) {
    const albumSongs = albums[selectedAlbum];
    const albumCover = albumSongs[0]?.coverArt;

    const handlePlayAll = () => {
        if(albumSongs.length > 0) {
            playSong(albumSongs[0]);
        }
    };

    return (
      <div className="animate-slide-up pb-32">
        <button 
          onClick={() => setSelectedAlbum(null)}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-bold text-sm transition-all bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md"
        >
          <ChevronDown className="rotate-90" size={18} /> Kembali
        </button>

        <div className="flex flex-col md:flex-row gap-8 mb-10 items-center md:items-end px-2">
          <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex-shrink-0 border-4 border-white rotate-[-2deg]">
             {albumCover ? (
               <img src={albumCover} className="w-full h-full object-cover" alt={selectedAlbum} />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200"><Disc size={64} /></div>
             )}
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
             <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-3 bg-[var(--color-primary)]/10 px-4 py-1.5 rounded-full">Koleksi Album</span>
             <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3 drop-shadow-sm">{selectedAlbum}</h2>
             <p className="text-gray-500 font-bold text-xl mb-6">{albumSongs[0]?.artist} • {albumSongs.length} Lagu</p>
             
             <button 
                onClick={handlePlayAll}
                className="bg-[var(--color-primary)] text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-[var(--color-primary)]/30 hover:scale-105 hover:shadow-2xl active:scale-95 transition-all flex items-center gap-3"
             >
                <div className="bg-white/20 p-1.5 rounded-full">
                    <Play size={20} fill="currentColor" />
                </div>
                Putar Semua
             </button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/50 overflow-hidden shadow-sm">
           {albumSongs.map((song, i) => (
             <div 
               key={song.id} 
               onClick={() => playSong(song)}
               className={`flex items-center p-5 hover:bg-white/50 cursor-pointer border-b border-gray-50 last:border-0 group transition-colors ${currentSong?.id === song.id ? 'bg-white shadow-inner' : ''}`}
             >
                <div className="w-10 text-center font-bold text-gray-300 group-hover:hidden text-sm">{i+1}</div>
                <div className="w-10 text-center font-bold text-[var(--color-primary)] hidden group-hover:block">
                    <Play size={16} fill="currentColor"/>
                </div>
                
                <div className="flex-1 font-semibold text-gray-800 truncate px-2 flex items-center gap-2">
                   <div className={`truncate ${currentSong?.id === song.id ? 'text-[var(--color-primary)] font-bold' : ''}`}>{song.title}</div>
                   {song.isOnline && <Cloud size={12} className="text-sky-400 flex-shrink-0" fill="currentColor" />}
                </div>
                <div className="text-xs text-gray-400 font-mono font-medium bg-gray-100 px-2 py-1 rounded">
                  {Math.floor(song.duration / 60)}:{(Math.floor(song.duration % 60)).toString().padStart(2, '0')}
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="animate-fade-in pb-32">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Disc className="text-[var(--color-primary)]" /> Album
      </h2>
      {albumKeys.length === 0 ? (
        <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-200 rounded-3xl">Belum ada album terdeteksi.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {albumKeys.map(albumName => {
             const cover = albums[albumName][0]?.coverArt;
             return (
               <div 
                 key={albumName} 
                 onClick={() => setSelectedAlbum(albumName)}
                 className="group bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
               >
                 <div className="aspect-square bg-gray-100 rounded-[1.5rem] mb-4 overflow-hidden relative shadow-inner">
                    {cover ? (
                      <img src={cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={albumName} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-tr from-gray-50 to-gray-100"><Disc size={40}/></div>
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 p-3 rounded-full shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                             <Play size={20} className="text-[var(--color-primary)] ml-1" fill="currentColor"/>
                        </div>
                    </div>
                 </div>
                 <h3 className="font-bold text-gray-800 truncate mb-1 px-1" title={albumName}>{albumName}</h3>
                 <p className="text-xs text-gray-500 truncate px-1 font-medium">{albums[albumName][0]?.artist}</p>
               </div>
             )
          })}
        </div>
      )}
      <style>{`
        @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// --- ARTIST VIEW ---
export const ArtistView: React.FC<BaseViewProps> = ({ songs, playSong, currentSong }) => {
  return (
    <div className="pb-32 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Mic2 className="text-[var(--color-primary)]" /> Artis
        </h2>
        <ArtistPlaylist 
            songs={songs} 
            playSong={playSong} 
            currentSong={currentSong} 
        />
    </div>
  );
};
