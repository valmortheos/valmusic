
import React, { useMemo, useState } from 'react';
import { Song } from '../../types';
import { ChevronDown, Mic2, Play, Music } from '../Icons';

interface ArtistPlaylistProps {
  songs: Song[];
  playSong: (s: Song) => void;
  currentSong: Song | null;
}

const ArtistPlaylist: React.FC<ArtistPlaylistProps> = ({ songs, playSong, currentSong }) => {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // Group songs by artist
  const artists = useMemo(() => {
    return songs.reduce((acc, song) => {
      const artist = (song.artist || 'Unknown Artist').trim();
      if (!acc[artist]) acc[artist] = [];
      acc[artist].push(song);
      return acc;
    }, {} as Record<string, Song[]>);
  }, [songs]);

  const artistKeys = Object.keys(artists).sort();

  if (selectedArtist) {
    const artistSongs = artists[selectedArtist];
    // Try to find a cover art from any song by this artist
    const artistCover = artistSongs.find(s => s.coverArt)?.coverArt;

    const handlePlayAll = () => {
        if(artistSongs.length > 0) playSong(artistSongs[0]);
    };

    return (
      <div className="animate-slide-up">
        <button 
          onClick={() => setSelectedArtist(null)}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-bold text-sm bg-white px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition-all"
        >
          <ChevronDown className="rotate-90" size={18} /> Kembali
        </button>
        
        <div className="flex flex-col items-center mb-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Background Blur */}
            {artistCover && (
                <div className="absolute inset-0 opacity-10 blur-xl scale-110 bg-center bg-cover" style={{backgroundImage: `url(${artistCover})`}}></div>
            )}
            
            <div className="relative z-10 w-32 h-32 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 shadow-lg border-4 border-white mb-4">
                {artistCover ? (
                    <img src={artistCover} className="w-full h-full object-cover" alt={selectedArtist} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><Mic2 size={40} /></div>
                )}
            </div>
            <div className="relative z-10 text-center">
                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{selectedArtist}</h3>
                <p className="text-gray-500 font-bold mb-6">
                    {artistSongs.length} Lagu
                </p>
                <button 
                    onClick={handlePlayAll}
                    className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[var(--color-primary)]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                >
                    <Play size={20} fill="currentColor" /> Putar Artis
                </button>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
           {artistSongs.map((song, i) => (
             <div 
               key={song.id} 
               onClick={() => playSong(song)}
               className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 group ${currentSong?.id === song.id ? 'bg-[var(--color-primary)]/5' : ''}`}
             >
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden mr-4 flex-shrink-0 relative">
                    {song.coverArt ? <img src={song.coverArt} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300"><Music size={20}/></div>}
                    <div className={`absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 ${currentSong?.id === song.id ? 'opacity-100' : ''} transition-opacity`}>
                        <Play size={20} className="text-white fill-current"/>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                   <div className={`font-bold text-sm truncate ${currentSong?.id === song.id ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>{song.title}</div>
                   <div className="text-xs text-gray-500 truncate">{song.album}</div>
                </div>
             </div>
           ))}
        </div>
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
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
      {artistKeys.map(artist => {
        const cover = artists[artist].find(s => s.coverArt)?.coverArt;
        return (
            <div 
            key={artist}
            onClick={() => setSelectedArtist(artist)}
            className="group bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[var(--color-primary)]/30 cursor-pointer transition-all flex flex-col items-center text-center hover:-translate-y-1"
            >
            <div className="w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden shadow-inner relative group-hover:scale-110 transition-transform duration-500 border-4 border-white">
                {cover ? (
                    <img src={cover} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300"><Mic2 size={32} /></div>
                )}
            </div>
            <h3 className="font-bold text-gray-800 truncate w-full text-base mb-1 group-hover:text-[var(--color-primary)] transition-colors">{artist}</h3>
            <p className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{artists[artist].length} Lagu</p>
            </div>
        );
      })}
    </div>
  );
};

export default ArtistPlaylist;
