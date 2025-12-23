
import React from 'react';
import { Song } from '../types';
import { Play, Pause, Music, Search, Cloud } from './Icons';

interface SearchViewProps {
  results: Song[];
  isSearching: boolean;
  error: string | null;
  lastQuery: string;
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ 
  results, isSearching, error, lastQuery, currentSong, isPlaying, playSong 
}) => {
  return (
    <div className="pb-32 animate-fade-in">
       <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-red-50 text-red-600 rounded-full border border-red-100">
               <Play size={24} fill="currentColor" /> 
           </div>
           <div>
               <h2 className="text-2xl font-bold text-gray-800">YouTube Music</h2>
               {lastQuery && <p className="text-xs text-gray-500 font-medium">Hasil pencarian untuk "{lastQuery}"</p>}
           </div>
       </div>

       {isSearching && (
         <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-600 rounded-full animate-spin mb-4"></div>
            <p className="animate-pulse font-medium">Menghubungkan ke YouTube...</p>
         </div>
       )}

       {!isSearching && error && (
         <div className="text-center py-10 px-6 bg-red-50 rounded-[2rem] border border-red-100 mx-4">
            <p className="text-red-500 font-bold mb-2">Gagal Memuat</p>
            <p className="text-red-400 text-sm">{error}</p>
         </div>
       )}

       {!isSearching && !error && results.length === 0 && lastQuery && (
           <div className="text-center py-10 text-gray-400">
               Tidak ditemukan hasil di YouTube. Coba kata kunci lain.
           </div>
       )}
       
       {!isSearching && !error && results.length === 0 && !lastQuery && (
           <div className="text-center py-20 text-gray-300 flex flex-col items-center">
               <Search size={48} className="mb-4 opacity-50" />
               <p>Cari lagu apapun dari YouTube.</p>
           </div>
       )}

       {!isSearching && results.length > 0 && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            {results.map((song, i) => (
                <div key={song.id} className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 group ${currentSong?.id === song.id ? 'bg-red-50' : ''}`}>
                    {/* Cover Art */}
                    <div 
                        className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden mr-4 flex-shrink-0 relative shadow-sm"
                        onClick={() => playSong(song)}
                    >
                        {song.coverArt ? (
                            <img src={song.coverArt} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300"><Music size={20}/></div>
                        )}
                        
                        {/* Overlay Play Icon */}
                        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity ${currentSong?.id === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                             {currentSong?.id === song.id && isPlaying ? (
                                 <Pause size={20} className="text-white drop-shadow-md" fill="currentColor"/>
                             ) : (
                                 <Play size={20} className="text-white drop-shadow-md ml-0.5" fill="currentColor"/>
                             )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 pr-4" onClick={() => playSong(song)}>
                        <div className={`font-bold text-sm truncate mb-0.5 ${currentSong?.id === song.id ? 'text-red-600' : 'text-gray-800'}`}>{song.title}</div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                            {song.artist} 
                            <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span> 
                            <span className="text-red-600 bg-red-50 px-1.5 rounded text-[10px] font-bold border border-red-100">YouTube</span>
                        </div>
                    </div>

                    {/* Duration Display */}
                    <div className="text-xs font-mono text-gray-400 flex-shrink-0">
                         {Math.floor(song.duration / 60)}:{(Math.floor(song.duration % 60)).toString().padStart(2, '0')}
                    </div>
                </div>
            ))}
        </div>
       )}
    </div>
  );
};

export default SearchView;
