"use client";

import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { HiHome } from "react-icons/hi";
import { BiSearch, BiPulse } from "react-icons/bi";
import Box from "../common/Box";
import SidebarItem from "./SidebarItem";
import usePlayer from "@/hooks/player/usePlayer";
import { RiPlayListFill, RiPulseLine } from "react-icons/ri";
import { FaHeart } from "react-icons/fa6";
import { BiLibrary, BiWrench } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { GiMicrophone } from "react-icons/gi";
import useAuthModal from "@/hooks/auth/useAuthModal";
import useUploadModal from "@/hooks/modal/useUploadModal";
import usePlaylistModal from "@/hooks/modal/usePlaylistModal";
import useSpotLightUploadModal from "@/hooks/modal/useSpotLightUpload";
import usePulseUploadModal from "@/hooks/modal/usePulseUploadModal";
import { useUser } from "@/hooks/auth/useUser";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Link from "next/link";
import Hover from "../common/Hover";
import Image from "next/image";
import { GoSidebarCollapse } from "react-icons/go";
import UserCard from "./UserCard";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const pathname = usePathname();
  const player = usePlayer();
  const { user, userDetails } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const studioItems = [
    {
      icon: RiPlayListFill,
      label: "INIT_PLAYLIST",
      action: "playlist",
    },
    {
      icon: AiOutlinePlus,
      label: "INGEST_BINARY",
      action: "music",
    },
    {
      icon: GiMicrophone,
      label: "SPOTLIGHT_SYNC",
      action: "spotlight",
    },
    {
      icon: RiPulseLine,
      label: "PULSE_GEN",
      action: "pulse",
    },
  ];

  const routes = useMemo(
    () => [
      {
        icon: HiHome,
        label: "Home",
        active: pathname === "/",
        href: "/",
      },
      {
        icon: BiSearch,
        label: "Search",
        active: pathname === "/search",
        href: "/search",
      },
      {
        icon: BiPulse,
        label: "Pulse",
        active: pathname === "/pulse",
        href: "/pulse",
      },
    ],
    [pathname],
  );

  const isLibraryActive = useMemo(() => {
    return pathname === "/playlists" || pathname === "/liked";
  }, [pathname]);

  const isPulsePage = pathname === "/pulse";

  return (
    <div
      className={twMerge(
        `flex h-full`,
        // pulseページではプレイヤーが非表示なのでheight調整不要
        player.activeId && !isPulsePage && "h-[calc(100%-80px)]",
      )}
    >
      <div
        className={twMerge(
          "flex flex-col gap-y-3 bg-[#0a0a0f]/95 h-full p-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] backdrop-blur-3xl border-r border-theme-500/20 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative z-50",
          isCollapsed ? "w-[100px]" : "w-[240px]",
          "hidden md:flex font-mono shrink-0",
        )}
      >
        {/* スキャンライン / グリッド装飾 */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="flex items-center justify-between px-2 py-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative group cyber-glitch">
              <div className="absolute -inset-2 bg-theme-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <Image
                src="/logo.svg"
                alt="Logo"
                width={isCollapsed ? 160 : 48}
                height={isCollapsed ? 160 : 48}
                className="relative cursor-pointer transition-all duration-500 hover:scale-110 z-10 drop-shadow-[0_0_8px_rgba(var(--theme-500),0.6)]"
                onClick={() => isCollapsed && setIsCollapsed(!isCollapsed)}
              />
            </div>
            {!isCollapsed && (
              <h1 className="ml-2 font-bold text-2xl tracking-[0.2em] text-white uppercase drop-shadow-[0_0_10px_rgba(var(--theme-500),0.8)]">
                BadWave
              </h1>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-theme-500 hover:text-white hover:bg-theme-500/20 transition-all duration-300 border border-transparent hover:border-theme-500/30"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? "" : <GoSidebarCollapse size={24} />}
          </Button>
        </div>

        <Box className="flex-1 bg-[#0a0a0f]/40 border-theme-500/20 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)]">
          <div className="flex flex-col gap-y-3 px-2 py-3 uppercase text-xs tracking-widest">
            {routes.map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                isCollapsed={isCollapsed}
              />
            ))}
            {user && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <div
                      className={twMerge(
                        "cursor-pointer transition-all duration-500 cyber-glitch relative group/item",
                        isCollapsed
                          ? "w-full flex items-center justify-center border-b border-transparent"
                          : "flex h-auto w-full items-center gap-x-3 py-3 px-3 rounded-none",
                        isLibraryActive
                          ? isCollapsed
                            ? "border-theme-500/30 text-theme-300"
                            : "bg-[#0a0a0f] text-white border border-theme-500/50 shadow-[inset_0_0_15px_rgba(var(--theme-500),0.15)]"
                          : `border border-transparent ${
                              isCollapsed
                                ? "border-white/5"
                                : "text-theme-500/60 hover:text-white hover:bg-theme-500/5 hover:border-theme-500/30"
                            }`,
                      )}
                    >
                      {/* HUD装飾コーナー */}
                      <div
                        className={twMerge(
                          "absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors z-10",
                          isLibraryActive
                            ? "border-theme-500"
                            : "border-theme-500/0 group-hover/item:border-theme-500/40",
                        )}
                      />
                      <div
                        className={twMerge(
                          "absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors z-10",
                          isLibraryActive
                            ? "border-theme-500"
                            : "border-theme-500/0 group-hover/item:border-theme-500/40",
                        )}
                      />
                      {isCollapsed ? (
                        <Hover
                          description="[ LIBRARY ]"
                          contentSize="w-auto px-3 py-2"
                          side="right"
                        >
                          <div className="p-3 rounded-xl">
                            <BiLibrary
                              size={24}
                              className={twMerge(
                                "transition-all duration-300",
                                isLibraryActive
                                  ? "text-theme-400 drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]"
                                  : "text-theme-500/60 group-hover:text-theme-300",
                              )}
                            />
                          </div>
                        </Hover>
                      ) : (
                        <>
                          <BiLibrary
                            size={24}
                            className={twMerge(
                              isLibraryActive &&
                                "drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]",
                            )}
                          />
                          <p className="truncate text-sm font-bold tracking-[0.2em] font-mono">
                            [ LIBRARY ]
                          </p>
                        </>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    align="start"
                    className="w-56 p-2 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-theme-500/40 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-none"
                  >
                    <div className="flex flex-col gap-y-2 font-mono uppercase tracking-widest text-[10px]">
                      <Link
                        href="/playlists"
                        className={twMerge(
                          "flex items-center gap-x-3 px-3 py-3 rounded-none transition-all duration-300 border border-transparent hover:border-theme-500/30",
                          pathname === "/playlists"
                            ? "bg-theme-500/20 text-white border-theme-500/60 shadow-[0_0_10px_rgba(var(--theme-500),0.3)]"
                            : "text-theme-500/60 hover:text-white hover:bg-theme-500/10",
                        )}
                      >
                        <RiPlayListFill size={20} />
                        <p className="font-bold">// PLAYLISTS</p>
                      </Link>
                      <Link
                        href="/liked"
                        className={twMerge(
                          "flex items-center gap-x-3 px-3 py-3 rounded-none transition-all duration-300 border border-transparent hover:border-theme-500/30",
                          pathname === "/liked"
                            ? "bg-theme-500/20 text-white border-theme-500/60 shadow-[0_0_10px_rgba(var(--theme-500),0.3)]"
                            : "text-theme-500/60 hover:text-white hover:bg-theme-500/10",
                        )}
                      >
                        <FaHeart size={20} />
                        <p className="font-bold">// LIKED_LOG</p>
                      </Link>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <div
                      className={twMerge(
                        "cursor-pointer transition-all duration-500 cyber-glitch relative group/item",
                        isCollapsed
                          ? "w-full flex items-center justify-center border-b border-transparent"
                          : "flex h-auto w-full items-center gap-x-3 py-3 px-3 rounded-none",
                        "border border-transparent text-theme-500/60 hover:text-white hover:bg-theme-500/5 hover:border-theme-500/30",
                      )}
                    >
                      {/* HUD装飾コーナー */}
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-theme-500/0 group-hover/item:border-theme-500/40 transition-colors z-10" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-theme-500/0 group-hover/item:border-theme-500/40 transition-colors z-10" />
                      {isCollapsed ? (
                        <Hover
                          description="[ STUDIO ]"
                          contentSize="w-auto px-3 py-2"
                          side="right"
                        >
                          <div className="p-3 rounded-xl">
                            <BiWrench
                              size={24}
                              className="transition-all duration-300 text-theme-500/60 group-hover:text-theme-300"
                            />
                          </div>
                        </Hover>
                      ) : (
                        <>
                          <BiWrench
                            size={24}
                            className="text-theme-500/60 group-hover:text-theme-300 transition-all duration-300 drop-shadow-[0_0_8px_rgba(var(--theme-500),0)] group-hover:drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]"
                          />
                          <p className="truncate text-sm font-bold tracking-[0.2em] font-mono">
                            [ STUDIO ]
                          </p>
                        </>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    align="start"
                    className="w-56 p-2 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-theme-500/40 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-none"
                  >
                    <div className="flex flex-col gap-y-2 font-mono uppercase tracking-widest text-[10px]">
                      <div className="flex items-center gap-2 text-[10px] text-theme-500/40 uppercase tracking-[0.4em] mb-1 border-b border-theme-500/10 pb-2 px-2 pt-1">
                        <span>[ STUDIO_TOOLS ]</span>
                      </div>
                      {studioItems.map((item) => (
                        <button
                          key={item.action}
                          onClick={() => openModal(item.action as any)}
                          className="flex items-center gap-x-3 px-3 py-3 rounded-none transition-all duration-300 border border-transparent hover:border-theme-500/30 text-theme-500/60 hover:text-white hover:bg-theme-500/10 w-full text-left cyber-glitch"
                        >
                          <item.icon size={20} />
                          <p className="font-bold">// {item.label}</p>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>
        </Box>

        <div className="mt-auto pt-4 mb-6 relative z-10">
          <UserCard userDetails={userDetails} isCollapsed={isCollapsed} />
        </div>
      </div>
      <main className="h-full flex-1 overflow-y-auto bg-[#0a0a0f]">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
