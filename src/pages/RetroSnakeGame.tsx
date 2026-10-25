import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

export const RetroSnakeGame: React.FC = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const startFullscreenGame = async () => {
    setStarted(true);
    if (containerRef.current) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request rejected:", err);
      }
    }
  };

  const handleBack = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        // ignore
      }
    }
    navigate('/library');
  };

  const handleIframeLoad = () => {
    if (iframeRef.current) {
      try {
        // Focus the iframe automatically to ensure immediate keyboard response
        iframeRef.current.focus();
      } catch (err) {
        console.warn("Could not focus iframe:", err);
      }
    }
  };

  // Forward parent window keyboard events directly to the iframe
  useEffect(() => {
    if (!started) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (iframeRef.current) {
        try {
          const iframeWindow = iframeRef.current.contentWindow as any;
          if (iframeWindow) {
            iframeWindow.dispatchEvent(new iframeWindow.KeyboardEvent('keydown', {
              key: e.key,
              code: e.code,
              bubbles: true,
              cancelable: true
            }));
          }
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started]);

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen z-50 bg-[#060e20] flex flex-col justify-center items-center overflow-hidden">
      {!started ? (
        <div className="text-center space-y-6 z-10">
          <h1 className="text-display-lg text-4xl text-white font-extrabold tracking-widest uppercase">RETRO SNAKE GAME</h1>
          <p className="text-sm text-emerald-400 font-semibold">Classic Retro Arcade Edition</p>
          <div className="flex justify-center gap-4">
            <Button variant="neon" onClick={startFullscreenGame} className="px-8 py-4 text-sm font-bold tracking-widest cursor-pointer">
              PLAY IN FULLSCREEN
            </Button>
            <Button variant="ghost" onClick={handleBack} className="px-8 py-4 text-sm font-bold tracking-widest cursor-pointer">
              BACK TO LIBRARY
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {/* Exit Float Button */}
          <button 
            onClick={handleBack}
            className="absolute top-4 left-4 z-50 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-full border border-white/10 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" /> EXIT GAME
          </button>
          
          <iframe 
            ref={iframeRef}
            src="/games/retro-snake/index.html" 
            onLoad={handleIframeLoad}
            className="w-full h-full border-0 bg-transparent"
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
            allow="autoplay; gamepad; fullscreen; keyboard"
            title="Retro Snake"
          />
        </div>
      )}
    </div>
  );
};
