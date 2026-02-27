import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/common/Button";

interface PreviewDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  audioUrl?: string;
  videoUrl?: string;
  handleDownloadClick: (type: "audio" | "video") => void;
}

const PreviewDownloadModal: React.FC<PreviewDownloadModalProps> = ({
  isOpen,
  onClose,
  title,
  audioUrl,
  videoUrl,
  handleDownloadClick,
}) => {
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-[700px] bg-[#0a0a0f] text-white font-mono p-10 border border-theme-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(var(--theme-500),0.1)] rounded-none cyber-glitch"
        onClick={handleContentClick}
      >
        {/* HUDコーナー */}
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-theme-500/40" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-theme-500/40" />

        <DialogHeader className="border-l-4 border-theme-500 pl-6 mb-8">
          <p className="text-[10px] text-theme-500/60 uppercase tracking-[0.4em] mb-1">
            [ ASSET_BINARY_EXTRACTION ]
          </p>
          <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(var(--theme-500),0.8)]">
            {title || "UNKNOWN_NODE"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-4">
          {/* Video Preview (HUD Style) */}
          {videoUrl && (
            <div className="space-y-6 group">
              <div className="relative aspect-video w-full rounded-none overflow-hidden border border-theme-500/20 group-hover:border-theme-500/60 transition-all shadow-[0_0_15px_rgba(var(--theme-500),0.1)]">
                <video
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                  controls
                  src={videoUrl}
                  preload="metadata"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-theme-500/20 text-[8px] text-theme-300 uppercase tracking-widest border border-theme-500/40">
                   VIDEO_STREAM
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-theme-500/10 border border-theme-500/40 hover:bg-theme-500 text-theme-300 hover:text-[#0a0a0f] font-black tracking-[0.2em]"
                onClick={() => handleDownloadClick("video")}
              >
                // EXTRACT_MP4
              </Button>
            </div>
          )}

          {/* Audio Preview (HUD Style) */}
          {audioUrl && (
            <div className="space-y-6 group">
              <div className="w-full bg-[#0a0a0f] rounded-none p-8 border border-theme-500/20 group-hover:border-theme-500/60 transition-all shadow-[inset_0_0_20px_rgba(var(--theme-500),0.05)] relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
                <audio
                  className="w-full relative z-10 opacity-80 hover:opacity-100"
                  controls
                  src={audioUrl}
                  preload="metadata"
                />
                <div className="mt-4 flex justify-between items-center text-[8px] text-theme-500/40 uppercase tracking-widest">
                   <span>AUDIO_WAVE_ANALYSIS</span>
                   <span className="animate-pulse">SIGNAL_DETECTED</span>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-theme-500/10 border border-theme-500/40 hover:bg-theme-500 text-theme-300 hover:text-[#0a0a0f] font-black tracking-[0.2em]"
                onClick={() => handleDownloadClick("audio")}
              >
                // EXTRACT_MP3
              </Button>
            </div>
          )}
        </div>
        
        {/* 装飾用HUDライン */}
        <div className="mt-6 pt-4 border-t border-theme-500/10 text-[8px] text-theme-500/20 text-right uppercase">
           integrity_verification: pass // secure_extraction_link: active
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDownloadModal;
