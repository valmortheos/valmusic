
import React from 'react';

const ValMusicBadge: React.FC = () => {
  return (
    <div className="relative group inline-block mb-1 overflow-hidden rounded-full">
      {/* Container Border Animasi - Disesuaikan agar pergerakan tidak terlalu jauh */}
      <div className="absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-shine-line blur-[1px]"></div>
      
      {/* Background Utama Badge */}
      <div className="relative px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center z-10">
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white drop-shadow-sm">
          ValMusic
        </span>
      </div>

      <style>{`
        @keyframes shine-line {
            0% { left: -60%; opacity: 0; }
            40% { opacity: 1; }
            60% { opacity: 1; }
            100% { left: 110%; opacity: 0; }
        }
        .animate-shine-line {
          animation: shine-line 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          left: -60%;
        }
      `}</style>
    </div>
  );
};

export default ValMusicBadge;
