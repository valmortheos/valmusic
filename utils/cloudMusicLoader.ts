
import { Song } from '../types';

// Daftar URL lagu dari Vercel Blob Storage
const CLOUD_URLS = [
    "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/NIKI%20-%20lowkey.mp3",
    "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/Portugal.%20The%20Man%20-%20Glide.mp3",
    "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/The%20Chainsmokers%20-%20Closer.mp3"
];

// Helper untuk mendekode nama file dari URL
const parseSongFromUrl = (url: string): Song => {
    // 1. Ambil nama file dari URL (decodeURI untuk mengubah %20 jadi spasi)
    const decodedUrl = decodeURIComponent(url);
    const filenameWithExt = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);
    
    // 2. Pisahkan nama dan ekstensi
    const lastDotIndex = filenameWithExt.lastIndexOf('.');
    const filename = lastDotIndex !== -1 ? filenameWithExt.substring(0, lastDotIndex) : filenameWithExt;
    const extension = lastDotIndex !== -1 ? filenameWithExt.substring(lastDotIndex + 1).toUpperCase() : 'MP3';

    // 3. Pisahkan Artis dan Judul (Format: Artis - Judul)
    let artist = "Unknown Artist";
    let title = filename;

    if (filename.includes(' - ')) {
        const parts = filename.split(' - ');
        artist = parts[0].trim();
        // Gabungkan sisa bagian jika ada dash lain di judul
        title = parts.slice(1).join(' - ').trim();
    }

    // 4. Buat ID unik berdasarkan URL agar konsisten
    // Kita gunakan btoa (base64) dari filename agar unik dan reproducible
    const id = `cloud-${btoa(filename).replace(/=/g, '').substring(0, 10)}`;

    return {
        id: id,
        title: title,
        artist: artist,
        album: "ValMusic Cloud", // Album default untuk lagu streaming
        duration: 0, // Akan terisi saat di-load player
        url: url,
        format: extension,
        isOnline: true,
        coverArt: undefined, // Bisa diisi URL gambar default jika mau
        fileSize: "Streaming",
        genre: "Cloud Pop"
    };
};

export const getCloudSongs = (): Song[] => {
    return CLOUD_URLS.map(parseSongFromUrl);
};
