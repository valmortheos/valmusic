
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LyricLine, Song } from '../types';
import { useLyrics } from '../hooks/useLyrics';
import { Mic2, Edit3, Save, X, Music } from './Icons';
import { SYNCED_LYRICS_DB } from '../data/syncedLyricsDb';
import { convertEnhancedLyrics } from '../utils/lyricsConverter';
import SyncedLine from './lyrics/SyncedLine';

interface LyricsManagerProps {
    song: Song;
    currentTime: number;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    onSave: (id: string, lyrics: LyricLine[]) => void;
    onSeek: (time: number) => void;
}

const LyricsManager: React.FC<LyricsManagerProps> = ({ 
    song, currentTime, isEditing, setIsEditing, onSave, onSeek
}) => {
    const { parseLyrics, stringifyLyrics, getActiveLyricIndex } = useLyrics();
    const [rawText, setRawText] = useState('');
    const lyricsContainerRef = useRef<HTMLDivElement>(null);
    const [userIsScrolling, setUserIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<number | null>(null);
    const lastScrollIndexRef = useRef<number>(-1);

    // --- KONFIGURASI OFFSET ---
    // Highlight Offset: Waktu kompensasi visual agar warna pas (0.1s - 0.2s)
    const HIGHLIGHT_OFFSET = 0.2; 
    
    // Scroll Offset: "Pre-scroll" - Seberapa jauh ke depan (detik) lirik harus naik 
    // sebelum dinyanyikan. 0.7s - 1.0s biasanya ideal untuk baca cepat.
    const SCROLL_LOOKAHEAD = 0.7; 

    // --- LOGIKA ENHANCED LYRICS (DB LOCAL) ---
    const dbEnhancedLyrics = useMemo(() => {
        const cleanStr = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
        const artist = cleanStr(song.artist);
        const title = cleanStr(song.title);
        
        const keysToTry = [`${artist} - ${title}`, `${title} - ${artist}`, title];

        for (const key of keysToTry) {
            if (SYNCED_LYRICS_DB[key]) {
                return convertEnhancedLyrics(SYNCED_LYRICS_DB[key]);
            }
        }

        const foundKey = Object.keys(SYNCED_LYRICS_DB).find(k => {
             const cleanKey = cleanStr(k);
             return cleanKey.includes(title) && cleanKey.includes(artist);
        });
        
        if (foundKey) return convertEnhancedLyrics(SYNCED_LYRICS_DB[foundKey]);
        return null;
    }, [song.id, song.title, song.artist]);

    const activeLyrics = dbEnhancedLyrics || song.lyrics;

    const isEnhanced = useMemo(() => {
        if (dbEnhancedLyrics) return true;
        if (song.lyrics && song.lyrics.some(line => line.words && line.words.length > 0)) return true;
        return false;
    }, [dbEnhancedLyrics, song.lyrics]);

    useEffect(() => {
        if (isEditing) {
            if (activeLyrics && activeLyrics.length > 0) {
                setRawText(stringifyLyrics(activeLyrics));
            } else {
                setRawText('');
            }
        }
    }, [isEditing, activeLyrics]);

    const handleScroll = () => {
        if (!isEditing) {
            setUserIsScrolling(true);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = window.setTimeout(() => {
                setUserIsScrolling(false);
            }, 2500); 
        }
    };

    // --- DUAL INDEX CALCULATION ---
    
    // 1. Highlight Index: Untuk pewarnaan (Sync Ketat)
    const activeIndex = useMemo(() => {
        return getActiveLyricIndex(activeLyrics, currentTime, HIGHLIGHT_OFFSET);
    }, [activeLyrics, currentTime, getActiveLyricIndex]);

    // 2. Scroll Index: Untuk posisi scroll (Sync Longgar / Lookahead)
    const scrollIndex = useMemo(() => {
        return getActiveLyricIndex(activeLyrics, currentTime, SCROLL_LOOKAHEAD);
    }, [activeLyrics, currentTime, getActiveLyricIndex]);


    // --- SCROLLING LOGIC ---
    // Menggunakan useEffect yang bergantung pada `scrollIndex` (bukan activeIndex)
    useEffect(() => {
        // Cek validitas: mode baca, user tidak sedang scroll, container ada, index valid
        if (!isEditing && !userIsScrolling && lyricsContainerRef.current && scrollIndex !== -1) {
            
            // Optimasi: Jangan scroll ulang jika index belum berubah
            if (scrollIndex === lastScrollIndexRef.current) return;
            lastScrollIndexRef.current = scrollIndex;

            const container = lyricsContainerRef.current;
            // +1 karena ada spacer div di awal container
            const targetEl = container.children[scrollIndex + 1] as HTMLElement; 

            if (targetEl) {
                const containerHeight = container.offsetHeight;
                const elTop = targetEl.offsetTop;
                const elHeight = targetEl.offsetHeight;
                
                // Kalkulasi posisi tengah persis
                const targetScrollTop = elTop - (containerHeight / 2) + (elHeight / 2);

                container.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth' 
                });
            }
        }
    }, [scrollIndex, isEditing, userIsScrolling]);

    const handleSave = () => {
        const parsed = parseLyrics(rawText);
        onSave(song.id, parsed);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="w-full h-full flex flex-col animate-fade-in py-4 relative z-20">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-bold text-gray-800 text-xs uppercase tracking-widest flex items-center gap-2">
                        <Edit3 size={14}/> Editor Lirik
                    </h3>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors">
                        <X size={16} className="text-gray-700"/>
                    </button>
                </div>
                
                <textarea 
                    className="flex-1 w-full bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-4 font-mono text-xs md:text-sm text-gray-800 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-none shadow-inner placeholder-gray-400 leading-relaxed"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={`Contoh Format:\n[00:14.50] Baris lirik pertama\n[00:18.20] Baris lirik kedua...`}
                    spellCheck={false}
                    disabled={isEnhanced} 
                />
                
                {isEnhanced ? (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold text-center border border-blue-100">
                        Lirik disinkronisasi otomatis (Enhanced). Tidak dapat diedit manual.
                    </div>
                ) : (
                    <button 
                        onClick={handleSave} 
                        className="mt-4 w-full py-3 rounded-xl font-bold bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Simpan Lirik
                    </button>
                )}
            </div>
        );
    }

    if (!activeLyrics || activeLyrics.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fade-in relative z-20">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-white border border-white/30 shadow-lg">
                    <Mic2 size={32} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1 drop-shadow-sm">Lirik Kosong</h3>
                <p className="text-xs text-gray-500 mb-6 max-w-[200px]">Lirik belum tersedia untuk lagu ini.</p>
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-white/80 backdrop-blur-sm px-6 py-2.5 rounded-full text-xs font-bold shadow-sm text-[var(--color-primary)] hover:scale-105 transition-transform border border-white/50 flex items-center gap-2"
                >
                    <Edit3 size={14}/> Tambah Lirik
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col animate-fade-in py-2 relative z-20">
            {isEnhanced && (
                <div className="absolute top-0 right-4 z-30">
                     <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
                        <Music size={8} /> SYNCED
                     </span>
                </div>
            )}

            <div 
                className="flex-1 overflow-y-auto lyrics-container text-center px-4 md:px-6 space-y-7 no-scrollbar" 
                ref={lyricsContainerRef}
                onScroll={handleScroll}
                onTouchMove={handleScroll}
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
                }}
            >
                {/* Spacer Atas - Proporsional agar lirik pertama bisa ke tengah */}
                <div className="h-[45%] flex-shrink-0 w-full"></div>
                
                {activeLyrics.map((line, idx) => {
                    const isActive = idx === activeIndex;
                    
                    // Style logic menggunakan 'isActive' (Highlight Index), bukan Scroll Index
                    return (
                        <div 
                            key={`${idx}-${line.time}`} 
                            className={`
                                transition-all duration-500 ease-out cursor-pointer font-sans tracking-tight leading-relaxed
                                text-xl md:text-3xl font-bold
                                ${isActive 
                                    ? 'opacity-100 scale-100 blur-0 text-gray-900 z-10'  // Active
                                    : 'opacity-40 scale-100 blur-[1px] text-gray-500 z-0' // Inactive
                                }
                                hover:opacity-80 hover:blur-0
                            `}
                            onClick={() => onSeek(line.time)}
                        >
                            <SyncedLine 
                                text={line.text}
                                words={line.words}
                                currentTime={currentTime}
                                isActive={isActive}
                                isNear={false} 
                                onSeek={onSeek}
                            />
                        </div>
                    )
                })}
                
                {/* Spacer Bawah */}
                <div className="h-[45%] flex-shrink-0 w-full"></div>
            </div>
            
            <button 
                onClick={() => setIsEditing(true)} 
                className="absolute bottom-4 right-4 p-3 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-gray-500 hover:text-[var(--color-primary)] transition-all border border-white/20 shadow-lg z-30 opacity-0 hover:opacity-100 group-hover:opacity-100"
                title="Edit Lirik"
            >
                <Edit3 size={16} />
            </button>
        </div>
    );
};

export default LyricsManager;
