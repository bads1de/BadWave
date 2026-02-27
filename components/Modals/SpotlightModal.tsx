import React, { useEffect, useRef, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import { X } from "lucide-react";
import useSpotlightModal from "@/hooks/modal/useSpotlightModal";
import useVolumeStore from "@/hooks/stores/useVolumeStore";

const SpotlightModal = () => {
  const { isOpen, onClose } = useSpotlightModal();
  const selectedItem = useSpotlightModal((state) => state.selectedItem);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const { volume } = useVolumeStore();
  const [isLoading, setIsLoading] = React.useState(true);

  // Sync background video with main video
  const setupVideoSync = useCallback(() => {
    const mainVideo = videoRef.current;
    const bgVideo = bgVideoRef.current;

    if (!mainVideo || !bgVideo) return () => {};

    const syncPlay = () => bgVideo.play().catch(() => {});
    const syncPause = () => bgVideo.pause();
    const syncTime = () => {
      if (Math.abs(bgVideo.currentTime - mainVideo.currentTime) > 0.2) {
        bgVideo.currentTime = mainVideo.currentTime;
      }
    };

    mainVideo.addEventListener("play", syncPlay);
    mainVideo.addEventListener("pause", syncPause);
    mainVideo.addEventListener("timeupdate", syncTime);
    mainVideo.addEventListener("seeking", syncTime);

    return () => {
      mainVideo.removeEventListener("play", syncPlay);
      mainVideo.removeEventListener("pause", syncPause);
      mainVideo.removeEventListener("timeupdate", syncTime);
      mainVideo.removeEventListener("seeking", syncTime);
    };
  }, []);

  // Handle video playback and sync when modal opens/closes or video changes
  useEffect(() => {
    if (!isOpen) {
      videoRef.current?.pause();
      bgVideoRef.current?.pause();
      return;
    }

    // Reset loading state when video changes
    setIsLoading(true);

    const mainVideo = videoRef.current;
    if (!mainVideo) return;

    // Apply volume and start playback
    mainVideo.volume = (volume ?? 1) * 0.5;
    mainVideo.play().catch((error) => {
      console.error("Video playback failed:", error);
    });

    // Setup sync
    const cleanup = setupVideoSync();

    return cleanup;
  }, [isOpen, selectedItem?.id, volume, setupVideoSync]);

  if (!selectedItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-[#0a0a0f]/90 z-50 backdrop-blur-xl transition-all duration-500 font-mono">
        <div className="fixed inset-0 overflow-y-auto">
          {/* 背景装飾 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ 
                 backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.5) 1px, transparent 1px)`,
                 backgroundSize: '100px 100px'
               }} 
          />
          
          <div className="flex min-h-full items-center justify-center p-4 md:p-10 pb-24 md:pb-32">
            <div className="relative w-full max-w-6xl mx-auto flex flex-col md:flex-row bg-[#0a0a0f] h-[85vh] md:h-[80vh] rounded-none overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_20px_rgba(var(--theme-500),0.1)] border border-theme-500/30 cyber-glitch">
              {/* HUDコーナー */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-theme-500/40 pointer-events-none z-50" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-theme-500/40 pointer-events-none z-50" />

              {/* Close Button (HUD Style) */}
              <button
                onClick={onClose}
                className="absolute right-6 top-6 z-[60] p-3 bg-theme-500/10 hover:bg-theme-500 text-theme-500 hover:text-[#0a0a0f] border border-theme-500/40 transition-all duration-300 shadow-[0_0_15px_rgba(var(--theme-500),0.3)]"
              >
                <X className="h-5 w-5 font-black" />
              </button>

              {/* Video Section */}
              <div className="w-full md:w-[60%] lg:w-[65%] bg-[#050508] relative overflow-hidden flex items-center justify-center shrink-0 border-r border-theme-500/10">
                {selectedItem.video_path && (
                  <>
                    {/* Synchronized Background Blur Layer */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                      <video
                        ref={bgVideoRef}
                        src={selectedItem.video_path}
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover blur-3xl scale-110 saturate-200"
                      />
                    </div>

                    {/* スキャンライン */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 z-20 bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />

                    {/* Main Video Layer */}
                    <video
                      ref={videoRef}
                      key={selectedItem.video_path}
                      src={selectedItem.video_path}
                      loop
                      playsInline
                      muted={false}
                      controls={false}
                      onClick={(e) => {
                        const v = e.currentTarget;
                        v.paused ? v.play() : v.pause();
                      }}
                      onLoadedData={() => setIsLoading(false)}
                      className={`relative max-w-full max-h-full w-full h-full object-contain shadow-[0_0_40px_rgba(0,0,0,0.5)] z-10 cursor-pointer transition-opacity duration-1000 ${
                        isLoading ? "opacity-0" : "opacity-80 hover:opacity-100"
                      }`}
                    />

                    {/* Top Info Overlay */}
                    <div className="absolute top-6 left-6 z-30 flex flex-col gap-1">
                       <div className="flex items-center gap-2 text-[8px] text-theme-500 tracking-[0.5em] uppercase animate-pulse">
                          <span className="w-1.5 h-1.5 bg-theme-500 rounded-full" />
                          [ SIGNAL_MONITOR_ACTIVE ]
                       </div>
                       <div className="text-[10px] text-theme-500/40 uppercase font-black">
                          RESOLUTION: 1920x1080 // STREAM_STABILITY: 99%
                       </div>
                    </div>

                    {/* Loading Scanner */}
                    {isLoading && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0f]/60 backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-500/20 to-transparent h-full w-full animate-scanline-skeleton" />
                        <p className="relative z-30 text-theme-500 font-black tracking-[0.5em] animate-pulse">INITIATING_SYNC...</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Content Section (Terminal Style) */}
              <div className="w-full md:flex-1 bg-[#0a0a0f] border-t md:border-t-0 flex flex-col h-full relative z-20">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                  {/* Header */}
                  <div className="space-y-6 pb-8 border-b border-theme-500/10">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 border border-theme-500/40 bg-theme-500/5 flex items-center justify-center shrink-0 shadow-[inset_0_0_15px_rgba(var(--theme-500),0.1)] group/avatar relative">
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-theme-500" />
                        <span className="font-black text-theme-500 text-2xl drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]">
                          {selectedItem.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-theme-500/60 uppercase tracking-[0.4em] mb-1">
                           [ OPERATOR_IDENTIFIED ]
                        </p>
                        <h3 className="font-black text-white text-2xl tracking-widest hover:text-theme-300 transition-colors cursor-pointer uppercase">
                          {selectedItem.author}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="inline-block px-4 py-1.5 border border-theme-500/30 bg-theme-500/5 text-theme-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)]">
                       SECTOR: {selectedItem.genre}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-[8px] text-theme-500/40 uppercase tracking-widest font-bold">
                          // DATA_STREAM_METADATA
                       </p>
                       <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(var(--theme-500),0.5)]">
                         {selectedItem.title}
                       </h2>
                    </div>
                    
                    <div className="relative p-6 bg-theme-500/5 border border-theme-500/10 group/desc">
                       <div className="absolute top-0 left-0 w-2 h-px bg-theme-500" />
                       <div className="absolute top-0 left-0 w-px h-2 bg-theme-500" />
                       <p className="text-theme-300/80 text-xs leading-relaxed whitespace-pre-wrap tracking-wide">
                         {selectedItem.description || "NO_DESCRIPTION_DATA_AVAILABLE_IN_THIS_NODE."}
                       </p>
                    </div>
                  </div>
                </div>
                
                {/* Footer Metadata */}
                <div className="p-6 border-t border-theme-500/10 flex justify-between items-center text-[7px] text-theme-500/20 uppercase tracking-[0.3em] font-bold">
                   <span>node_id: {String(selectedItem.id).slice(0, 12)}...</span>
                   <span className="animate-pulse">encryption: authorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SpotlightModal;
