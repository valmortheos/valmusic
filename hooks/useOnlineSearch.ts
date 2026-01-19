
import { useState, useCallback } from 'react';
import { Song } from '../types';
import { searchOnlineMusic } from '../services/musicApi';

export const useOnlineSearch = () => {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setLastQuery(query);
    setSearchResults([]); 

    try {
      // Default country 'us' seperti request CURL, bisa diubah ke 'id', 'sg', dll.
      const songs = await searchOnlineMusic(query); 
      if (songs.length === 0) {
        setSearchError('Tidak ditemukan lagu dengan kata kunci tersebut.');
      }
      setSearchResults(songs);
    } catch (err) {
      setSearchError('Terjadi kesalahan koneksi saat mencari lagu.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    lastQuery,
    handleSearch,
    setSearchResults 
  };
};
