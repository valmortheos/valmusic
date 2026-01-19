
import React, { useState, useEffect } from 'react';
import { 
    Music, Upload, Heart, Github, Instagram, ArrowRight, 
    CheckCircle, Shield, Zap, Cloud, Smartphone 
} from 'lucide-react';

const OnboardingModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Cek apakah user sudah pernah melihat onboarding
    const hasSeenOnboarding = localStorage.getItem('valmusic_intro_seen');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleFinish = () => {
    // 1. Trigger animasi keluar
    setIsExiting(true);
    
    // 2. Simpan state
    localStorage.setItem('valmusic_intro_seen', 'true');

    // 3. Hapus dari DOM setelah animasi selesai (700ms sesuai durasi CSS)
    setTimeout(() => {
        setIsVisible(false);
    }, 800);
  };

  const nextStep = () => {
    if (step < 2) setStep((prev) => prev + 1);
  };

  if (!isVisible) return null;

  return (
    <div 
        className={`fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${isExiting ? '-translate-y-full' : 'translate-y-0'}`}
        style={{ willChange: 'transform' }}
    >
        {/* Abstract Background Decoration */}
        <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] bg-purple-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

        {/* Skip Button */}
        <button 
            onClick={handleFinish}
            className="absolute top-6 right-6 z-50 text-gray-400 hover:text-gray-800 font-bold text-xs transition-colors px-4 py-2 rounded-full hover:bg-white/50"
        >
            LEWATI
        </button>

        {/* --- CAROUSEL TRACK --- */}
        <div className="flex-1 overflow-hidden relative w-full h-full">
            <div 
                className="flex h-full w-[300%] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ transform: `translateX(-${step * (100 / 3)}%)` }}
            >
                {/* --- SLIDE 1: WELCOME & PHILOSOPHY --- */}
                <div className="w-1/3 h-full flex flex-col p-8 pt-20 relative z-10 justify-center items-center">
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-sm mx-auto">
                        <div className="relative mb-4">
                            <div className="w-28 h-28 bg-gradient-to-tr from-[var(--color-primary)] to-indigo-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-200 transform rotate-3 ring-8 ring-white">
                                <Music size={56} className="text-white" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-white p-2.5 rounded-2xl shadow-lg transform -rotate-6">
                                <Zap size={24} className="text-yellow-500 fill-yellow-500" />
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
                                Val<span className="text-[var(--color-primary)]">Music</span>
                            </h2>
                            <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                Aplikasi pemutar musik modern dengan pengalaman <b className="text-gray-800">Native</b> yang estetik, privat, dan tanpa gangguan iklan.
                            </p>
                        </div>

                        {/* Feature Pills */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2">
                                <Shield size={24} className="text-emerald-500" />
                                <span className="text-xs font-bold text-gray-700">100% Privat</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2">
                                <Smartphone size={24} className="text-blue-500" />
                                <span className="text-xs font-bold text-gray-700">Mobile First</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SLIDE 2: FEATURES & GUIDE --- */}
                <div className="w-1/3 h-full flex flex-col p-8 pt-20 relative z-10 justify-center items-center">
                    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                        <div className="text-center mb-10">
                            <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-[2rem] mb-4 shadow-sm">
                                <Upload size={32} />
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Pustaka Hybrid</h3>
                            <p className="text-gray-500 text-sm">
                                Gabungan sempurna antara koleksi lokal Anda dan streaming online tanpa batas.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-start gap-4 transform hover:scale-[1.02] transition-transform">
                                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 mt-0.5">
                                    <Cloud size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Mode Offline Cerdas</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-snug">Upload MP3/FLAC atau scan folder. File diproses lokal di browser tanpa upload ke server.</p>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-start gap-4 transform hover:scale-[1.02] transition-transform">
                                <div className="bg-rose-100 p-2.5 rounded-xl text-rose-600 mt-0.5">
                                    <Music size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Lyrics Sync & Editor</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-snug">Dukungan lirik otomatis (.lrc) dan editor lirik bawaan yang canggih untuk karaoke.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SLIDE 3: CREDITS & DONATION --- */}
                <div className="w-1/3 h-full flex flex-col p-8 pt-20 relative z-10 justify-center items-center">
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-sm mx-auto w-full">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-yellow-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <img 
                                src="https://fastly.picsum.photos/id/203/4032/3024.jpg?hmac=yeLnHOEAWUYBtMnanR0-0Q7gSvYbyxPG3PLJYvm170Q" 
                                alt="Valmortheos" 
                                className="w-32 h-32 rounded-full border-4 border-white shadow-2xl relative z-10 object-cover"
                            />
                            <div className="absolute bottom-0 right-0 z-20 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-md tracking-wider">
                                CREATOR
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-extrabold text-gray-900">Valmortheos</h3>
                            <p className="text-sm font-medium text-[var(--color-primary)] mt-1">Fullstack Web Engineer</p>
                            <p className="text-xs text-gray-400 mt-3 max-w-[240px] mx-auto italic leading-relaxed">
                                "Menciptakan aplikasi web yang tidak hanya berfungsi, tapi juga indah dan berjiwa."
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3 justify-center w-full">
                            <a href="https://www.instagram.com/valmortheos" target="_blank" rel="noreferrer" className="flex-1 bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-1">
                                <Instagram size={20} />
                                <span className="text-[10px] font-bold">Instagram</span>
                            </a>
                            <a href="https://www.github.com/valmortheos" target="_blank" rel="noreferrer" className="flex-1 bg-gray-900 text-white p-3 rounded-2xl shadow-lg shadow-gray-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-1">
                                <Github size={20} />
                                <span className="text-[10px] font-bold">GitHub</span>
                            </a>
                        </div>

                        {/* Donation Card */}
                        <a href="https://saweria.co/vlmsc" target="_blank" rel="noreferrer" className="w-full bg-white border-2 border-yellow-400 p-4 rounded-2xl flex items-center justify-between hover:bg-yellow-50 transition-colors group cursor-pointer relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 opacity-10 rounded-bl-[4rem]"></div>
                            <div className="text-left relative z-10">
                                <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1">Dukung Pengembangan</p>
                                <p className="font-extrabold text-gray-800 text-lg group-hover:text-yellow-700 transition-colors">Saweria.co</p>
                            </div>
                            <div className="bg-yellow-400 text-white p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform relative z-10">
                                <Heart fill="currentColor" size={20} />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 pb-10 safe-area-bottom bg-white/80 backdrop-blur-xl border-t border-gray-100 flex items-center justify-between relative z-20">
            {/* Step Indicators */}
            <div className="flex gap-2.5">
                {[0, 1, 2].map(i => (
                    <button 
                        key={i} 
                        onClick={() => setStep(i)}
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${step === i ? 'w-8 bg-[var(--color-primary)] shadow-sm' : 'w-2 bg-gray-300 hover:bg-gray-400'}`} 
                    />
                ))}
            </div>

            <button 
                onClick={step === 2 ? handleFinish : nextStep}
                className={`
                    px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg active:scale-95
                    ${step === 2 
                        ? 'bg-gray-900 text-white hover:bg-black w-full justify-center ml-4' 
                        : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                    }
                `}
            >
                {step === 2 ? 'Mulai Sekarang' : 'Lanjut'}
                <ArrowRight size={18} className={step !== 2 ? "animate-pulse" : ""} />
            </button>
        </div>
    </div>
  );
};

export default OnboardingModal;
