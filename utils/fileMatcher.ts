
/**
 * Utility untuk mencocokkan file Audio dengan file Lirik.
 * Menggunakan pendekatan Token Set & Dice Coefficient untuk menangani
 * perbedaan format penamaan (misal: "Artist - Title" vs "Title").
 */

// Membersihkan nama file: lowercase, hapus ekstensi, hapus karakter spesial
const normalizeName = (filename: string): string => {
    return filename
        .replace(/\.[^/.]+$/, "") // Hapus ekstensi
        .toLowerCase()
        .replace(/[\-\_\(\)\[\]\{\}\.\,]/g, ' ') // Ganti simbol dengan spasi
        .replace(/\s+/g, ' ') // Satukan spasi berlebih
        .trim();
};

const getTokens = (str: string): Set<string> => {
    // Split berdasarkan spasi, filter kata yang terlalu pendek (kecuali angka/huruf tunggal penting)
    return new Set(str.split(' ').filter(t => t.length > 0));
};

export const findBestLyricMatch = (audioFile: File, lyricFiles: File[]): File | undefined => {
    if (!lyricFiles || lyricFiles.length === 0) return undefined;

    const audioNameClean = normalizeName(audioFile.name);
    const audioTokens = getTokens(audioNameClean);
    
    let bestMatch: File | undefined = undefined;
    let highestScore = 0;

    for (const lrcFile of lyricFiles) {
        const lrcNameClean = normalizeName(lrcFile.name);
        
        // 1. EXACT MATCH (Langsung return)
        if (audioNameClean === lrcNameClean) {
            return lrcFile;
        }

        const lrcTokens = getTokens(lrcNameClean);
        
        // 2. TOKEN CONTAINMENT (Penting untuk kasus "Judul" vs "Artis - Judul")
        // Cek apakah SEMUA token penting dari nama yang lebih pendek ada di nama yang lebih panjang
        const shortTokens = audioTokens.size < lrcTokens.size ? audioTokens : lrcTokens;
        const longTokens = audioTokens.size < lrcTokens.size ? lrcTokens : audioTokens;
        
        let foundAll = true;
        for (const token of shortTokens) {
            if (!longTokens.has(token)) {
                foundAll = false;
                break;
            }
        }

        // Jika satu nama adalah subset penuh dari nama lain (misal: "Hello" ada di dalam "Adele Hello")
        // Berikan skor tinggi (0.9)
        if (foundAll && shortTokens.size > 0) {
            if (0.9 > highestScore) {
                highestScore = 0.9;
                bestMatch = lrcFile;
            }
            continue;
        }

        // 3. DICE COEFFICIENT (Untuk kesamaan umum jika urutan acak)
        // Rumus: (2 * intersection) / (total tokens A + total tokens B)
        let intersection = 0;
        audioTokens.forEach(token => {
            if (lrcTokens.has(token)) intersection++;
        });

        const totalTokens = audioTokens.size + lrcTokens.size;
        const diceScore = totalTokens > 0 ? (2 * intersection) / totalTokens : 0;

        if (diceScore > highestScore) {
            highestScore = diceScore;
            bestMatch = lrcFile;
        }
    }

    // Threshold 0.4: Cukup longgar untuk menangkap 'Song' vs 'Artist Song',
    // tapi cukup ketat untuk menghindari match ngawur.
    return highestScore >= 0.4 ? bestMatch : undefined;
};
