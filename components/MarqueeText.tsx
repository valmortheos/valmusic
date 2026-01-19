
import React, { useEffect, useRef, useState } from 'react';

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number; // detik per putaran
  delay?: number; // detik sebelum mulai
}

const MarqueeText: React.FC<MarqueeTextProps> = ({ 
  text, 
  className = "", 
  speed = 15, 
  delay = 2
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const calculateOverflow = () => {
      if (containerRef.current && textRef.current) {
        // Reset dulu untuk mendapatkan lebar asli teks tanpa duplikasi
        const containerWidth = containerRef.current.clientWidth;
        
        // Buat elemen temporary untuk mengukur lebar teks asli
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.className = className;
        tempSpan.innerText = text;
        document.body.appendChild(tempSpan);
        
        const textWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);

        setContentWidth(textWidth);
        setIsOverflowing(textWidth > containerWidth);
      }
    };

    calculateOverflow();
    window.addEventListener('resize', calculateOverflow);
    return () => window.removeEventListener('resize', calculateOverflow);
  }, [text, className]);

  if (!isOverflowing) {
    return (
      <div className={`truncate ${className}`}>
        {text}
      </div>
    );
  }

  // Durasi animasi dinamis berdasarkan panjang teks
  const dynamicSpeed = Math.max(speed, contentWidth / 30); 

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden whitespace-nowrap mask-gradient w-full ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        display: 'flex'
      }}
    >
      <div 
        className="inline-flex flex-nowrap"
        style={{
           animation: `marquee-infinite ${dynamicSpeed}s linear infinite`,
           animationDelay: `${delay}s`,
           paddingLeft: '0' 
        }}
      >
        <span>{text}</span>
        {/* Spacer yang cukup lebar */}
        <span className="inline-block w-16"></span> 
        <span>{text}</span>
        <span className="inline-block w-16"></span>
      </div>

      <style>{`
        @keyframes marquee-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 2rem)); } /* 2rem adalah setengah dari total spacer (w-16 = 4rem) */
        }
      `}</style>
    </div>
  );
};

export default MarqueeText;
