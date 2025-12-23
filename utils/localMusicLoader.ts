
import { Song } from '../types';
import { parseLyrics } from './lyricsUtils';
import { readMetadata } from './metadataReader';

// Define types for the glob results
type GlobUrlResult = Record<string, () => Promise<string>>;
type GlobRawResult = Record<string, string>;

let musicFiles: GlobUrlResult = {};
let lrcFiles: GlobRawResult = {};

// Inisialisasi Glob dengan aman
try {
    // Vite specific: import.meta.glob
    // @ts-ignore
    musicFiles = import.meta.glob('../assets/music/*.{mp3,flac,wav,ogg,m4a,opus}', { 
        query: '?url', 
        import: 'default' 
    });
    
    // Load .lrc AND .txt files for lyrics
    // @ts-ignore
    lrcFiles = import.meta.glob('../assets/music/*.{lrc,txt}', { 
        query: '?raw', 
        import: 'default', 
        eager: true 
    });

} catch (e) {
    console.warn('ValMusic Info: Fitur scan folder assets otomatis tidak aktif.', e);
    musicFiles = {};
    lrcFiles = {};
}

export const loadPreloadedSongs = async (): Promise<Song[]> => {
    const loadedSongs: Song[] = [];
    const processedIds = new Set<string>();

    if (!musicFiles || Object.keys(musicFiles).length === 0) {
        return [];
    }

    const getFileName = (path: string) => {
        const parts = path.split('/');
        const fileWithExt = parts[parts.length - 1];
        // Remove extension carefully
        return fileWithExt.substring(0, fileWithExt.lastIndexOf('.'));
    };

    const getFileExt = (path: string) => {
        return path.split('.').pop()?.toUpperCase() || 'MP3';
    };

    try {
        for (const path in musicFiles) {
            const fileName = getFileName(path);
            const fileExt = getFileExt(path);
            const id = `preloaded-${fileName}`;

            if (processedIds.has(id)) continue;

            const urlFn = musicFiles[path];
            if (typeof urlFn !== 'function') continue;

            const url = await urlFn(); 
            const response = await fetch(url);
            const blob = await response.blob();
            
            const file = new File([blob], `${fileName}.${fileExt.toLowerCase()}`, { type: blob.type });

            // Logic sinkronisasi lirik: Cari file .lrc atau .txt dengan nama yang sama (case insensitive)
            const lrcKey = Object.keys(lrcFiles).find(key => {
                const lrcName = getFileName(key);
                return lrcName.toLowerCase() === fileName.toLowerCase();
            });

            let parsedLyrics = undefined;

            if (lrcKey) {
                const rawLrc = lrcFiles[lrcKey];
                parsedLyrics = parseLyrics(rawLrc);
            }

            let title = fileName.replace(/-/g, ' ').replace(/_/g, ' ');
            let artist = "Preloaded Music";
            
            if (title.includes(' - ')) {
                const parts = title.split(' - ');
                artist = parts[0];
                title = parts[1];
            }

            // Gunakan shared metadata reader
            const metadata = await readMetadata(file);

            const song: Song = {
                id: id,
                title: metadata.title || title,
                artist: metadata.artist || artist,
                album: metadata.album || "ValMusic Assets",
                year: metadata.year,
                genre: metadata.genre,
                duration: 0,
                url: URL.createObjectURL(file),
                file: file,
                coverArt: metadata.coverArt,
                format: fileExt,
                fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                lyrics: parsedLyrics,
                isFavorite: false
            };

            loadedSongs.push(song);
            processedIds.add(id);
        }
    } catch (error) {
        console.error("Gagal memuat musik lokal:", error);
    }

    return loadedSongs;
};
