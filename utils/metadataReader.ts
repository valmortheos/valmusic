
import { Song } from '../types';

export const readMetadata = (file: File): Promise<Partial<Song>> => {
    return new Promise((resolve) => {
      // @ts-ignore
      if (typeof window.jsmediatags !== 'undefined') {
        // @ts-ignore
        window.jsmediatags.read(file, {
          onSuccess: (tag: any) => {
            const { tags } = tag;
            let coverArt = undefined;
            
            if (tags.picture) {
              const { data, format } = tags.picture;
              let base64String = "";
              // Optimalisasi konversi buffer ke string untuk gambar besar
              const uint8Array = new Uint8Array(data);
              const len = uint8Array.byteLength;
              for (let i = 0; i < len; i++) {
                  base64String += String.fromCharCode(uint8Array[i]);
              }
              coverArt = `data:${format};base64,${window.btoa(base64String)}`;
            }

            resolve({ 
                title: tags.title, 
                artist: tags.artist, 
                album: tags.album, 
                year: tags.year,
                genre: tags.genre,
                coverArt 
            });
          },
          onError: (error: any) => {
            console.warn("Metadata read error:", error);
            resolve({});
          }
        });
      } else {
        console.warn("jsmediatags not loaded");
        resolve({});
      }
    });
};
