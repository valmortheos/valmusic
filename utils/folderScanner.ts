

import { findBestLyricMatch } from './fileMatcher';

/**
 * Utility untuk File System Access API.
 * Memungkinkan membaca direktori secara rekursif.
 */

export interface ScannedFiles {
    audioFiles: File[];
    lyricFiles: File[];
}

// Helper untuk membaca entry direktori secara rekursif
async function getFileHandleIterator(directoryHandle: any, fileList: File[]) {
    for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
            const file = await entry.getFile();
            fileList.push(file);
        } else if (entry.kind === 'directory') {
            // Rekursif untuk sub-folder
            await getFileHandleIterator(entry, fileList);
        }
    }
}

export const scanDirectory = async (): Promise<ScannedFiles | null> => {
    try {
        // @ts-ignore - TypeScript standard library might not have showDirectoryPicker yet
        if (typeof window.showDirectoryPicker !== 'function') {
            alert("Browser Anda tidak mendukung fitur 'Buka Folder'. Gunakan fitur Upload biasa atau gunakan Chrome/Edge terbaru.");
            return null;
        }

        // @ts-ignore
        const directoryHandle = await window.showDirectoryPicker({
            id: 'valmusic_music_folder',
            mode: 'read'
        });

        const allFiles: File[] = [];
        await getFileHandleIterator(directoryHandle, allFiles);

        // Filter Audio dan Lirik
        const audioExtensions = ['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.opus'];
        const lyricExtensions = ['.lrc', '.txt'];

        const audioFiles = allFiles.filter(f => 
            audioExtensions.some(ext => f.name.toLowerCase().endsWith(ext)) || f.type.startsWith('audio/')
        );

        const lyricFiles = allFiles.filter(f => 
            lyricExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
        );

        return { audioFiles, lyricFiles };

    } catch (error) {
        // User cancel atau error permission
        if ((error as Error).name !== 'AbortError') {
            console.error("Gagal memindai folder:", error);
        }
        return null;
    }
};

/**
 * Fungsi untuk memproses hasil scan dan menggabungkan audio dengan lirik
 * tanpa harus melalui input event handler biasa.
 */
export const processScannedFiles = (
    scanned: ScannedFiles
): { audio: File, lyric: File | undefined }[] => {
    const results: { audio: File, lyric: File | undefined }[] = [];

    scanned.audioFiles.forEach(audioFile => {
        // Gunakan logic matching yang sudah ada
        const matchedLyric = findBestLyricMatch(audioFile, scanned.lyricFiles);
        results.push({
            audio: audioFile,
            lyric: matchedLyric
        });
    });

    return results;
};
