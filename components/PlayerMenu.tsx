
import React from 'react';
import { Trash2, Info, X, FileAudio, Music, Timer } from './Icons';
import { Song } from '../types';

interface PlayerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onDelete: (id: string) => void;
  onOpenTimer: () => void;
  onOpenInfo: () => void;
  timerActive: boolean;
}

const PlayerMenu: React.FC<PlayerMenuProps> = ({ 
  isOpen, onClose, song, onDelete, onOpenTimer, onOpenInfo, timerActive 
}) => {
  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm m-4 rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transform transition-transform duration-300 animate-fade-in pointer-events-auto border border-white/40">
        
        {/* Header Lagu */}
        <div className="flex flex-col items-center mb-8">
           <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shadow-xl mb-4 border-4 border-white">
             {song.coverArt ? (
               <img src={song.coverArt} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)]"><Music size={32} /></div>
             )}
           </div>
           <h4 className="font-bold text-gray-900 text-xl text-center line-clamp-2 leading-tight px-4">{song.title}</h4>
           <p className="text-sm font-medium text-gray-500 mt-1">{song.artist}</p>
        </div>

        {/* Actions List */}
        <div className="space-y-3">
           <button 
             onClick={() => { onOpenTimer(); onClose(); }}
             className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group active:scale-98"
           >
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Timer size={20} />
               </div>
               <span className="font-bold text-gray-700 group-hover:text-indigo-700">Sleep Timer</span>
             </div>
             {timerActive && (
               <span className="text-[10px] bg-indigo-500 text-white px-2 py-1 rounded-full font-bold shadow-md shadow-indigo-200">ON</span>
             )}
           </button>

           <button 
             onClick={() => { onOpenInfo(); onClose(); }}
             className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group active:scale-98"
           >
             <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Info size={20} />
             </div>
             <span className="font-bold text-gray-700 group-hover:text-blue-700">Lihat Info Lagu</span>
           </button>

          <button 
            onClick={() => {
                if(confirm('Hapus lagu ini dari database browser?')) {
                    onDelete(song.id);
                    onClose();
                }
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all group active:scale-98"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trash2 size={20} />
            </div>
            <span className="font-bold text-gray-700 group-hover:text-red-600">Hapus Lagu</span>
          </button>
        </div>
        
        <button onClick={onClose} className="w-full mt-6 py-4 text-center font-bold text-gray-400 hover:text-gray-600 text-sm tracking-wide">
            BATAL
        </button>
      </div>
    </div>
  );
};

export default PlayerMenu;
