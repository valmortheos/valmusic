
import React, { useEffect, useState } from 'react';
import { Song } from '../types';
import { loadPreloadedSongs } from '../utils/localMusicLoader';

export const usePreloadedSongs = (existingSongs: Song[], setSongs: React.Dispatch<React.SetStateAction<Song[]>>) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isLoaded) return;

        const load = async () => {
            const preloaded = await loadPreloadedSongs();
            
            if (preloaded.length > 0) {
                setSongs(prev => {
                    const newSongs = [...prev];
                    
                    preloaded.forEach(ps => {
                        // STRICT CHECK:
                        // Prioritaskan ID check. Karena ID preloaded konsisten (preloaded-filename).
                        // Jika ID sama sudah ada (dari DB), JANGAN masukkan lagi.
                        // Data dari DB lebih "tinggi kasta" karena menyimpan status Favorite/PlayCount.
                        const idExists = newSongs.some(es => es.id === ps.id);
                        
                        if (!idExists) {
                            // Fallback check: Title & Artist (jika ID somehow beda tapi lagu sama)
                            const contentExists = newSongs.some(es => 
                                es.title === ps.title && 
                                es.artist === ps.artist &&
                                Math.abs(es.duration - ps.duration) < 2 // Toleransi durasi
                            );

                            if (!contentExists) {
                                newSongs.push(ps);
                            }
                        }
                    });
                    
                    return newSongs;
                });
            }
            setIsLoaded(true);
        };

        load();
    }, [isLoaded, setSongs]);

    return { isLoaded };
};
