
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
                        // Cek duplikasi
                        const exists = newSongs.some(es => 
                            es.id === ps.id || 
                            (es.title === ps.title && es.artist === ps.artist)
                        );
                        if (!exists) {
                            newSongs.push(ps);
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
