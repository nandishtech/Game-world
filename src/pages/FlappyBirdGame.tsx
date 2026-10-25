import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const FlappyBirdGame: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        const doc = iframeRef.current.contentDocument;
        const iframeWindow = iframeRef.current.contentWindow as any;
        if (doc && iframeWindow) {
          // Reset margin and overflow properties on body
          if (doc.body) {
            doc.body.style.overflow = 'hidden';
            doc.body.style.margin = '0';
          }

          // Request fullscreen on click of PLAY button
          const playBtn = doc.querySelector('#start-screen button');
          if (playBtn) {
            playBtn.addEventListener('click', () => {
              if (containerRef.current && !document.fullscreenElement) {
                containerRef.current.requestFullscreen().catch(err => {
                  console.warn("Fullscreen request rejected:", err);
                });
              }
            });
          }

          // Request fullscreen on click of REPLAY button
          const replayBtn = doc.querySelector('#gameover-screen button');
          if (replayBtn) {
            replayBtn.addEventListener('click', () => {
              if (containerRef.current && !document.fullscreenElement) {
                containerRef.current.requestFullscreen().catch(err => {
                  console.warn("Fullscreen request rejected:", err);
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn("Could not bind iframe events:", err);
      }
    }
  };

  // Listen to message events from iframe (e.g. exit game)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Security: Validate message origin to prevent cross-origin injection
      if (e.origin && e.origin !== window.location.origin) return;
      if (e.data === 'EXIT_GAME') {
        handleBack();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Forward parent window keyboard events directly to the iframe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (iframeRef.current) {
        try {
          const iframeWindow = iframeRef.current.contentWindow as any;
          if (iframeWindow && typeof iframeWindow.onkeydown === 'function') {
            iframeWindow.onkeydown(new iframeWindow.KeyboardEvent('keydown', {
              key: e.key,
              code: e.code
            }));
          }
        } catch (err) {
          // ignore
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (iframeRef.current) {
        try {
          const iframeWindow = iframeRef.current.contentWindow as any;
          if (iframeWindow && typeof iframeWindow.onkeyup === 'function') {
            iframeWindow.onkeyup(new iframeWindow.KeyboardEvent('keyup', {
              key: e.key,
              code: e.code
            }));
          }
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen z-50 bg-[#7fd4dd] flex flex-col justify-center items-center overflow-hidden">
      <iframe 
        ref={iframeRef}
        src="/games/flappy-bird/index.html" 
        onLoad={handleIframeLoad}
        className="w-full h-full border-0 bg-transparent"
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
        allow="autoplay; gamepad; fullscreen; keyboard"
        title="Flappy Bird"
      />
    </div>
  );
};
