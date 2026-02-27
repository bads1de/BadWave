"use client";

import React, { useState, useEffect, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Heart,
  Share2,
  Download,
  Edit2,
  Clock,
  Music2,
  Pause,
  ClipboardCopy,
} from "lucide-react";
import { MdLyrics } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import useGetSongById from "@/hooks/data/useGetSongById";
import { useUser } from "@/hooks/auth/useUser";
import useGetSongsByGenres from "@/hooks/data/useGetSongGenres";
import EditModal from "@/components/Modals/EditModal";
import { downloadFile } from "@/libs/utils";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import AudioWaveform from "@/components/AudioWaveform";
import useAudioWaveStore from "@/hooks/audio/useAudioWave";
import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";
import ScrollingText from "@/components/common/ScrollingText";

interface SongContentProps {
  songId: string;
}

const SongContent: React.FC<SongContentProps> = memo(({ songId }) => {
  const { song } = useGetSongById(songId);
  const { user } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"lyrics" | "similar">("lyrics");
  const [duration, setDuration] = useState<string>("");
  const [audioWaveformKey, setAudioWaveformKey] = useState(0);

  const genres = useMemo(
    () => song?.genre?.split(",").map((g) => g.trim()) || [],
    [song?.genre]
  );

  const { songGenres } = useGetSongsByGenres(genres, songId);

  const { isPlaying, play, pause, currentSongId, initializeAudio } =
    useAudioWaveStore();

  // カラースキームから波形の色を取得
  const { getColorScheme, hasHydrated } = useColorSchemeStore();
  const colorScheme = getColorScheme();
  // SSRハイドレーション対策: ハイドレーション前はデフォルト色を使用
  const primaryColor = hasHydrated ? colorScheme.colors.accentFrom : "#7c3aed";
  const secondaryColor = hasHydrated ? colorScheme.colors.accentTo : "#ec4899";

  const handlePlayClick = useCallback(async () => {
    if (!song?.song_path) {
      console.error("曲のパスが存在しません");
      return;
    }

    try {
      if (currentSongId !== songId) {
        await initializeAudio(song.song_path, songId);
        await play();
      } else {
        if (isPlaying) {
          pause();
        } else {
          await play();
        }
      }
    } catch (error) {
      console.error("再生処理中にエラーが発生しました:", error);
    }
  }, [
    song?.song_path,
    songId,
    currentSongId,
    isPlaying,
    initializeAudio,
    play,
    pause,
  ]);

  const handlePlaybackEnded = useCallback(() => {
    pause();
    setAudioWaveformKey((prevKey) => prevKey + 1);
  }, [pause]);

  useEffect(() => {
    if (song?.song_path) {
      const audio = new Audio(song.song_path);
      audio.addEventListener("loadedmetadata", () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        setDuration(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      });
    }
  }, [song?.song_path]);

  const handleDownloadClick = useCallback(async () => {
    setIsLoading(true);

    if (song?.song_path) {
      await downloadFile(song.song_path, `${song.title || "Untitled"}.mp3`);
    }

    setIsLoading(false);
  }, [song?.song_path, song?.title]);

  const copyLyricsToClipboard = useCallback(() => {
    try {
      navigator.clipboard.writeText(song?.lyrics || "");
      toast.success("Lyrics copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy lyrics.");
    }
  }, [song?.lyrics]);

  if (!song) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-mono relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.5) 1px, transparent 1px)`,
             backgroundSize: '100px 100px'
           }} 
      />

      {/* Hero Section (HUD Analysis Style) */}
      <div className="relative h-[60vh] md:h-[70vh] w-full border-b border-theme-500/20">
        <Image
          src={song?.image_path || "/images/loading.gif"}
          alt="Song Cover"
          fill
          className="object-cover opacity-20 blur-sm scale-110"
          unoptimized
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-transparent to-[#0a0a0f]" />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
           <div className="w-[80%] h-[80%] border border-theme-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
           <div className="w-[60%] h-[60%] border border-theme-500/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
           <AudioWaveform
             key={audioWaveformKey}
             audioUrl={song.song_path!}
             onPlayPause={handlePlayClick}
             onEnded={handlePlaybackEnded}
             primaryColor={primaryColor}
             secondaryColor={secondaryColor}
             imageUrl={song.image_path!}
             songId={songId}
           />
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 bg-gradient-to-t from-[#0a0a0f] to-transparent">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-end gap-10">
              {/* Album Art (HUD Display) */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="hidden md:block w-56 h-56 md:w-72 md:h-72 relative group cyber-glitch"
              >
                <div className="absolute -inset-4 border border-theme-500/20 pointer-events-none group-hover:border-theme-500/40 transition-colors" />
                {/* HUD Corners */}
                <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-theme-500" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-theme-500" />
                
                <div className="relative h-full w-full overflow-hidden border border-theme-500/40 shadow-[0_0_30px_rgba(var(--theme-500),0.2)]">
                  <Image
                    src={song?.image_path || "/images/wait.jpg"}
                    alt="Song Cover"
                    fill
                    className="object-cover transition-all duration-1000 group-hover:scale-125"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-theme-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] cursor-pointer" onClick={handlePlayClick}>
                    <div className="w-20 h-20 rounded-full bg-white/10 border border-white/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                       <Play size={40} className="text-white fill-current" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Song Info */}
              <div className="flex-grow space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] text-theme-500 tracking-[0.5em] uppercase animate-pulse">
                     <span className="w-2 h-2 bg-theme-500 rounded-full" />
                     [ ANALYZING_DATA_STREAM ]
                  </div>
                  <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(var(--theme-500),0.8)] break-all">
                    {song.title}
                  </h1>
                  <p className="text-xl md:text-3xl text-theme-400 uppercase tracking-widest border-l-4 border-theme-500 pl-4">
                    {"//"} AUTH: {song.author}
                  </p>
                </div>

                {/* Stats (HUD Metrics) */}
                <div className="flex flex-wrap gap-8 py-4 border-y border-theme-500/10 text-[10px] font-bold text-theme-500/80 tracking-widest uppercase">
                  <div className="flex items-center gap-3 bg-theme-500/5 px-4 py-2 border border-theme-500/10">
                    <Play size={12} className="text-theme-500" />
                    <span>PLAYS_LOG: {song.count}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-theme-500/5 px-4 py-2 border border-theme-500/10">
                    <Heart size={12} className="text-theme-500" />
                    <span>AFFINITY_INDEX: {song.like_count}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-theme-500/5 px-4 py-2 border border-theme-500/10">
                    <Clock size={12} className="text-theme-500" />
                    <span>TEMPORAL_DURATION: {duration}</span>
                  </div>
                </div>

                {/* Action Buttons (Terminal Commands) */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={handlePlayClick}
                    className="px-8 py-3 bg-theme-500 text-[#0a0a0f] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(var(--theme-500),0.5)] hover:scale-105 transition-all cyber-glitch"
                  >
                    {isPlaying ? "// PAUSE_STREAM" : "// INITIATE_PLAYBACK"}
                  </button>
                  <button
                    onClick={handleDownloadClick}
                    disabled={isLoading}
                    className="px-8 py-3 border border-theme-500 text-theme-500 font-bold uppercase tracking-widest hover:bg-theme-500/10 transition-all"
                  >
                    {isLoading ? "[ SYNCING... ]" : "[ EXTRACT_BINARY ]"}
                  </button>
                  {user?.id === song.user_id && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-8 py-3 border border-pink-500 text-pink-500 font-bold uppercase tracking-widest hover:bg-pink-500/10 transition-all"
                    >
                      [ MODIFY_CODE ]
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-20 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-theme-500/20 to-transparent" />
        
        {/* Genre Tags (Index Chips) */}
        <div className="flex flex-wrap gap-3 mb-16">
          {genres.map((genre) => (
            <Link href={`/genre/${encodeURIComponent(genre)}`} key={genre}>
              <span className="px-5 py-2 border border-theme-500/20 bg-theme-500/5 text-[10px] text-theme-400 font-bold uppercase tracking-[0.2em] hover:bg-theme-500/20 hover:border-theme-500/40 transition-all cursor-pointer">
                # {genre}
              </span>
            </Link>
          ))}
        </div>

        {/* Tabs (HUD Toggles) */}
        <div className="mb-12">
          <div className="flex gap-10 border-b border-theme-500/10 pb-4">
            <button
              onClick={() => setActiveTab("lyrics")}
              className={`text-xs font-bold uppercase tracking-[0.3em] transition-all relative group ${
                activeTab === "lyrics" ? "text-theme-500" : "text-theme-900 hover:text-theme-500/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <MdLyrics size={18} />
                <span>LYRICS_ENCRYPTION</span>
              </div>
              {activeTab === "lyrics" && (
                <motion.div
                  layoutId="song-tab"
                  className="absolute -bottom-[17px] left-0 right-0 h-1 bg-theme-500 shadow-[0_0_10px_rgba(var(--theme-500),0.8)]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("similar")}
              className={`text-xs font-bold uppercase tracking-[0.3em] transition-all relative group ${
                activeTab === "similar" ? "text-theme-500" : "text-theme-900 hover:text-theme-500/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Music2 size={18} />
                <span>SIMILAR_NODES</span>
              </div>
              {activeTab === "similar" && (
                <motion.div
                  layoutId="song-tab"
                  className="absolute -bottom-[17px] left-0 right-0 h-1 bg-theme-500 shadow-[0_0_10px_rgba(var(--theme-500),0.8)]"
                />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "lyrics" ? (
            <motion.div
              key="lyrics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#0a0a0f] border border-theme-500/10 p-10 relative group"
            >
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-theme-500/40" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-theme-500/40" />
              
              <button
                onClick={copyLyricsToClipboard}
                className="absolute top-6 right-6 p-2 bg-theme-500/10 border border-theme-500/20 text-theme-500 hover:bg-theme-500/30 hover:text-white transition-all shadow-[0_0_10px_rgba(var(--theme-500),0.1)]"
                title="COPY_DATA"
              >
                <ClipboardCopy size={18} />
              </button>
              
              <div className="prose prose-invert max-w-none font-mono">
                <div className="whitespace-pre-line text-lg leading-relaxed text-theme-300 uppercase tracking-tight">
                   {song.lyrics || "[ NO_LYRICS_DATA_FOUND_IN_SECTOR ]"}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="similar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {songGenres.map((similarSong) => (
                <Link href={`/songs/${similarSong.id}`} key={similarSong.id}>
                  <Card className="group relative overflow-hidden bg-[#0a0a0f] border border-theme-500/20 rounded-none p-4 hover:border-theme-500/60 transition-all duration-500 cyber-glitch">
                    <div className="relative aspect-video border border-theme-500/10 overflow-hidden">
                      <Image
                        src={similarSong.image_path || "/images/liked.png"}
                        alt={similarSong.title}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-125 group-hover:opacity-60"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="w-12 h-12 rounded-full border border-theme-500 flex items-center justify-center bg-theme-500/20 backdrop-blur-sm">
                           <Play size={24} className="text-white fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 font-mono uppercase">
                      <h3 className="font-bold text-theme-300 text-sm truncate group-hover:text-white transition-colors">
                        {similarSong.title}
                      </h3>
                      <p className="text-theme-500/60 text-[10px] mt-1 tracking-widest">
                        {"//"} NODE: {similarSong.author}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <EditModal
        song={song}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
});

// displayName を設定
SongContent.displayName = "SongContent";

export default SongContent;
