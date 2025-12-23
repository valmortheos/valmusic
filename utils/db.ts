
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
    
    // Kita simpan File object-nya langsung. IndexedDB support menyimpan Blob/File.
    // Note: URL blob tidak bisa disimpan, harus dibuat ulang saat load.
    const songToSave = { ...song, url: '' }; 
    
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
      // Regenerate Blob URLs
      const songsWithUrls = songs.map(song => ({
        ...song,
        url: URL.createObjectURL(song.file)
      }));
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
    
    // Cek dulu apakah item ada
    const checkRequest = store.get(id);

    checkRequest.onsuccess = () => {
        if (!checkRequest.result) {
            console.warn(`Item dengan id ${id} tidak ditemukan di DB, menganggap sudah terhapus.`);
            resolve(); // Resolve anyway
            return;
        }

        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => {
            // Tunggu transaksi selesai sepenuhnya
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
