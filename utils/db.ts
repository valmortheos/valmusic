
import { Song } from '../types';

const DB_NAME = 'ValMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'songs';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveSongToDB = async (song: Song): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // LOGIC UPDATE:
    // Jika lagu offline (punya File object), kosongkan URL karena Blob URL bersifat sementara.
    // Jika lagu online (isOnline), simpan URL-nya karena itu link streaming statis.
    let urlToSave = '';
    if (song.isOnline && song.url.startsWith('http')) {
        urlToSave = song.url;
    }

    const songToSave = { ...song, url: urlToSave }; 
    
    const request = store.put(songToSave);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllSongsFromDB = async (): Promise<Song[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const songs = request.result as Song[];
      // Regenerate Blob URLs for local files
      const songsWithUrls = songs.map(song => {
        // Jika ada file lokal, buat Blob URL baru
        if (song.file) {
            return {
                ...song,
                url: URL.createObjectURL(song.file)
            };
        }
        // Jika lagu online dan URL tersimpan, gunakan itu. 
        // Jika URL kosong (legacy bug), biarkan kosong dulu (nanti di-fix oleh hooks)
        return song;
      });
      resolve(songsWithUrls);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteSongFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const checkRequest = store.get(id);

    checkRequest.onsuccess = () => {
        if (!checkRequest.result) {
            console.warn(`Item dengan id ${id} tidak ditemukan di DB, menganggap sudah terhapus.`);
            resolve();
            return;
        }

        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => {
            transaction.oncomplete = () => {
                resolve();
            };
        };
        
        deleteRequest.onerror = () => {
            console.error("Gagal menghapus item:", deleteRequest.error);
            reject(deleteRequest.error);
        };
    };

    checkRequest.onerror = () => reject(checkRequest.error);
  });
};
