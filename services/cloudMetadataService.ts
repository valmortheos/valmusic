
import { Song } from '../types';
import { CloudSongConfig } from '../utils/cloudMusicLoader';

// Struktur JSON Metadata
interface CloudMetadataJSON {
    common?: {
        title?: string;
        artist?: string;
        album?: string;
        year?: number;
        genre?: string[] | string;
        picture?: any[];
    };
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    genre?: string;
}

/**
 * Helper untuk menghasilkan ID yang konsisten untuk lagu Cloud.
 * Digunakan untuk deduplikasi antara DB Local dan Cloud Config.
 */
export const generateCloudId = (audioUrl: string): string => {
    const decodedUrl = decodeURIComponent(audioUrl);
    const filenameWithExt = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);
    const filename = filenameWithExt.split('.')[0]; 
    // Bersihkan karakter aneh agar ID bersih
    return `cloud-${filename.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase()}`;
};

export const fetchCloudSongFromConfig = async (config: CloudSongConfig): Promise<Song | null> => {
    try {
        // 1. Fetch Metadata JSON
        const metaRes = await fetch(config.metadataUrl);
        if (!metaRes.ok) throw new Error(`Failed to fetch metadata for ${config.metadataUrl}`);
        
        const metaJson: CloudMetadataJSON = await metaRes.json();
        
        // 2. Generate ID & Fallback info
        const decodedUrl = decodeURIComponent(config.audioUrl);
        const filenameWithExt = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);
        const filename = filenameWithExt.split('.')[0].replace(/-/g, ' '); 
        
        const id = generateCloudId(config.audioUrl);

        // 3. Extract Metadata
        const common = metaJson.common || {};
        
        const title = common.title || metaJson.title || filename;
        const artist = common.artist || metaJson.artist || "Unknown Artist";
        const album = common.album || metaJson.album || "ValMusic Cloud";
        const year = (common.year || metaJson.year || new Date().getFullYear()).toString();
        
        let genre = "Pop";
        if (Array.isArray(common.genre) && common.genre.length > 0) {
            genre = common.genre[0];
        } else if (typeof common.genre === 'string') {
            genre = common.genre;
        } else if (metaJson.genre) {
            genre = metaJson.genre;
        }

        // 4. Construct Song Object
        const song: Song = {
            id: id,
            title: title,
            artist: artist,
            album: album,
            year: year,
            genre: genre,
            duration: 0,
            url: config.audioUrl,
            coverArt: config.coverUrl,
            format: 'MP3',
            fileSize: 'Streaming',
            isOnline: true,
            isFavorite: false
        };

        return song;

    } catch (error) {
        console.error("Error fetching cloud song config:", error, config);
        return null;
    }
};
