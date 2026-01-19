
import { Song } from '../types';
import { parseLyrics } from './lyricsUtils';
import { readMetadata } from './metadataReader';

export const loadPreloadedSongs = async (): Promise<Song[]> => {
    const loadedSongs: Song[] = [];
    const processedIds = new Set<string>();

    try {
        // Migrasi ke Vite import.meta.glob karena require.context tidak tersedia di Vite/Browser standard
        // eager: true agar module langsung dimuat (bukan fungsi dynamic import)
        // import: 'default' agar langsung mendapat URL aset
        const musicFiles = import.meta.glob('../assets/music/*.{mp3,flac,wav,ogg,m4a,opus}', { 
            eager: true, 
            import: 'default' 
        }) as Record<string, string>;
        
        const lrcFiles = import.meta.glob('../assets/music/*.{lrc,txt}', { 
            eager: true, 
            import: 'default' 
        }) as Record<string, string>;

        const getFileName = (path: string) => {
            const parts = path.split('/');
            const fileWithExt = parts[parts.length - 1];
            return fileWithExt.substring(0, fileWithExt.lastIndexOf('.'));
        };

        const getFileExt = (path: string) => {
            return path.split('.').pop()?.toUpperCase() || 'MP3';
        };

        for (const path in musicFiles) {
            const fileName = getFileName(path);
            const fileExt = getFileExt(path);
            const id = `preloaded-${fileName}`;

            if (processedIds.has(id)) continue;

            const fileUrl = musicFiles[path];
            
            // Kita fetch blob dari URL tersebut untuk membuat File object
            // Ini diperlukan agar logic 'readMetadata' dan database yang butuh File object tetap jalan
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            
            const file = new File([blob], `${fileName}.${fileExt.toLowerCase()}`, { type: blob.type });

            // Logic sinkronisasi lirik
            // Cari file lirik yang memiliki nama file sama
            const lrcPath = Object.keys(lrcFiles).find(key => {
                const lrcName = getFileName(key);
                return lrcName.toLowerCase() === fileName.toLowerCase();
            });

            let parsedLyrics = undefined;

            if (lrcPath) {
                const lrcUrl = lrcFiles[lrcPath];
                const lrcRes = await fetch(lrcUrl);
                const rawLrc = await lrcRes.text();
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
        console.warn("ValMusic Info: Gagal scan folder assets otomatis atau folder kosong.", error);
    }

    return loadedSongs;
};
