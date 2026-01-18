
import { Song } from '../types';

/**
 * Mengambil Blob dari URL Remote, membaca metadata ID3,
 * dan mengembalikan update partial untuk objek Song.
 */
export const fetchAndParseCloudMetadata = async (song: Song): Promise<Partial<Song> | null> => {
    try {
        // 1. Fetch File Blob
        const response = await fetch(song.url);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();

        // 2. Buat Local Blob URL (Cache Memory)
        // Ini agar WaveSurfer nanti play dari memori, bukan fetch ulang ke Vercel
        const localBlobUrl = URL.createObjectURL(blob);

        // 3. Baca Metadata menggunakan JSMediaTags
        return new Promise((resolve) => {
            // @ts-ignore
            if (typeof window.jsmediatags !== 'undefined') {
                // @ts-ignore
                window.jsmediatags.read(blob, {
                    onSuccess: (tag: any) => {
                        const { tags } = tag;
                        let coverArt = undefined;

                        if (tags.picture) {
                            const { data, format } = tags.picture;
                            let base64String = "";
                            const uint8Array = new Uint8Array(data);
                            const len = uint8Array.byteLength;
                            for (let i = 0; i < len; i++) {
                                base64String += String.fromCharCode(uint8Array[i]);
                            }
                            coverArt = `data:${format};base64,${window.btoa(base64String)}`;
                        }

                        // Format File Size
                        const sizeInMB = (blob.size / (1024 * 1024)).toFixed(1) + ' MB';

                        resolve({
                            title: tags.title || song.title, // Prioritas metadata, fallback ke filename
                            artist: tags.artist || song.artist,
                            album: tags.album || "Cloud Collection",
                            year: tags.year,
                            genre: tags.genre,
                            coverArt: coverArt,
                            url: localBlobUrl, // Update URL ke versi Blob lokal (Cache)
                            fileSize: sizeInMB,
                            duration: 0 // Duration akan didapat saat audio di-load WaveSurfer
                        });
                    },
                    onError: (error: any) => {
                        console.warn(`Gagal baca ID3 ${song.title}:`, error);
                        // Tetap return blob url agar playable meski metadata gagal
                        resolve({ 
                            url: localBlobUrl,
                            fileSize: (blob.size / (1024 * 1024)).toFixed(1) + ' MB'
                        }); 
                    }
                });
            } else {
                resolve({ url: localBlobUrl });
            }
        });

    } catch (error) {
        console.error("Error fetching cloud song:", error);
        return null;
    }
};
