"use client";

import { AiOutlineBars, AiOutlinePlus } from "react-icons/ai";
import { RiPlayListFill, RiPulseLine } from "react-icons/ri";
import { GiMicrophone } from "react-icons/gi";
import useAuthModal from "@/hooks/auth/useAuthModal";
import { useUser } from "@/hooks/auth/useUser";
import useUploadModal from "@/hooks/modal/useUploadModal";
import usePlaylistModal from "@/hooks/modal/usePlaylistModal";
import useSpotLightUploadModal from "@/hooks/modal/useSpotLightUpload";
import usePulseUploadModal from "@/hooks/modal/usePulseUploadModal";
import Hover from "../common/Hover";

interface StudioProps {
  isCollapsed: boolean;
}

const Studio: React.FC<StudioProps> = ({ isCollapsed }) => {
  const { user } = useUser();
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const playlistModal = usePlaylistModal();
  const spotlightUploadModal = useSpotLightUploadModal();
  const pulseUploadModal = usePulseUploadModal();

  const openModal = (value: "music" | "playlist" | "spotlight" | "pulse") => {
    if (!user) {
      return authModal.onOpen();
    }

    switch (value) {
      case "music":
        return uploadModal.onOpen();
      case "playlist":
        return playlistModal.onOpen();
      case "spotlight":
        return spotlightUploadModal.onOpen();
      case "pulse":
        return pulseUploadModal.onOpen();
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-4 px-2 pt-6 font-mono">
        <Hover
          contentSize="w-auto px-3 py-2"
          side="right"
          description="[ CREATE_PLAYLIST ]"
        >
          <button 
            onClick={() => openModal("playlist")}
            className="w-full aspect-square bg-[#0a0a0f] border border-theme-500/30 hover:border-theme-500 hover:shadow-[0_0_15px_rgba(var(--theme-500),0.4)] transition-all duration-500 flex items-center justify-center group relative overflow-hidden cyber-glitch"
          >
            <div className="absolute inset-0 bg-theme-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <AiOutlineBars
              className="text-theme-500/60 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 drop-shadow-[0_0_5px_rgba(var(--theme-500),0.5)]"
              size={24}
            />
          </button>
        </Hover>

        <Hover
          contentSize="w-auto px-3 py-2"
          side="right"
          description="[ INGEST_TRACK ]"
        >
          <button 
            onClick={() => openModal("music")}
            className="w-full aspect-square bg-[#0a0a0f] border border-theme-500/30 hover:border-theme-500 hover:shadow-[0_0_15px_rgba(var(--theme-500),0.4)] transition-all duration-500 flex items-center justify-center group relative overflow-hidden cyber-glitch"
          >
            <div className="absolute inset-0 bg-theme-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <AiOutlinePlus
              className="text-theme-500/60 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 drop-shadow-[0_0_5px_rgba(var(--theme-500),0.5)]"
              size={24}
            />
          </button>
        </Hover>

        <Hover
          contentSize="w-auto px-3 py-2"
          side="right"
          description="[ SYNC_SPOTLIGHT ]"
        >
          <button 
            onClick={() => openModal("spotlight")}
            className="w-full aspect-square bg-[#0a0a0f] border border-theme-500/30 hover:border-theme-500 hover:shadow-[0_0_15px_rgba(var(--theme-500),0.4)] transition-all duration-500 flex items-center justify-center group relative overflow-hidden cyber-glitch"
          >
            <div className="absolute inset-0 bg-theme-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <GiMicrophone
              className="text-theme-500/60 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 drop-shadow-[0_0_5px_rgba(var(--theme-500),0.5)]"
              size={24}
            />
          </button>
        </Hover>

        <Hover
          contentSize="w-auto px-3 py-2"
          side="right"
          description="[ INITIALIZE_PULSE ]"
        >
          <button
            onClick={() => openModal("pulse")}
            className="w-full aspect-square bg-[#0a0a0f] border border-theme-500/30 hover:border-theme-500 hover:shadow-[0_0_15px_rgba(var(--theme-500),0.4)] transition-all duration-500 flex items-center justify-center group relative overflow-hidden cyber-glitch"
          >
            <div className="absolute inset-0 bg-theme-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <RiPulseLine
              className="text-theme-500/60 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 drop-shadow-[0_0_5px_rgba(var(--theme-500),0.5)]"
              size={24}
            />
          </button>
        </Hover>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-12 font-mono">
      <div className="flex items-center gap-2 text-[10px] text-theme-500/40 uppercase tracking-[0.4em] mb-2 border-b border-theme-500/10 pb-2">
         <span>[ STUDIO_TOOLS_v2.0 ]</span>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {[
          { icon: RiPlayListFill, label: "INIT_PLAYLIST", desc: "ASSEMBLE_COLLECTION", action: "playlist" },
          { icon: AiOutlinePlus, label: "INGEST_BINARY", desc: "TRANSMIT_NEW_TRACK", action: "music" },
          { icon: GiMicrophone, label: "SPOTLIGHT_SYNC", desc: "PRIORITY_HIGHLIGHT", action: "spotlight" },
          { icon: RiPulseLine, label: "PULSE_GEN", desc: "SIGNAL_BROADCAST", action: "pulse" },
        ].map((item) => (
          <button
            key={item.action}
            onClick={() => openModal(item.action as any)}
            className="group w-full p-4 bg-[#0a0a0f] border border-theme-500/20 hover:border-theme-500/60 transition-all duration-500 relative overflow-hidden shadow-[inset_0_0_15px_rgba(var(--theme-500),0.05)] hover:shadow-[0_0_20px_rgba(var(--theme-500),0.15)] cyber-glitch"
          >
            <div className="absolute inset-0 bg-theme-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* 角の装飾 */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-theme-500/40 group-hover:border-theme-500 transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-theme-500/40 group-hover:border-theme-500 transition-colors" />

            <div className="relative flex items-center gap-4">
              <div className="p-2.5 bg-theme-500/10 border border-theme-500/20 group-hover:bg-theme-500/30 group-hover:border-theme-500/60 transition-all duration-500">
                <item.icon
                  className="text-theme-500 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 drop-shadow-[0_0_5px_rgba(var(--theme-500),0.5)]"
                  size={20}
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-theme-300 uppercase tracking-widest group-hover:text-white transition-colors">
                  // {item.label}
                </span>
                <span className="text-[8px] text-theme-500/60 uppercase tracking-tight mt-0.5">
                  {item.desc}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Studio;
