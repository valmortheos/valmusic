
import React, { useState, useEffect, useRef } from 'react';
import { LyricLine, Song } from '../types';
import { useLyrics } from '../hooks/useLyrics';
import { Mic2, Edit3, Save, X } from './Icons';

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

    // Load lirik ke editor saat mode edit aktif
    useEffect(() => {
        if (isEditing) {
            if (song.lyrics && song.lyrics.length > 0) {
                setRawText(stringifyLyrics(song.lyrics));
            } else {
                setRawText('');
            }
        }
    }, [isEditing, song]);

    // Handle User Scroll Detection
    const handleScroll = () => {
        if (!isEditing) {
            setUserIsScrolling(true);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = window.setTimeout(() => {
                setUserIsScrolling(false);
            }, 2500); // Resume auto-scroll after 2.5s inactivity
        }
    };

    // Enhanced Auto Scroll Logic
    useEffect(() => {
        if (!isEditing && !userIsScrolling && song.lyrics && lyricsContainerRef.current) {
            const activeIndex = getActiveLyricIndex(song.lyrics, currentTime);
            
            if (activeIndex !== -1) {
                const container = lyricsContainerRef.current;
                const activeEl = container.children[activeIndex + 1] as HTMLElement; // +1 karena spacer atas

                if (activeEl) {
                    const containerHeight = container.offsetHeight;
                    const elTop = activeEl.offsetTop;
                    const elHeight = activeEl.offsetHeight;

                    // Kalkulasi posisi agar elemen ada di tengah persis
                    const targetScrollTop = elTop - (containerHeight / 2) + (elHeight / 2);

                    container.scrollTo({
                        top: targetScrollTop,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [currentTime, isEditing, song, getActiveLyricIndex, userIsScrolling]);

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
                />
                
                <button 
                    onClick={handleSave} 
                    className="mt-4 w-full py-3 rounded-xl font-bold bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Save size={18} /> Simpan Lirik
                </button>
            </div>
        );
    }

    if (!song.lyrics || song.lyrics.length === 0) {
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

    const activeIndex = getActiveLyricIndex(song.lyrics, currentTime);

    return (
        <div className="w-full h-full flex flex-col animate-fade-in py-2 relative z-20">
            <div 
                className="flex-1 overflow-y-auto lyrics-container text-center px-4 md:px-8 space-y-6 no-scrollbar" 
                ref={lyricsContainerRef}
                onScroll={handleScroll}
                onTouchMove={handleScroll}
                style={{
                    // Gradient mask untuk efek fade di atas dan bawah
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
                }}
            >
                {/* Spacer Atas untuk centering lirik pertama */}
                <div className="h-[45%] flex-shrink-0 w-full"></div>
                
                {song.lyrics.map((line, idx) => {
                    const isActive = idx === activeIndex;
                    const isNear = Math.abs(idx - activeIndex) <= 1;
                    
                    return (
                        <p 
                            key={`${idx}-${line.time}`} 
                            className={`
                                transition-all duration-700 ease-[cubic-bezier(0.25,0.4,0.25,1)] cursor-pointer origin-center font-sans tracking-tight leading-normal
                                ${isActive 
                                    ? 'text-2xl md:text-4xl font-extrabold scale-110 py-2 opacity-100 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-[var(--color-primary)] drop-shadow-sm filter brightness-110' 
                                    : isNear 
                                        ? 'text-lg md:text-xl font-semibold text-gray-500/80 scale-100 blur-[0.3px] opacity-80'
                                        : 'text-sm md:text-base font-medium text-gray-400/40 scale-95 blur-[0.8px] opacity-50'
                                }
                                hover:opacity-100 hover:blur-0 hover:scale-105 hover:text-gray-700
                            `}
                            onClick={() => onSeek(line.time)}
                        >
                            {line.text}
                        </p>
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
