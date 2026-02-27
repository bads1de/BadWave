"use client";

import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import qs from "query-string";
import { MdLibraryMusic } from "react-icons/md";
import { RiPlayListFill } from "react-icons/ri";

interface HeaderNavProps {
  className?: string;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("songs");

  // 検索クエリがある場合はそれを取得
  const title = searchParams.get("title") || "";

  useEffect(() => {
    // URLからtabパラメータを取得
    const tab = searchParams.get("tab") || "songs";
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // 現在のクエリパラメータを維持しながら、tabパラメータを更新
    const currentQuery: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      currentQuery[key] = value;
    });

    const url = qs.stringifyUrl({
      url: pathname,
      query: {
        ...currentQuery,
        tab: value,
      },
    });

    router.push(url);
  };

  return (
    <div className={`flex items-center gap-x-4 font-mono ${className}`}>
      <button
        onClick={() => handleTabChange("songs")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden cyber-glitch ${
          activeTab === "songs"
            ? "bg-theme-500/20 text-white border border-theme-500 shadow-[0_0_15px_rgba(var(--theme-500),0.3)]"
            : "bg-theme-500/5 border border-theme-500/10 text-theme-500/60 hover:text-white hover:border-theme-500/40"
        }`}
      >
        {activeTab === "songs" && (
           <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
        )}
        <MdLibraryMusic size={14} className={activeTab === "songs" ? "text-theme-500" : ""} />
        <span>[ AUDIO_NODES ]</span>
      </button>
      <button
        onClick={() => handleTabChange("playlists")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden cyber-glitch ${
          activeTab === "playlists"
            ? "bg-theme-500/20 text-white border border-theme-500 shadow-[0_0_15px_rgba(var(--theme-500),0.3)]"
            : "bg-theme-500/5 border border-theme-500/10 text-theme-500/60 hover:text-white hover:border-theme-500/40"
        }`}
      >
        {activeTab === "playlists" && (
           <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
        )}
        <RiPlayListFill size={14} className={activeTab === "playlists" ? "text-theme-500" : ""} />
        <span>[ COLLECTION_DATA ]</span>
      </button>
    </div>
  );
};

export default HeaderNav;
