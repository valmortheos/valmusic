
import React from 'react';

interface DynamicWaveformProps {
  isPlaying: boolean;
  color?: string;
  count?: number;
}

const DynamicWaveform: React.FC<DynamicWaveformProps> = ({ isPlaying, color = '#6366f1', count = 20 }) => {
  // Generate random heights for initial look
  const bars = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-[2px] h-8 w-full max-w-[200px] mx-auto opacity-80">
      {bars.map((i) => (
        <div
          key={i}
          className="w-1 bg-current rounded-full transition-all duration-300"
          style={{
            backgroundColor: color,
            height: '20%',
            animation: isPlaying ? `wave 1s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.05}s` // Staggered animation
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          0%, 100% { height: 20%; opacity: 0.5; }
          50% { height: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DynamicWaveform;
