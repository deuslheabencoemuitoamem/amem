import React, { useState, useRef, useEffect } from "react";
import { Play, X, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import CheckoutView from "./components/CheckoutView";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function App() {
  const [isFinished, setIsFinished] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const triggeredMilestones = useRef<Set<number>>(new Set());
  
  // High-fidelity Vimeo embed URL with muted autoplay, 1080p quality, and native inline playing
  const videoSrc = "https://player.vimeo.com/video/1212812391?autoplay=1&muted=1&quality=1080p&autopause=0&playsinline=1&api=1";
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Automatically trigger dataLayer watch event as requested
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 
      event: "clique_assistir" 
    });

    const triggerMilestone = (num: number) => {
      if (!triggeredMilestones.current.has(num)) {
        triggeredMilestones.current.add(num);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 
          event: `video_view_${num}` 
        });
      }
    };

    // Clean retention tracking logic checking currentTime (seconds) vs duration of the video.
    const handleValueTracking = (seconds: number, duration: number) => {
      if (typeof seconds !== "number" || typeof duration !== "number" || duration <= 0) {
        return;
      }

      // Calculate percentage precisely (0 - 100)
      const percentVal = (seconds / duration) * 100;

      // Check each required milestone exactly
      const milestones = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      for (const m of milestones) {
        if (percentVal >= m) {
          triggerMilestone(m);
        }
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.origin === "string" && event.origin.includes("vimeo")) {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (data) {
            if (data.event === "ready") {
              if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                  JSON.stringify({ method: "addEventListener", value: "finish" }),
                  "*"
                );
                iframeRef.current.contentWindow.postMessage(
                  JSON.stringify({ method: "addEventListener", value: "timeupdate" }),
                  "*"
                );
              }
            }
            if (data.event === "timeupdate") {
              const seconds = data.data?.seconds ?? data.data?.currentTime;
              const duration = data.data?.duration;
              
              if (typeof seconds === "number" && typeof duration === "number") {
                handleValueTracking(seconds, duration);
              } else if (typeof data.data?.percent === "number") {
                // Fallback using percent if seconds/duration isn't present
                handleValueTracking(data.data.percent, 1);
              }
            }
            if (data.event === "finish") {
              setIsFinished(true);
              triggerMilestone(100);
            }
          }
        } catch (err) {
          // ignore parsing issues
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Send standard play postMessage triggers to guarantee immediate playback
    const playTimeout = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: "play" }), "*");
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ method: "addEventListener", value: "finish" }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ method: "addEventListener", value: "timeupdate" }),
          "*"
        );
      }
    }, 500);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(playTimeout);
    };
  }, []);

  const handleEnableSound = () => {
    setIsMuted(false);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: "setMuted", value: 0 }), "*");
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: "setVolume", value: 1 }), "*");
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: "play" }), "*");
    }
  };

  const handleSimClick = () => {
    setIsFinished(false);
    setShowCheckout(true);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 
      event: "abriu_checkout" 
    });
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
  };

  if (showCheckout) {
    return <CheckoutView onBack={handleBackFromCheckout} />;
  }

  return (
    <div className="relative min-h-screen bg-black text-white font-sans flex flex-col justify-between overflow-hidden select-none">
      
      {/* Background Calm and Inspiring Sunset Image with Multi-layered vignettes */}
      <div className="absolute inset-0 z-0">
        <img
          src="/sunset_hero.png"
          alt="Sunset Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center select-none opacity-40 transition-opacity duration-1000"
        />
        {/* Soft, glowing radial focus over the golden sunset shades */}
        <div className="absolute inset-0 bg-radial-[circle_at_75%_30%] from-orange-500/10 via-black/55 to-black/95 pointer-events-none mix-blend-screen" />
        
        {/* Sun Glow elements matching Immersive UI specifications */}
        <div className="absolute top-[15%] right-[20%] w-64 h-64 rounded-full blur-3xl bg-orange-500/25 opacity-60 pointer-events-none" />
        
        {/* Bottom deep ambient vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      </div>

      {/* Desktop Top Toolbar Info Bar (hidden on mobile to preserve cinematic fullscreen space) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-5xl mx-auto py-3 relative z-10">
        <span className="text-xs font-mono tracking-widest text-neutral-400">
          PROPRIEDADE DE VERIFICAÇÃO DE MUDANÇA DE VIDA
        </span>
        <div className="w-10" />
      </div>

      {/* Centered Theater Stage */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-0 md:px-8 py-0 md:py-4 max-w-5xl mx-auto w-full">
        {/* Responsive player layout */}
        <div className="relative w-full max-w-md md:max-w-none md:w-full overflow-hidden bg-black shadow-3xl rounded-none md:rounded-3xl md:border md:border-white/10 flex items-center justify-center aspect-[9/16] md:aspect-video">
          
          <iframe
            ref={iframeRef}
            src={videoSrc}
            className="absolute inset-0 w-full h-full border-0 select-none pointer-events-auto"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            loading="eager"
            title="Vimeo Video Player"
          />

          {/* Prominent "Ativar Som" button at top of video player */}
          {isMuted ? (
            <button
              onClick={handleEnableSound}
              id="btn-ativar-som"
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold px-6 py-3 rounded-full shadow-2xl animate-bounce cursor-pointer transition-all active:scale-95 border border-white/40 text-sm sm:text-base uppercase tracking-wider"
            >
              <Volume2 className="w-5 h-5 fill-current animate-pulse" />
              <span>Ativar Som</span>
            </button>
          ) : (
            <div className="absolute top-3 left-3 z-30 pointer-events-none select-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/85 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
                <Volume2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] font-mono tracking-widest text-white/95 font-bold uppercase leading-none">
                  SOM ATIVADO
                </span>
              </div>
            </div>
          )}

          {/* Elegant indicator showing that the player is streaming in high-fidelity 1080p HD */}
          <div className="absolute top-3 right-3 z-30 pointer-events-none select-none transition-all duration-300">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/85 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-white/95 font-bold uppercase leading-none">
                1080p FULL HD
              </span>
            </div>
          </div>

          {/* Overlaid prompt visible immediately when the video finishes */}
          {isFinished && (
            <div 
              id="overlay-continuar-assistindo"
              className="absolute inset-0 bg-neutral-950/95 backdrop-blur-xl flex flex-col justify-center items-center p-6 text-center z-40 transition-all duration-500 ease-out"
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-white max-w-lg mb-8 font-medium leading-relaxed drop-shadow-lg select-text">
                Deseja continuar assistindo? Se sim, clique no botão abaixo escrito "Sim"👇
              </h3>
              <button
                onClick={handleSimClick}
                id="btn-continuar-sim"
                className="flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-black px-12 py-[15px] rounded-2xl font-bold font-sans text-md md:text-lg transform hover:scale-105 active:scale-97 cursor-pointer transition-all shadow-2xl"
              >
                Sim
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Sleek secure disclaimer footer */}
      <footer className="relative z-10 w-full px-6 py-6 text-center text-xs text-neutral-500 font-mono flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-orange-400" />
        <span className="tracking-widest">AMBIENTE 100% SEGURO & PRIVADO</span>
      </footer>

    </div>
  );
}
