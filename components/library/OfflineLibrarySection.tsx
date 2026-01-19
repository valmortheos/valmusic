
import React, { useMemo } from 'react';
import { Song } from '../../types';
import { Music, Play, Mic2, Disc, Trash2, BarChart2 } from '../Icons';

interface OfflineLibrarySectionProps {
    songs: Song[];
    currentSong: Song | null;
    playSong: (s: Song) => void;
    onDelete?: (id: string) => void;
}

const OfflineLibrarySection: React.FC<OfflineLibrarySectionProps> = ({ songs, currentSong, playSong, onDelete }) => {
    
    // 1. Filter hanya lagu Offline
    const offlineSongs = useMemo(() => songs.filter(s => !s.isOnline), [songs]);

    // 2. Grouping untuk Section Artis & Genre (Hanya dari lagu offline)
    const { artists, genres } = useMemo(() => {
        const a: Record<string, number> = {};
        const g: Record<string, number> = {};

        offlineSongs.forEach(s => {
            const artist = s.artist || 'Unknown';
            const genre = s.genre || 'Unknown';
            a[artist] = (a[artist] || 0) + 1;
            g[genre] = (g[genre] || 0) + 1;
        });

        return { 
            artists: Object.entries(a).sort((a,b) => b[1] - a[1]), // Sort by count desc
            genres: Object.entries(g).sort((a,b) => b[1] - a[1]) 
        };
    }, [offlineSongs]);

    if (offlineSongs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                <Music size={40} className="text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">Tidak ada musik offline.</p>
                <p className="text-xs text-gray-400 mt-1">Upload file musik untuk melihatnya disini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-up">
            {/* SECTION 1: ARTIS OFFLINE (Horizontal Scroll) */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 px-2">
                    <Mic2 size={18} className="text-[var(--color-primary)]" /> Artis Lokal
                </h3>
                <div className="flex overflow-x-auto gap-4 pb-4 px-2 no-scrollbar snap-x">
                    {artists.map(([name, count]) => {
                        // Cari satu cover art dari artis ini
                        const artistSong = offlineSongs.find(s => s.artist === name && s.coverArt);
                        return (
                            <div key={name} className="flex flex-col items-center gap-2 snap-start cursor-pointer group min-w-[80px]" onClick={() => {
                                // Simple play first song of artist
                                const first = offlineSongs.find(s => s.artist === name);
                                if(first) playSong(first);
                            }}>
                                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                                    {artistSong?.coverArt ? (
                                        <img src={artistSong.coverArt} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Mic2 size={20}/></div>
                                    )}
                                </div>
                                <div className="text-center max-w-[100px]">
                                    <p className="text-xs font-bold text-gray-700 truncate">{name}</p>
                                    <p className="text-[10px] text-gray-400">{count} Lagu</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* SECTION 2: GENRE OFFLINE (Horizontal Scroll Pill/Card) */}
            <div className="space-y-3">
                 <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 px-2">
                    <Disc size={18} className="text-[var(--color-primary)]" /> Genre Lokal
                </h3>
                <div className="flex overflow-x-auto gap-3 pb-2 px-2 no-scrollbar">
                    {genres.map(([name, count]) => (
                        <div key={name} className="flex-shrink-0 bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm hover:border-[var(--color-primary)] cursor-pointer transition-all" onClick={() => {
                             const first = offlineSongs.find(s => s.genre === name);
                             if(first) playSong(first);
                        }}>
                            <span className="font-bold text-gray-700 text-xs block mb-0.5">{name}</span>
                            <span className="text-[10px] text-gray-400 block">{count} Tracks</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION 3: ALL SONGS LIST (Vertical) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <Music size={18} className="text-[var(--color-primary)]" /> Semua Lagu Offline
                    </h3>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{offlineSongs.length}</span>
                </div>
                
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    {offlineSongs.map((song, i) => (
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
                                        <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200">
                                            {song.fileSize}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {onDelete && (
                                <button onClick={(e) => { e.stopPropagation(); if(confirm('Hapus?')) onDelete(song.id); }} className="p-2 text-gray-300 hover:text-red-500 flex-shrink-0 hover:bg-red-50 rounded-full transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OfflineLibrarySection;
