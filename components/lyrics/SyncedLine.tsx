
import React from 'react';
import { LyricWord } from '../../types';

interface SyncedLineProps {
    text: string;
    words?: LyricWord[];
    currentTime: number;
    isActive: boolean;
    isNear: boolean;
    onSeek: (time: number) => void;
}

const SyncedLine: React.FC<SyncedLineProps> = ({ 
    text, words, currentTime, isActive, isNear, onSeek 
}) => {
    
    // Fallback jika tidak ada data kata per kata (LRC Biasa)
    if (!words || words.length === 0) {
        return (
            <span className={`transition-all duration-300 ${isActive ? 'text-white drop-shadow-[0_0_12px_var(--color-primary)]' : ''}`}>
                {text}
            </span>
        );
    }

    // RENDER KATA PER KATA
    return (
        <span className="leading-relaxed">
            {words.map((wordObj, i) => {
                const isWordActive = currentTime >= wordObj.start && currentTime <= wordObj.end;
                const isWordPassed = currentTime > wordObj.end;
                
                // Spacer antar kata
                const spacer = i < words.length - 1 ? " " : "";

                let wordClass = "transition-all duration-200 cursor-pointer inline-block ";

                if (isActive) {
                    if (isWordActive) {
                        // KATA SEDANG DINYANYIKAN (Highlight Utama)
                        // Style: Teks Putih + Shadow/Glow Warna Cover
                        wordClass += "text-white font-extrabold scale-105 origin-bottom ";
                        // Kita gunakan style inline untuk text-shadow agar bisa akses var css
                        // Shadow ganda: satu tajam, satu menyebar untuk efek glow
                    } else if (isWordPassed) {
                        // KATA SUDAH LEWAT
                        // Style: Putih solid (tanpa glow heboh), opacity tinggi
                        wordClass += "text-white opacity-90 font-bold ";
                    } else {
                        // KATA BELUM DINYANYIKAN (Tapi baris aktif)
                        // Style: Abu-abu transparan/gelap
                        wordClass += "text-gray-500/60 dark:text-gray-400/50 font-semibold "; 
                    }
                } else {
                     // BARIS TIDAK AKTIF (Inherit parent opacity)
                     wordClass += "";
                }

                // Custom Style untuk Shadow khusus kata aktif
                const customStyle: React.CSSProperties = (isActive && isWordActive) ? {
                    textShadow: '0 0 10px var(--color-primary), 0 0 20px var(--color-primary)',
                    filter: 'brightness(1.2)'
                } : {};

                return (
                    <React.Fragment key={i}>
                        <span 
                            className={wordClass}
                            style={customStyle}
                            onClick={(e) => {
                                e.stopPropagation(); 
                                onSeek(wordObj.start);
                            }}
                        >
                            {wordObj.word}
                        </span>
                        {spacer}
                    </React.Fragment>
                );
            })}
        </span>
    );
};

export default SyncedLine;
