
import React, { useRef, useState, useEffect } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek, color = 'white' }) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showThumb, setShowThumb] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const hideTimeoutRef = useRef<number | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);

  // Fungsi untuk reset timer auto-hide
  const resetHideTimer = () => {
    setShowThumb(true);
    if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
    }
    // Sembunyikan setelah 2.5 detik inactivity
    hideTimeoutRef.current = window.setTimeout(() => {
        if (!isDragging) {
            setShowThumb(false);
        }
    }, 2500);
  };

  const getClientX = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): number | null => {
    if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
        return e.changedTouches[0].clientX;
    }
    if ('touches' in e && e.touches && e.touches.length > 0) {
        return e.touches[0].clientX;
    }
    if ('clientX' in e) {
        return (e as MouseEvent).clientX;
    }
    return null;
  };

  const handleSeek = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!progressBarRef.current || duration === 0) return;
    
    const clientX = getClientX(e);
    if (clientX === null) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    
    const newTime = percentage * duration;
    
    if (isDragging) {
        setLocalProgress(percentage * 100);
    } else {
        onSeek(newTime);
    }
    return newTime;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    resetHideTimer();
    handleSeek(e);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging) {
      resetHideTimer();
      handleSeek(e);
    }
  };

  const handleMouseUp = (e: MouseEvent | TouchEvent) => {
    if (isDragging) {
      const newTime = handleSeek(e);
      if (newTime !== undefined) onSeek(newTime);
      setIsDragging(false);
      resetHideTimer(); // Trigger timer again so it doesn't vanish instantly
    }
  };

  // Bersihkan timeout saat unmount
  useEffect(() => {
    return () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className="group relative w-full h-10 flex items-center cursor-pointer select-none touch-none py-4"
      ref={progressBarRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseEnter={resetHideTimer}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
         // Saat mouse keluar area, set timeout pendek jika tidak sedang dragging
         if(!isDragging) {
             if(hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
             hideTimeoutRef.current = window.setTimeout(() => setShowThumb(false), 500);
         }
      }}
    >
      {/* Track Background */}
      <div 
        className={`absolute inset-0 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm transition-all duration-300 ease-out ${showThumb || isDragging ? 'h-2' : 'h-1'} my-auto`}
      >
        {/* Fill */}
        <div 
          className="h-full rounded-full transition-all duration-100 ease-out relative"
          style={{ 
            width: `${isDragging ? localProgress : progress}%`, 
            backgroundColor: color 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>

      {/* Thumb (Knob) */}
      <div 
        className={`absolute w-5 h-5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] border-2 border-white/50 transform -translate-x-1/2 transition-all duration-300 ease-out z-10 flex items-center justify-center ${showThumb || isDragging ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        style={{ 
          left: `${isDragging ? localProgress : progress}%`,
        }}
      >
        <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full opacity-80" />
      </div>
    </div>
  );
};

export default ProgressBar;
