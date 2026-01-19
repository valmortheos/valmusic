
import React from 'react';

interface AnimatedBackgroundProps {
  palette?: string[]; // Array of 3 colors
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ palette }) => {
  // Gunakan palette langsung
  const colors = palette && palette.length >= 3 
    ? palette 
    : ['#e0e7ff', '#c7d2fe', '#a5b4fc']; // Fallback warna terang

  return (
    <div className="absolute inset-0 overflow-hidden z-0 bg-[#f8fafc]">
      {/* Background dasar PUTIH/Terang (Light Mode) */}
      
      {/* Fluid Blobs Container - Opasitas Tinggi (70%) */}
      {/* Ditambahkan animate-spin-slow pada container agar seluruh komposisi berputar pelan */}
      <div className="absolute inset-0 z-0 opacity-70 animate-spin-slow origin-center"> 
        
        {/* Blob 1 */}
        <div 
            className="absolute top-0 left-[-10%] w-[90vw] h-[90vw] rounded-full mix-blend-multiply filter blur-[80px] animate-blob transition-colors duration-[2s]"
            style={{ backgroundColor: colors[0] }}
        ></div>
        
        {/* Blob 2 */}
        <div 
            className="absolute bottom-0 right-[-10%] w-[90vw] h-[90vw] rounded-full mix-blend-multiply filter blur-[90px] animate-blob animation-delay-2000 transition-colors duration-[2s]"
            style={{ backgroundColor: colors[1] }}
        ></div>
        
        {/* Blob 3 */}
        <div 
            className="absolute top-[30%] left-[20%] w-[80vw] h-[80vw] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 transition-colors duration-[2s]"
            style={{ backgroundColor: colors[2] }}
        ></div>
      </div>

      {/* Overlay Putih Transparan - Tetap tipis agar blob terlihat jelas */}
      <div className="absolute inset-0 z-1 bg-white/40 backdrop-blur-[50px]"></div>
      
      <style>{`
        /* Animasi Berputar Pelan untuk Container Utama */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }

        /* Animasi Blob yang 'Wandering' (Jalan-jalan) */
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(15%, 15%) scale(1.1); }
          50% { transform: translate(-10%, 20%) scale(0.9); }
          75% { transform: translate(10%, -15%) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        .animate-blob {
          /* Durasi dipercepat jadi 10s agar gerakan lebih terasa */
          animation: blob 10s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animation-delay-2000 {
          animation-delay: -3s;
        }
        .animation-delay-4000 {
          animation-delay: -7s;
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
