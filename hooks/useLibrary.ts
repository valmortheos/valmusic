
import React, { useState } from 'react';
import { Song } from '../types';
import { saveSongToDB } from '../utils/db';
import { readMetadata } from '../utils/metadataReader';
import { findBestLyricMatch } from '../utils/fileMatcher';
import { readFileAsText, parseLyrics } from '../utils/lyricsUtils';
import { useToast } from '../context/ToastContext';

export const useLibrary = (
    existingSongs: Song[], // Perlu akses ke daftar lagu yang ada untuk cek duplikasi
    setSongs: React.Dispatch<React.SetStateAction<Song[]>>, 
    playSong: (s: Song) => void, 
    currentSong: Song | null
) => {
  
  const { addToast } = useToast();

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    
    // 1. Pisahkan file Audio dan file Lirik
    const audioFiles = fileList.filter(f => f.type.startsWith('audio/') || f.name.match(/\.(flac|opus|ogg|m4a)$/i));
    const lyricFiles = fileList.filter(f => f.name.match(/\.(lrc|txt)$/i));

    // Jika tidak ada file audio, return silent (tanpa toast error)
    if (audioFiles.length === 0) return;

    const newSongs: Song[] = [];
    const songsWithLyrics: string[] = []; // Melacak lagu yang berhasil dapat lirik untuk notifikasi spesifik

    // 2. Proses setiap file Audio
    for (const file of audioFiles) {
      
      // CEK DUPLIKASI TAHAP 1: Berdasarkan Nama File
      const isFileExists = existingSongs.some(s => 
          s.file && s.file.name === file.name && s.file.size === file.size
      );

      if (isFileExists) {
          console.log(`[ValMusic] Duplikat File Skip: ${file.name}`);
          continue; 
      }

      const url = URL.createObjectURL(file);
      let title = file.name.replace(/\.[^/.]+$/, "");
      let artist = "Unknown Artist";
      let album = "Local Upload";
      
      // Basic filename parsing fallback
      if (title.includes('-')) {
        const parts = title.split('-');
        artist = parts[0].trim();
        title = parts.slice(1).join('-').trim();
      }

      // 3. Baca Metadata (ID3 Tags)
      const metadata = await readMetadata(file);
      
      const finalTitle = metadata.title || title;
      const finalArtist = metadata.artist || artist;

      // CEK DUPLIKASI TAHAP 2: Berdasarkan Metadata (Title & Artist)
      const isSongExists = existingSongs.some(s => 
          s.title.toLowerCase() === finalTitle.toLowerCase() && 
          s.artist.toLowerCase() === finalArtist.toLowerCase()
      );

      // Kita cek juga di array newSongs (batch upload saat ini) agar tidak double insert
      const isInBatch = newSongs.some(s => 
        s.title.toLowerCase() === finalTitle.toLowerCase() && 
        s.artist.toLowerCase() === finalArtist.toLowerCase()
      );

      if (isSongExists || isInBatch) {
          console.log(`[ValMusic] Duplikat Metadata Skip: ${finalTitle}`);
          continue;
      }

      // 4. Cari pasangan Lirik yang cocok (Smart Matching)
      let parsedLyrics = undefined;
      const matchedLyricFile = findBestLyricMatch(file, lyricFiles);

      if (matchedLyricFile) {
          try {
              const textContent = await readFileAsText(matchedLyricFile);
              parsedLyrics = parseLyrics(textContent);
              if (parsedLyrics.length > 0) {
                  // Catat judul lagu yang dapat lirik untuk Toast
                  songsWithLyrics.push(finalTitle);
              }
              console.log(`[ValMusic] Lirik ditemukan untuk ${file.name}: ${matchedLyricFile.name}`);
          } catch (err) {
              console.error(`Gagal membaca file lirik: ${matchedLyricFile.name}`, err);
          }
      }
      
      const songData: Song = {
        id: Math.random().toString(36).substr(2, 9),
        title: finalTitle,
        artist: finalArtist,
        album: metadata.album || album,
        year: metadata.year,
        genre: metadata.genre,
        duration: 0,
        url,
        file,
        coverArt: metadata.coverArt, 
        format: getFileFormat(file),
        fileSize: formatFileSize(file.size),
        lyrics: parsedLyrics // Masukkan lirik yang sudah di-match
      };

      await saveSongToDB(songData);
      newSongs.push(songData);
    }
    
    // UPDATE STATE
    if (newSongs.length > 0) {
        setSongs((prev) => [...prev, ...newSongs]);
        if (!currentSong) playSong(newSongs[0]);
    }

    // TOAST LOGIC: HANYA MUNCUL JIKA ADA LIRIK YANG TERHUBUNG
    if (songsWithLyrics.length > 0) {
        if (songsWithLyrics.length === 1) {
            addToast('Lirik Terhubung', `Berhasil memuat lirik untuk: ${songsWithLyrics[0]}`, 'success', 4000);
        } else {
            addToast('Lirik Terhubung', `${songsWithLyrics.length} lirik berhasil dipadukan dengan lagu.`, 'success', 4000);
        }
    }
    
    // Reset input value
    event.target.value = '';
  };

  return { handleFileUpload };
};
