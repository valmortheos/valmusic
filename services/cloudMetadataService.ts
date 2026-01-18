
import { Song } from '../types';
import { convertEnhancedLyrics } from '../utils/lyricsConverter';

/**
 * Mengambil Blob dari URL Remote, membaca metadata ID3,
 * dan mengembalikan update partial untuk objek Song.
 * SEKARANG JUGA FETCH LIRIK JSON.
 */
export const fetchAndParseCloudMetadata = async (song: Song): Promise<Partial<Song> | null> => {
    try {
        // Parallel Fetch: Audio Blob & Lyrics JSON
        const promises: Promise<any>[] = [
            fetch(song.url).then(res => res.ok ? res.blob() : null)
        ];

        if (song.lyricsUrl) {
            promises.push(
                fetch(song.lyricsUrl).then(res => res.ok ? res.json() : null).catch(() => null)
            );
        }

        const [blob, lyricsJson] = await Promise.all(promises);

        if (!blob) throw new Error('Failed to fetch audio blob');

        // 2. Buat Local Blob URL (Cache Memory)
        const localBlobUrl = URL.createObjectURL(blob);

        // 3. Proses Lirik (Jika ada)
        let parsedLyrics = undefined;
        if (lyricsJson) {
            try {
                parsedLyrics = convertEnhancedLyrics(lyricsJson);
                console.log(`[Cloud] Lyrics loaded for ${song.title}`);
            } catch (e) {
                console.warn("Failed to parse cloud lyrics", e);
            }
        }

        // 4. Baca Metadata menggunakan JSMediaTags
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
                            title: tags.title || song.title, // Prioritas metadata
                            artist: tags.artist || song.artist,
                            album: tags.album || "Cloud Collection",
                            year: tags.year,
                            genre: tags.genre,
                            coverArt: coverArt,
                            url: localBlobUrl, // Update URL ke versi Blob lokal
                            fileSize: sizeInMB,
                            duration: 0,
                            lyrics: parsedLyrics || song.lyrics // Gunakan lirik hasil fetch jika ada
                        });
                    },
                    onError: (error: any) => {
                        console.warn(`Gagal baca ID3 ${song.title}:`, error);
                        // Tetap return data yang berhasil didapat
                        resolve({ 
                            url: localBlobUrl,
                            fileSize: (blob.size / (1024 * 1024)).toFixed(1) + ' MB',
                            lyrics: parsedLyrics
                        }); 
                    }
                });
            } else {
                resolve({ 
                    url: localBlobUrl,
                    lyrics: parsedLyrics
                });
            }
        });

    } catch (error) {
        console.error("Error fetching cloud song data:", error);
        return null;
    }
};
