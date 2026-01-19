
import React, { useState, useMemo } from 'react';
import { Lock, Unlock, CheckCircle, X } from '../Icons';
import { Song } from '../../types';
import { FileSystemNode } from './storage/FileSystemNode';

interface StorageInspectorProps {
    songs: Song[];
}

const StorageInspector: React.FC<StorageInspectorProps> = ({ songs }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const CORRECT_PIN = "2477";

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === CORRECT_PIN) {
            setIsUnlocked(true);
            setError(false);
        } else {
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 2000); // Reset error visual
        }
    };

    // Transform songs array into a Virtual File System Structure
    const fileSystem = useMemo(() => {
        // Struktur Dasar
        const root: any = {
            "System": {
                "Config": { 
                    "metadata.json": { title: "App Config", fileSize: "2KB", isLeaf: true },
                    "user_prefs.db": { title: "User Prefs", fileSize: "4KB", isLeaf: true }
                } as any,
                "Logs": {}
            },
            "Assets": {
                "Music": {} // Preloaded Local Files
            },
            "Database": {
                "IndexedDB": {} // User Uploaded Files
            },
            "Cloud": {
                "Cache": {} // Streaming (Highlighted if Active)
            }
        };

        // Populate Data
        songs.forEach(song => {
            if (song.isOnline) {
                // Cloud Songs -> Masuk ke Cache
                // Logika: Jika duration > 0, berarti AudioController sudah pernah meload metadata audio-nya (buffering start/done)
                const isActive = song.duration > 0;
                
                root["Cloud"]["Cache"][song.id] = {
                    ...song,
                    isActiveCache: isActive
                };
            } else if (song.id.startsWith('preloaded-')) {
                // Asset Songs -> Masuk ke Assets/Music
                root["Assets"]["Music"][song.id] = song;
            } else {
                // Local DB Songs -> Masuk ke Database
                root["Database"]["IndexedDB"][song.id] = song;
            }
        });

        return root;
    }, [songs]); // Re-calculate jika songs berubah (misal duration update setelah play)

    if (!isUnlocked) {
        return (
            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
                <div className={`p-4 rounded-full transition-all duration-500 ${error ? 'bg-red-100 text-red-500 shake' : 'bg-gray-200 text-gray-500'}`}>
                    <Lock size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Storage Terkunci</h3>
                    <p className="text-xs text-gray-400">Masukkan PIN untuk mengakses data internal.</p>
                </div>
                
                <form onSubmit={handleUnlock} className="flex flex-col gap-3 w-full max-w-[200px]">
                    <input 
                        type="password" 
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} // Hanya angka
                        placeholder="PIN"
                        className={`text-center tracking-[0.5em] font-bold text-lg p-3 rounded-xl border focus:outline-none transition-all ${error ? 'border-red-300 bg-red-50 text-red-600 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}`}
                    />
                    <button 
                        type="submit" 
                        className="bg-gray-800 text-white font-bold py-2 rounded-xl text-sm hover:bg-black transition-colors"
                    >
                        Buka Akses
                    </button>
                </form>
                <style>{`
                    .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
                    @keyframes shake {
                        10%, 90% { transform: translate3d(-1px, 0, 0); }
                        20%, 80% { transform: translate3d(2px, 0, 0); }
                        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                        40%, 60% { transform: translate3d(4px, 0, 0); }
                    }
                `}</style>
            </div>
        );
    }

    // Tampilan Terbuka
    return (
        <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden flex flex-col shadow-sm animate-fade-in">
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600">
                    <Unlock size={18} />
                    <span className="font-bold text-sm">Storage Inspector</span>
                </div>
                <button 
                    onClick={() => { setIsUnlocked(false); setPin(''); }}
                    className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Content: Tree View */}
            <div className="p-4 overflow-x-auto">
                <div className="min-w-[300px] pb-4">
                    <FileSystemNode name="Root" data={fileSystem} />
                </div>
            </div>

            {/* Footer Stats */}
            <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-gray-500">
                <span>Total Object: {songs.length}</span>
                <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-500"/> System Ready</span>
            </div>
        </div>
    );
};

export default StorageInspector;
