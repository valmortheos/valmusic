
import React, { useState } from 'react';
import { Clock, X, Timer } from './Icons';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetTimer: (minutes: number) => void;
  onCancelTimer: () => void;
  timeLeft: number | null;
}

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ 
  isOpen, onClose, onSetTimer, onCancelTimer, timeLeft 
}) => {
  const [inputValue, setInputValue] = useState('30');
  const [unit, setUnit] = useState<'minutes' | 'hours'>('minutes');

  if (!isOpen) return null;

  const handleManualSubmit = () => {
    const val = parseInt(inputValue);
    if (!isNaN(val) && val > 0) {
      const minutes = unit === 'hours' ? val * 60 : val;
      onSetTimer(minutes);
      onClose();
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'j ' : ''}${m}m ${s}d`;
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative z-10 animate-fade-in border border-white/50">
        <div className="flex justify-between items-center mb-6 pl-2">
          <div className="flex items-center gap-3 text-[var(--color-primary)]">
             <div className="p-2 bg-[var(--color-primary)]/10 rounded-full">
                <Timer size={24} />
             </div>
             <h3 className="font-bold text-xl text-gray-800">Sleep Timer</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {timeLeft !== null && (
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-indigo-400 text-white p-5 rounded-2xl mb-6 shadow-lg shadow-indigo-200 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Akan berhenti dalam</p>
              <p className="text-2xl font-bold tracking-tight">{formatTimeLeft(timeLeft)}</p>
            </div>
            <button 
              onClick={onCancelTimer}
              className="relative z-10 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold transition-all border border-white/20"
            >
              Matikan
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider ml-1">Pintasan Cepat</label>
            <div className="grid grid-cols-4 gap-3">
              {[15, 30, 45, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => { onSetTimer(min); onClose(); }}
                  className="py-3 rounded-2xl bg-gray-50 hover:bg-[var(--color-primary)] hover:text-white hover:shadow-lg hover:shadow-[var(--color-primary)]/30 hover:-translate-y-1 transition-all font-bold text-sm border border-gray-100 text-gray-600"
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider ml-1">Atur Manual</label>
            {/* Menggunakan GRID untuk layout input/select agar tidak overflow */}
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="number" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all text-center"
              />
              <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all"
              >
                <option value="minutes">Menit</option>
                <option value="hours">Jam</option>
              </select>
            </div>
            <button 
              onClick={handleManualSubmit}
              className="w-full mt-4 bg-[var(--color-primary)] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[var(--color-primary)]/30 hover:scale-[1.02] transition-transform active:scale-95"
            >
              Mulai Hitung Mundur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepTimerModal;
