
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { getCloudConfigs } from '../utils/cloudMusicLoader';
import { fetchCloudSongFromConfig, generateCloudId } from '../services/cloudMetadataService';

export const useCloudLibrary = (
    existingSongs: Song[], 
    setSongs: React.Dispatch<React.SetStateAction<Song[]>>
) => {
    const [isCloudLoaded, setIsCloudLoaded] = useState(false);
    const hasRun = useRef(false);

    useEffect(() => {
        // Cegah running berulang kali dalam satu siklus mount, 
        // tapi kita izinkan running lagi jika existingSongs berubah drastis (misal kosong lalu terisi dari DB)
        // Kita gunakan flag sederhana untuk memastikan init cloud hanya sekali setelah DB ready.
        if (isCloudLoaded || hasRun.current) return;
        
        // Tunggu sebentar sampai existingSongs dari DB minimal terpopulasi (jika ada)
        // Atau langsung jalan jika memang kosong.
        // Kita asumsikan hook ini dipanggil di App.tsx setelah usePreloadedSongs
        
        const loadCloudSongs = async () => {
            hasRun.current = true;
            const configs = getCloudConfigs();
            const newSongs: Song[] = [];
            
            // List lagu yang perlu di-update URL-nya (Hydration/Repair)
            const idsToHydrate: Map<string, string> = new Map();

            // 1. Analisis Config vs Existing Songs
            const configsToFetch = configs.filter(config => {
                const cloudId = generateCloudId(config.audioUrl);
                
                // Cek apakah lagu ini sudah ada di library (dari DB)
                const existingSong = existingSongs.find(s => s.id === cloudId);

                if (existingSong) {
                    // SUDAH ADA.
                    // Cek apakah URL-nya valid? Jika kosong (akibat bug lama), kita perlu perbaiki.
                    if (!existingSong.url || existingSong.url.trim() === '') {
                        idsToHydrate.set(cloudId, config.audioUrl);
                    }
                    // Skip fetch metadata ulang, kita pakai data DB (yang mungkin sudah ada playCount/Favorite)
                    return false;
                }
                
                // BELUM ADA. Lanjut fetch.
                return true;
            });

            // 2. Hydrate/Repair URL lagu yang ada di DB tapi URL kosong
            if (idsToHydrate.size > 0) {
                setSongs(prevSongs => prevSongs.map(s => {
                    if (idsToHydrate.has(s.id)) {
                        console.log(`[CloudLib] Repaired URL for ${s.title}`);
                        return { ...s, url: idsToHydrate.get(s.id)! };
                    }
                    return s;
                }));
            }

            // 3. Fetch Lagu Baru (yang benar-benar belum ada)
            if (configsToFetch.length > 0) {
                const promises = configsToFetch.map(config => fetchCloudSongFromConfig(config));
                const results = await Promise.all(promises);
                
                results.forEach(song => {
                    if (song) newSongs.push(song);
                });

                if (newSongs.length > 0) {
                    setSongs(prev => {
                        // Double check terakhir sebelum insert ke state
                        const safeNewSongs = newSongs.filter(ns => !prev.some(ps => ps.id === ns.id));
                        return [...prev, ...safeNewSongs];
                    });
                }
            }
            
            setIsCloudLoaded(true);
        };

        // Jalankan logic
        loadCloudSongs();

    }, [isCloudLoaded, setSongs, existingSongs]);

    return { isCloudLoaded };
};
