import React, { useEffect, useRef, useState, memo } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioControllerProps {
  url: string;
  isPlaying: boolean;
  onFinish: () => void;
  onReady: (duration: number) => void;
  setWaveSurferRef: (ws: WaveSurfer | null) => void;
}

// Komponen ini tidak me-render UI, hanya mengontrol logika Audio Engine
const AudioController: React.FC<AudioControllerProps> = memo(({ 
  url, 
  isPlaying, 
  onFinish, 
  onReady,
  setWaveSurferRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isMounted = useRef(true);

  // 1. Inisialisasi Audio Engine
  useEffect(() => {
    if (!containerRef.current) return;
    isMounted.current = true;

    if (wsRef.current) {
      wsRef.current.destroy();
      wsRef.current = null;
    }

    setIsReady(false);

    // Kita tetap butuh WaveSurfer untuk decoding format FLAC/OPUS yang stabil,
    // tapi kita set height 0 agar tidak terlihat.
    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: 0, 
      waveColor: 'transparent',
      progressColor: 'transparent',
      cursorColor: 'transparent',
      interact: false, // User tidak bisa klik area invisible ini
      normalize: true,
    });

    wsRef.current = ws;
    setWaveSurferRef(ws);

    ws.on('ready', () => {
      if (isMounted.current) {
        setIsReady(true);
        onReady(ws.getDuration());
        if (isPlaying) {
            ws.play().catch(e => console.debug("Autoplay blocked/aborted", e));
        }
      }
    });

    ws.on('finish', onFinish);

    ws.on('error', (e) => {
       if(!e.message?.includes('aborted')) console.warn("Audio Error", e);
    });

    try {
      ws.load(url);
    } catch (e) {
      console.error("Failed to load audio url");
    }

    return () => {
      isMounted.current = false;
      if (wsRef.current) {
        try { wsRef.current.destroy(); } catch(e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // 2. Handle Play/Pause
  useEffect(() => {
    if (!wsRef.current || !isReady) return;
    try {
      if (isPlaying) {
        wsRef.current.play().catch(() => {});
      } else {
        wsRef.current.pause();
      }
    } catch (e) {
        console.debug("Playback toggle error", e);
    }
  }, [isPlaying, isReady]);

  return (
    // Hidden container for audio engine
    <div ref={containerRef} className="hidden" />
  );
}, (prev, next) => {
    return prev.url === next.url && 
           prev.isPlaying === next.isPlaying;
});

export default AudioController;