


import React, { useState } from 'react';
import { Song } from '../types';
import { saveSongToDB } from '../utils/db';
import { readMetadata } from '../utils/metadataReader';
import { findBestLyricMatch } from '../utils/fileMatcher';
import { readFileAsText, parseLyrics } from '../utils/lyricsUtils';
import { scanDirectory, processScannedFiles } from '../utils/folderScanner';
import { useToast } from '../context/ToastContext';

export const useLibrary = (
    existingSongs: Song[], // Perlu akses ke daftar lagu yang ada untuk cek duplikasi
    setSongs: React.Dispatch<React.SetStateAction<Song[]>>, 
    playSong: (s: Song) => void, 
    currentSong: Song | null
) => {
  
  const { addToast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  const getFileFormat = (file: File): string => {
    const name = file.name.toUpperCase();
    if (name.endsWith('.FLAC')) return 'FLAC';
    if (name.endsWith('.OPUS')) return 'OPUS';
    if (name.endsWith('.OGG')) return 'OGG';
    if (name.endsWith('.M4A')) return 'M4A';
    if (name.endsWith('.WAV')) return 'WAV';
    return 'MP3';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Logic inti pemrosesan lagu (Shared antara Upload Biasa & Folder Scan)
  const processBatchFiles = async (
    filePairs: { audio: File, lyric: File | undefined }[]
  ) => {
    const newSongs: Song[] = [];
    const songsWithLyrics: string[] = [];

    for (const pair of filePairs) {
        const file = pair.audio;
        
        // CEK DUPLIKASI TAHAP 1: Nama File
        const isFileExists = existingSongs.some(s => 
          s.file && s.file.name === file.name && s.file.size === file.size
        );
        if (isFileExists) continue;

        const url = URL.createObjectURL(file);
        let title = file.name.replace(/\.[^/.]+$/, "");
        let artist = "Unknown Artist";
        let album = "Local Upload";
        
        if (title.includes('-')) {
            const parts = title.split('-');
            artist = parts[0].trim();
            title = parts.slice(1).join('-').trim();
        }

        // Baca Metadata
        const metadata = await readMetadata(file);
        const finalTitle = metadata.title || title;
        const finalArtist = metadata.artist || artist;

        // CEK DUPLIKASI TAHAP 2: Metadata
        const isSongExists = existingSongs.some(s => 
            s.title.toLowerCase() === finalTitle.toLowerCase() && 
            s.artist.toLowerCase() === finalArtist.toLowerCase()
        );
        const isInBatch = newSongs.some(s => 
            s.title.toLowerCase() === finalTitle.toLowerCase() && 
            s.artist.toLowerCase() === finalArtist.toLowerCase()
        );

        if (isSongExists || isInBatch) continue;

        // Proses Lirik
        let parsedLyrics = undefined;
        if (pair.lyric) {
            try {
                const textContent = await readFileAsText(pair.lyric);
                parsedLyrics = parseLyrics(textContent);
                if (parsedLyrics.length > 0) {
                    songsWithLyrics.push(finalTitle);
                }
            } catch (err) {
                console.error(`Gagal membaca lirik: ${pair.lyric.name}`);
            }
        }

        const songData: Song = {
            id: Math.random().toString(36).substr(2, 9),
            title: finalTitle,
            artist: finalArtist,
            album: metadata.album || album,
            year: metadata.year,
            genre: metadata.genre,
            duration: 0, // Akan di-update saat dimainkan atau via background worker (kompleks)
            url,
            file,
            coverArt: metadata.coverArt, 
            format: getFileFormat(file),
            fileSize: formatFileSize(file.size),
            lyrics: parsedLyrics
        };

        await saveSongToDB(songData);
        newSongs.push(songData);
    }

    if (newSongs.length > 0) {
        setSongs((prev) => [...prev, ...newSongs]);
        addToast('Impor Berhasil', `${newSongs.length} lagu berhasil ditambahkan ke pustaka.`, 'success');
        
        if (!currentSong) playSong(newSongs[0]);
    } else {
        addToast('Info', 'Tidak ada lagu baru yang ditambahkan (mungkin duplikat).', 'info');
    }

    if (songsWithLyrics.length > 0) {
        addToast('Lirik Terhubung', `${songsWithLyrics.length} lirik berhasil dipadukan otomatis.`, 'success');
    }
  };

  // Handler Input File Biasa
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    const audioFiles = fileList.filter(f => f.type.startsWith('audio/') || f.name.match(/\.(flac|opus|ogg|m4a)$/i));
    const lyricFiles = fileList.filter(f => f.name.match(/\.(lrc|txt)$/i));

    if (audioFiles.length === 0) return;

    // Mapping manual untuk input file biasa
    const pairs = audioFiles.map(audio => ({
        audio,
        lyric: findBestLyricMatch(audio, lyricFiles)
    }));

    await processBatchFiles(pairs);
    event.target.value = '';
  };

  // Handler Scan Folder (Fitur Baru)
  const handleFolderScan = async () => {
      setIsScanning(true);
      const scanned = await scanDirectory();
      
      if (scanned && scanned.audioFiles.length > 0) {
          const pairs = processScannedFiles(scanned);
          await processBatchFiles(pairs);
      } else if (scanned && scanned.audioFiles.length === 0) {
          addToast('Folder Kosong', 'Tidak ditemukan file audio di folder tersebut.', 'error');
      }
      
      setIsScanning(false);
  };

  return { handleFileUpload, handleFolderScan, isScanning };
};