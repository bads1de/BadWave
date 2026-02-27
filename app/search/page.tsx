import getSongsByTitle from "@/actions/getSongsByTitle";
import Header from "@/components/Header/Header";
import SearchInput from "@/components/common/SearchInput";
import SearchContent from "./components/SearchContent";
import getPlaylistsByTitle from "@/actions/getPlaylistsByTitle";
import HeaderNav from "@/components/Header/HeaderNav";
import { Suspense } from "react";

interface SearchProps {
  searchParams: Promise<{ title: string; tab?: string }>;
}

const Search = async (props: SearchProps) => {
  const searchParams = await props.searchParams;
  const { songs } = await getSongsByTitle(searchParams.title);
  const { playlists } = await getPlaylistsByTitle(searchParams.title);

  return (
    <div className="bg-[#0a0a0f] h-full w-full overflow-hidden overflow-y-auto custom-scrollbar font-mono">
      <Header className="sticky top-0 z-10 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.2) 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }} 
        />
        <div className="flex flex-col gap-y-6 relative z-10 px-4">
          <div className="flex flex-col gap-y-1">
            <p className="text-[10px] text-theme-500/60 tracking-[0.4em] uppercase">
              // SEARCH_QUERY_INTERFACE
            </p>
            <h1 className="text-white text-4xl font-bold uppercase tracking-widest drop-shadow-[0_0_10px_rgba(var(--theme-500),0.8)]">
              SEARCH_SCAN
            </h1>
          </div>
          <Suspense
            fallback={
              <div className="h-16 w-full animate-pulse bg-theme-500/10 border border-theme-500/20" />
            }
          >
            <SearchInput />
          </Suspense>
          <HeaderNav className="mt-2 border-b border-theme-500/20" />
        </div>
      </Header>
      <div className="max-w-7xl mx-auto py-6">
        <SearchContent songs={songs} playlists={playlists} />
      </div>
    </div>
  );
};

export default Search;
