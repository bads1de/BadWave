"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createClient } from "@/libs/supabase/client";
import { useUser } from "@/hooks/auth/useUser";
import Image from "next/image";
import AccountModal from "./AccountModal";
import ColorSchemeSelector from "./ColorSchemeSelector";
import TopPlayedSongs from "./TopPlayedSongs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Palette, Activity, BarChart2 } from "lucide-react";
import StatsOverview from "./StatsOverview";

const AccountContent = () => {
  const router = useRouter();
  const { userDetails: user } = useUser();
  const supabaseClient = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await supabaseClient.auth.signOut();
      router.push("/");
      toast.success("ログアウトしました");
    } catch (error) {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 font-mono">
      {/* プロフィールセクション (HUD Dashboard Style) */}
      <div className="relative overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-xl border border-theme-500/30 shadow-[0_0_30px_rgba(var(--theme-500),0.1)] rounded-2xl p-8 group cyber-glitch">
        {/* HUD装飾コーナー */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-theme-500/40 pointer-events-none rounded-tl-2xl shadow-[-5px_-5px_15px_rgba(var(--theme-500),0.1)]" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-theme-500/40 pointer-events-none rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-theme-500/40 pointer-events-none rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-theme-500/40 pointer-events-none rounded-br-2xl" />

        {/* スキャンライン / グリッド背景 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.2) 1px, transparent 1px)`,
               backgroundSize: '20px 20px'
             }} 
        />

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-10">
          <div className="relative group/avatar">
            <div className="absolute -inset-1 bg-gradient-to-br from-theme-500 via-theme-400 to-theme-300 rounded-full blur-md opacity-40 group-hover/avatar:opacity-100 transition-all duration-700 animate-pulse"></div>
            <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full p-1.5 bg-[#0a0a0f] border-2 border-theme-500/60 shadow-[0_0_20px_rgba(var(--theme-500),0.4)]">
              <div className="absolute inset-1.5 rounded-full overflow-hidden border border-theme-500/20">
                <Image
                  src={user?.avatar_url || "/images/default-avatar.png"}
                  alt="Profile"
                  fill
                  className="object-cover transition-transform duration-700 group-hover/avatar:scale-110 group-hover/avatar:opacity-80"
                />
              </div>
            </div>
            {/* 装飾パーツ */}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-theme-500 animate-pulse" />
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] text-theme-500 tracking-[0.5em] uppercase animate-pulse">
                [ AUTHENTICATED_OPERATOR ]
              </p>
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(var(--theme-500),0.8)] break-all">
                {user?.full_name || "UNKNOWN_USER"}
              </h2>
              <div className="h-px w-full bg-gradient-to-r from-theme-500/40 via-theme-500/10 to-transparent mt-2" />
            </div>

            <div className="flex flex-wrap gap-4 font-mono uppercase tracking-widest text-xs">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="group relative px-6 py-3 border border-theme-500/50 bg-theme-500/10 text-theme-300 hover:text-white hover:bg-theme-500/30 hover:shadow-[0_0_20px_rgba(var(--theme-500),0.4)] transition-all duration-300 cyber-glitch"
              >
                <span className="relative z-10 font-bold">// MODIFY_PROFILE</span>
                <div className="absolute inset-0 bg-theme-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="group relative px-6 py-3 border border-red-500/50 bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300"
              >
                <span className="relative z-10 font-bold">
                  {isLoading ? "[ TERMINATING... ]" : "// DISCONNECT"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-8">
        <TabsList className="bg-[#0a0a0f]/60 p-1.5 border border-theme-500/30 rounded-none h-auto flex-wrap gap-2 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)]">
          <TabsTrigger
            value="appearance"
            className="flex items-center gap-2 py-3 px-6 rounded-none font-mono uppercase tracking-widest text-xs data-[state=active]:bg-theme-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-theme-500/60 data-[state=active]:shadow-[0_0_15px_rgba(var(--theme-500),0.3)] transition-all duration-500 cyber-glitch"
          >
            <Palette className="w-4 h-4 text-theme-500" />
            [ Visuals ]
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="flex items-center gap-2 py-3 px-6 rounded-none font-mono uppercase tracking-widest text-xs data-[state=active]:bg-theme-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-theme-500/60 data-[state=active]:shadow-[0_0_15px_rgba(var(--theme-500),0.3)] transition-all duration-500 cyber-glitch"
          >
            <Activity className="w-4 h-4 text-theme-500" />
            [ Stream_Log ]
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="flex items-center gap-2 py-3 px-6 rounded-none font-mono uppercase tracking-widest text-xs data-[state=active]:bg-theme-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-theme-500/60 data-[state=active]:shadow-[0_0_15px_rgba(var(--theme-500),0.3)] transition-all duration-500 cyber-glitch"
          >
            <BarChart2 className="w-4 h-4 text-theme-500" />
            [ Analytics ]
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="mt-0 outline-none">
          <ColorSchemeSelector />
        </TabsContent>

        <TabsContent value="activity" className="mt-0 outline-none">
          <TopPlayedSongs user={user} />
        </TabsContent>

        <TabsContent value="stats" className="mt-0 outline-none">
          <StatsOverview />
        </TabsContent>
      </Tabs>

      {/* プロフィール編集モーダル */}
      <AccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default AccountContent;
