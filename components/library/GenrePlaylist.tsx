
import React, { useMemo, useState } from 'react';
import { Song } from '../../types';
import { ChevronDown, Music, Play } from '../Icons';

interface GenrePlaylistProps {
  songs: Song[];
  playSong: (s: Song) => void;
  currentSong: Song | null;
}

const GenrePlaylist: React.FC<GenrePlaylistProps> = ({ songs, playSong, currentSong }) => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Group songs by genre
  const genres = useMemo(() => {
    return songs.reduce((acc, song) => {
      const genre = (song.genre || 'Unknown Genre').trim();
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push(song);
      return acc;
    }, {} as Record<string, Song[]>);
  }, [songs]);

  const genreKeys = Object.keys(genres).sort();

  if (selectedGenre) {
    const genreSongs = genres[selectedGenre];
    
    const handlePlayAll = () => {
        if(genreSongs.length > 0) playSong(genreSongs[0]);
    };

    return (
      <div className="animate-slide-up">
        <button 
          onClick={() => setSelectedGenre(null)}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-bold text-sm bg-white px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition-all"
        >
          <ChevronDown className="rotate-90" size={16} /> Kembali
        </button>
        
        <div className="flex flex-col md:flex-row items-center md:items-center gap-6 mb-8 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-purple-400 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Music size={40} />
            </div>
            <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-extrabold text-gray-800 mb-1">{selectedGenre}</h3>
                <p className="text-gray-500 font-bold mb-4">{genreSongs.length} Lagu</p>
                <button 
                    onClick={handlePlayAll}
                    className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 justify-center md:justify-start mx-auto md:mx-0"
                >
                    <Play size={18} fill="currentColor" /> Putar Semua
                </button>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
           {genreSongs.map((song, i) => (
             <div 
               key={song.id} 
               onClick={() => playSong(song)}
               className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 group ${currentSong?.id === song.id ? 'bg-[var(--color-primary)]/5' : ''}`}
             >
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden mr-4 flex-shrink-0 relative">
                    {song.coverArt ? <img src={song.coverArt} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300"><Music size={20}/></div>}
                    <div className={`absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 ${currentSong?.id === song.id ? 'opacity-100' : ''} transition-opacity`}>
                       <Play size={20} className="text-white fill-current"/>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                   <div className={`font-bold text-sm truncate ${currentSong?.id === song.id ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>{song.title}</div>
                   <div className="text-xs text-gray-500 truncate">{song.artist}</div>
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
    <div className="grid grid-cols-2 gap-4 animate-fade-in">
      {genreKeys.map(genre => (
        <div 
          key={genre}
          onClick={() => setSelectedGenre(genre)}
          className="group bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg hover:border-[var(--color-primary)]/30 cursor-pointer transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform rotate-12">
             <Music size={80} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-gray-800 truncate text-lg mb-1 group-hover:text-[var(--color-primary)] transition-colors">{genre}</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded-md">{genres[genre].length} Lagu</span>
            </div>
            
            <div className="mt-6 flex justify-end">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shadow-sm">
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GenrePlaylist;
