
import React, { useState, useMemo } from 'react';
import { Song } from '../types';
import { Disc, Mic2, Music, ChevronDown, Play, Pause } from './Icons';
import ArtistPlaylist from './library/ArtistPlaylist'; // Import ArtistPlaylist

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

  // Tampilan Detail Album (Daftar Lagu dalam Album)
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
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-bold text-sm transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ChevronDown className="rotate-90" size={18} /> Kembali
        </button>

        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-end">
          <div className="w-44 h-44 md:w-52 md:h-52 bg-gray-200 rounded-[2rem] shadow-2xl overflow-hidden flex-shrink-0 border-4 border-white">
             {albumCover ? (
               <img src={albumCover} className="w-full h-full object-cover" alt={selectedAlbum} />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400"><Disc size={64} /></div>
             )}
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
             <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2 bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">Album</span>
             <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">{selectedAlbum}</h2>
             <p className="text-gray-500 font-bold text-lg mb-4">{albumSongs[0]?.artist} • {albumSongs.length} Lagu</p>
             
             {/* Play All Button */}
             <button 
                onClick={handlePlayAll}
                className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[var(--color-primary)]/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
             >
                <Play size={20} fill="currentColor" /> Putar Semua
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
           {albumSongs.map((song, i) => (
             <div 
               key={song.id} 
               onClick={() => playSong(song)}
               className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 group ${currentSong?.id === song.id ? 'bg-[var(--color-primary)]/5' : ''}`}
             >
                <div className="w-10 text-center font-bold text-gray-400 group-hover:hidden">{i+1}</div>
                <div className="w-10 text-center font-bold text-[var(--color-primary)] hidden group-hover:block">
                    <Play size={16} fill="currentColor"/>
                </div>
                
                <div className="flex-1 font-medium text-gray-800 truncate px-2">
                   <div className={currentSong?.id === song.id ? 'text-[var(--color-primary)] font-bold' : ''}>{song.title}</div>
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

  // Tampilan Grid Daftar Album
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
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Disc size={40}/></div>
                    )}
                    {/* Hover Overlay */}
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
