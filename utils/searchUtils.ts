
import { Song } from '../types';

/**
 * Melakukan pencarian cerdas pada daftar lagu.
 * 
 * Rules:
 * 1. Jika query 1 karakter: Hanya cocokkan jika Judul/Artis DIAWALI huruf tersebut.
 * 2. Jika query > 1 karakter: Gunakan scoring system.
 *    - Score 100: Exact Match
 *    - Score 80: Starts With (Awal kalimat)
 *    - Score 60: Word Starts With (Awal kata, misal "Back" cocok dengan "Get Back")
 *    - Score 20: Contains (Hanya jika query cukup panjang)
 */
export const smartSearch = (songs: Song[], query: string): Song[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    // Mode Strict: 1 Karakter
    if (q.length === 1) {
        return songs.filter(song => {
            const title = song.title.toLowerCase();
            const artist = song.artist.toLowerCase();
            // Hanya return jika judul atau artis dimulai dengan huruf tersebut
            return title.startsWith(q) || artist.startsWith(q);
        }).sort((a, b) => a.title.localeCompare(b.title));
    }

    // Mode Scoring: > 1 Karakter
    return songs
        .map(song => {
            const title = song.title.toLowerCase();
            const artist = song.artist.toLowerCase();
            const album = (song.album || '').toLowerCase();
            
            let score = 0;

            // Cek Judul
            if (title === q) score += 100;
            else if (title.startsWith(q)) score += 80;
            else if (title.includes(` ${q}`)) score += 60; // Awal kata di tengah kalimat
            else if (title.includes(q)) score += 20;

            // Cek Artis
            if (artist === q) score += 90; // Sedikit di bawah judul exact match
            else if (artist.startsWith(q)) score += 70;
            else if (artist.includes(` ${q}`)) score += 50;
            else if (artist.includes(q)) score += 15;

            // Cek Album
            if (album.startsWith(q)) score += 40;
            else if (album.includes(q)) score += 10;

            return { song, score };
        })
        .filter(item => item.score > 0) // Hapus yang tidak cocok sama sekali
        .sort((a, b) => b.score - a.score) // Urutkan dari score tertinggi
        .map(item => item.song);
};
