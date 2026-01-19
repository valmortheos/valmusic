
import { Song } from '../types';

// Daftar Instance Piped API (YouTube Scraper).
// Diurutkan berdasarkan stabilitas & kecepatan saat ini.
const PIPED_INSTANCES = [
    'https://pipedapi.drgns.space',      // Seringkali paling stabil
    'https://api.piped.otter.sh',        // Alternatif kuat
    'https://pa.il.ax',                  // Server cepat
    'https://pipedapi.system41.xyz',
    'https://piped-api.garudalinux.org', // Server Garuda Linux
    'https://pipedapi.ducks.party',
    'https://api.piped.privacy.com.de',
    'https://pipedapi.kavin.rocks'       // Official (Sering rate-limited, taruh belakang)
];

interface PipedStream {
    url: string;
    format: string;
    quality: string;
    mimeType: string;
    bitrate: number;
    videoOnly: boolean;
    audioOnly: boolean;
}

export const searchOnlineMusic = async (keyword: string): Promise<Song[]> => {
  
  // Fungsi utama untuk melakukan request ke API dengan sistem failover
  const executeRequest = async (path: string): Promise<any> => {
      let lastError = null;

      // Coba setiap instance satu per satu sampai berhasil
      for (const baseUrl of PIPED_INSTANCES) {
          try {
              // Timeout controller: 8 detik per server agar tidak menunggu server mati terlalu lama
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000); 

              const res = await fetch(`${baseUrl}${path}`, { signal: controller.signal });
              clearTimeout(timeoutId);

              if (!res.ok) {
                  throw new Error(`HTTP ${res.status}`);
              }
              
              // Validasi Content-Type (Penting: Cloudflare sering return 200 OK tapi isinya HTML error)
              const contentType = res.headers.get("content-type");
              if (!contentType || !contentType.includes("application/json")) {
                  throw new Error("Received HTML/Invalid response instead of JSON");
              }

              const data = await res.json();
              return data; // Berhasil! Keluar dari loop dan return data

          } catch (e) {
              // Gagal di server ini, lanjut ke server berikutnya
              // console.warn(`Fail ${baseUrl}:`, e); 
              lastError = e;
              continue; 
          }
      }
      
      // Jika loop selesai dan tidak ada yang berhasil
      throw lastError || new Error("Semua server YouTube sibuk.");
  };

  try {
    // 1. SEARCH
    // Gunakan filter music_songs untuk hasil yang lebih akurat
    const searchPath = `/search?q=${encodeURIComponent(keyword)}&filter=music_songs`;
    let searchResult;
    
    try {
        searchResult = await executeRequest(searchPath);
    } catch (e) {
        // Fallback: Coba cari tanpa filter jika filter music_songs gagal (kadang server beda implementasi)
        const fallbackSearchPath = `/search?q=${encodeURIComponent(keyword)}`;
        searchResult = await executeRequest(fallbackSearchPath);
    }

    if (!searchResult.items || searchResult.items.length === 0) {
        throw new Error("Lagu tidak ditemukan.");
    }

    // Ambil hasil pertama yang valid (tipe stream)
    const firstItem = searchResult.items.find((i: any) => i.type === 'stream');
    if (!firstItem) throw new Error("Format video tidak didukung.");

    const videoId = firstItem.url.split('v=')[1]; 

    // 2. STREAMS
    const streamPath = `/streams/${videoId}`;
    const streamData = await executeRequest(streamPath);

    // 3. EXTRACT AUDIO
    const audioStreams: PipedStream[] = streamData.audioStreams;
    
    if (!audioStreams || audioStreams.length === 0) {
        throw new Error("Stream audio tidak tersedia.");
    }

    // Sortir berdasarkan bitrate tertinggi (M4A/MP3)
    audioStreams.sort((a, b) => b.bitrate - a.bitrate);
    const bestAudio = audioStreams[0];

    // 4. CONSTRUCT SONG OBJECT
    const song: Song = {
        id: `yt-${videoId}`,
        title: streamData.title,
        artist: streamData.uploader, 
        album: 'YouTube Music',
        year: new Date().getFullYear().toString(),
        genre: 'Pop/Online', 
        duration: streamData.duration || 0,
        url: bestAudio.url,
        coverArt: streamData.thumbnailUrl,
        format: bestAudio.format || 'M4A',
        bitrate: `${Math.round(bestAudio.bitrate / 1000)}kbps`,
        sampleRate: '44.1kHz',
        isOnline: true,
        fileSize: 'Stream',
        isFavorite: false
    };

    // Pembersihan Nama Artis/Judul yang umum di YouTube
    if (song.title.includes('-')) {
        const parts = song.title.split('-');
        if (parts.length >= 2) {
            song.artist = parts[0].trim();
            song.title = parts.slice(1).join('-')
                .replace(/\(Lyrics\)|\(Official Video\)|\(Official Audio\)|\(Audio\)|\[.*?\]/gi, '')
                .trim();
        }
    }

    return [song];

  } catch (error) {
    console.error("ValMusic Scraper Error:", error);
    throw new Error("Gagal memuat lagu. Server sedang sibuk, coba judul lain atau coba lagi nanti.");
  }
};
