
import React, { useState } from 'react';

interface LogoEffectProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // Hex color for the glow
}

const LogoEffect: React.FC<LogoEffectProps> = ({ children, className = "", glowColor = "#6366f1" }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerEffect = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Reset state after animation finishes
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <div 
      className={`relative inline-block cursor-pointer group ${className}`} 
      onClick={triggerEffect}
      style={{
        '--glow-color': glowColor
      } as React.CSSProperties}
    >
      {/* Base Content */}
      <div className={`relative z-10 transition-all duration-300 ${isAnimating ? 'scale-105 text-[var(--glow-color)]' : ''}`}>
        {children}
      </div>

      {/* Scan Line Effect */}
      <div 
        className={`absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-lg`}
      >
        <div 
          className={`absolute top-0 bottom-0 w-10 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] blur-[2px] transition-none`}
          style={{
            left: '-150%',
            animation: isAnimating ? 'scan-pass 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
          }}
        />
      </div>

      {/* Bloom/Glow Burst Background */}
      <div 
        className={`absolute inset-0 z-0 bg-[var(--glow-color)] rounded-xl blur-xl transition-opacity duration-500`}
        style={{
            opacity: isAnimating ? 0.6 : 0,
            transform: isAnimating ? 'scale(1.2)' : 'scale(0.8)'
        }}
      />
      
      <style>{`
        @keyframes scan-pass {
          0% { left: -50%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 150%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LogoEffect;
