
import { Song } from '../types';

export type SortOption = 'AZ' | 'MOST_PLAYED';

export const sortSongs = (songs: Song[], option: SortOption): Song[] => {
    const sorted = [...songs];

    switch (option) {
        case 'MOST_PLAYED':
            return sorted.sort((a, b) => {
                const countA = a.playCount || 0;
                const countB = b.playCount || 0;
                
                // Jika playCount sama, fallback ke A-Z
                if (countB === countA) {
                    return a.title.localeCompare(b.title);
                }
                return countB - countA; // Descending (Terbanyak di atas)
            });
            
        case 'AZ':
        default:
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
};

/**
 * Cek apakah user sudah memiliki riwayat pemutaran lagu yang cukup
 * untuk mengaktifkan mode "Most Played" secara otomatis.
 */
export const hasPlayHistory = (songs: Song[]): boolean => {
    // Mengembalikan true jika setidaknya ada 1 lagu yang playCount-nya > 0
    return songs.some(s => (s.playCount || 0) > 0);
};
