
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { getCloudSongs } from '../utils/cloudMusicLoader';
import { fetchAndParseCloudMetadata } from '../services/cloudMetadataService';

export const useCloudLibrary = (
    existingSongs: Song[], 
    setSongs: React.Dispatch<React.SetStateAction<Song[]>>
) => {
    const [isCloudLoaded, setIsCloudLoaded] = useState(false);
    const processingRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (isCloudLoaded) return;

        // 1. Ambil definisi lagu cloud (Basic Info dari URL/Filename)
        const cloudSongs = getCloudSongs();
        
        // Filter lagu yang belum ada di library lokal
        const songsToAdd: Song[] = [];

        cloudSongs.forEach(cloudSong => {
            const isExistsLocally = existingSongs.some(s => 
                s.title.toLowerCase() === cloudSong.title.toLowerCase() && 
                s.artist.toLowerCase() === cloudSong.artist.toLowerCase() &&
                !s.isOnline
            );
            const isAlreadyInState = existingSongs.some(s => s.id === cloudSong.id);

            if (!isExistsLocally && !isAlreadyInState) {
                songsToAdd.push(cloudSong);
            }
        });

        if (songsToAdd.length > 0) {
            // A. Tampilkan "Skeleton" lagu dulu (Nama dari file) agar UI responsif
            setSongs(prev => [...prev, ...songsToAdd]);

            // B. Proses Metadata di Background (Enhancement)
            songsToAdd.forEach(async (song) => {
                if (processingRef.current.has(song.id)) return;
                processingRef.current.add(song.id);

                const enhancedData = await fetchAndParseCloudMetadata(song);
                
                if (enhancedData) {
                    setSongs(prevSongs => prevSongs.map(s => {
                        if (s.id === song.id) {
                            return { ...s, ...enhancedData };
                        }
                        return s;
                    }));
                }
            });
        }

        setIsCloudLoaded(true);

    }, [isCloudLoaded, setSongs, existingSongs]);

    return { isCloudLoaded };
};
