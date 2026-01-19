
import React, { useState } from 'react';
import { ViewState, UserProfile } from '../types';
import { Search, Upload } from './Icons';

interface HeaderProps {
    userProfile: UserProfile;
    setView: (v: ViewState) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header = ({ 
    userProfile, setView, handleFileUpload
}: HeaderProps) => {
    return (
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#f8fafc]/95 backdrop-blur-xl z-30 py-3 transition-all duration-300 px-2">
            {/* --- BRANDING / LOGO --- */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0" onClick={() => setView(ViewState.HOME)}>
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-indigo-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200 cursor-pointer">V</div>
                <span className="font-bold text-lg md:text-xl text-slate-800 tracking-tight cursor-pointer">ValMusic</span>
            </div>
            
            {/* --- ACTIONS --- */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                {/* Search Action (Redesigned: Rounded Square + Text) */}
                <button 
                    onClick={() => setView(ViewState.SEARCH)}
                    className="flex items-center justify-center gap-2 bg-white text-gray-500 px-3 py-2.5 rounded-2xl border border-gray-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all shadow-sm active:scale-95 min-w-[110px]"
                    aria-label="Cari Lagu"
                >
                    <Search size={18} />
                    <span className="text-xs font-bold">Cari Lagu</span>
                </button>

                {/* Small Upload Icon (Secondary) */}
                 <label className="cursor-pointer p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                    <Upload size={18} />
                    {/* UPDATE ACCEPT ATTRIBUTE */}
                    <input type="file" multiple accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.opus,.lrc,.txt" className="hidden" onChange={handleFileUpload} />
                </label>
                
                <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden md:block"></div>
                
                <button onClick={() => setView(ViewState.SETTINGS)} className="flex items-center rounded-full transition-all active:scale-95 ml-1">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-100 hover:ring-[var(--color-primary)] transition-all">
                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </button>
            </div>
        </div>
    );
};
