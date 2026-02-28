import getLikedSongs from "@/actions/getLikedSongs";
import Header from "@/components/Header/Header";
import LikedContent from "./components/LikedContent";

const Liked = async () => {
  const songs = await getLikedSongs();

  return (
    <div className="bg-[#0a0a0f] h-full w-full overflow-hidden overflow-y-auto custom-scrollbar font-mono">
      <Header className="relative overflow-hidden">
        {/* 背景装飾 */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="mt-20 relative z-10 px-8">
          <div className="flex flex-col gap-y-3 max-w-full">
            <p className="text-theme-500 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.5em] uppercase animate-pulse break-words">
              [ ACCESSING_FAVORITE_LOG... ]
            </p>
            <h1 className="text-white text-4xl sm:text-7xl lg:text-9xl font-bold uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(var(--theme-500),0.8)] break-all sm:break-normal truncate sm:overflow-visible sm:whitespace-normal">
              LIKED_LOG
            </h1>
            <div className="h-1 w-48 sm:w-64 bg-theme-500/40 shadow-[0_0_10px_rgba(var(--theme-500),0.5)] mt-2 sm:mt-4" />
          </div>
        </div>
      </Header>
      <div className="max-w-7xl mx-auto py-10">
        <LikedContent songs={songs} />
      </div>
    </div>
  );
};

export default Liked;
