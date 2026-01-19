
import React from 'react';
import { X, Disc, Music, Calendar, FileAudio, BarChart2, Volume2 } from './Icons';
import { Song } from '../types';

interface SongInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

const SongInfoModal: React.FC<SongInfoModalProps> = ({ isOpen, onClose, song }) => {
  if (!isOpen || !song) return null;

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-xl transition-colors">
      <div className="flex items-center gap-4 text-gray-500">
        <div className="p-2 bg-gray-100 rounded-full text-gray-400">
            {icon}
        </div>
        <span className="text-sm font-semibold text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900 text-right max-w-[50%] truncate">{value || '-'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 animate-fade-in flex flex-col max-h-[85vh] border border-white/20">
        {/* Header with Cover Blur */}
        <div className="relative h-40 flex items-end p-6 overflow-hidden">
           {/* Background Image Blurred */}
           <div className="absolute inset-0">
             {song.coverArt ? (
                <img src={song.coverArt} className="w-full h-full object-cover blur-2xl scale-110 opacity-60" />
             ) : (
                <div className="w-full h-full bg-[var(--color-primary)] opacity-40" />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
           </div>

           <div className="absolute top-4 right-4 z-20">
             <button onClick={onClose} className="p-2 bg-white/40 hover:bg-white/60 text-gray-800 rounded-full backdrop-blur-md transition-colors shadow-sm">
               <X size={20} />
             </button>
           </div>
           
           <div className="relative z-10 flex items-center gap-4 w-full">
               <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                    {song.coverArt ? (
                        <img src={song.coverArt} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Music size={24} /></div>
                    )}
               </div>
               <div className="flex-1 min-w-0">
                   <h2 className="text-xl font-bold text-gray-900 truncate">{song.title}</h2>
                   <p className="text-gray-600 text-sm truncate">{song.artist}</p>
               </div>
           </div>
        </div>

        <div className="p-6 overflow-y-auto bg-white">
          <InfoRow icon={<Disc size={18} />} label="Album" value={song.album} />
          <InfoRow icon={<Calendar size={18} />} label="Tahun Rilis" value={song.year || 'Unknown'} />
          <InfoRow icon={<Music size={18} />} label="Genre" value={song.genre || 'Unknown'} />
          
          <div className="mt-6 mb-3 px-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 inline-block px-3 py-1 rounded-full">Detail Audio</h4>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-2 border border-gray-100">
            <InfoRow icon={<FileAudio size={18} />} label="Format" value={song.format || 'MP3'} />
            <InfoRow icon={<Volume2 size={18} />} label="Sample Rate" value={song.sampleRate || 'Unknown'} />
            <InfoRow icon={<BarChart2 size={18} />} label="Bitrate" value={song.bitrate || 'Auto'} /> 
            <InfoRow icon={<BarChart2 size={18} />} label="Ukuran" value={song.fileSize || 'Unknown'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongInfoModal;
