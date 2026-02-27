"use client";

import { useState, useEffect, memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useUser } from "@/hooks/auth/useUser";
import useAuthModal from "@/hooks/auth/useAuthModal";
import Button from "../common/Button";
import Image from "next/image";
import { User, LogOut, Menu, X, Home, Search, Settings } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { createClient } from "@/libs/supabase/client";
import { RiPlayListFill } from "react-icons/ri";
import { FaHeart } from "react-icons/fa";

interface HeaderProps {
  className?: string;
}

const HomeHeader: React.FC<HeaderProps> = memo(({ className }) => {
  const router = useRouter();
  const authModal = useAuthModal();
  const { user, userDetails } = useUser();
  const supabaseClient = useMemo(() => createClient(), []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut();
      toast.success("LOGOUT_SUCCESSFUL");
      router.refresh();
    } catch (error) {
      toast.error("SYSTEM_ERROR_DURING_LOGOUT");
    }
  };

  return (
    <div
      className={twMerge(
        `
        fixed
        top-0
        z-50
        w-full
        h-fit
        bg-[#0a0a0f]/90
        backdrop-blur-xl
        border-b-2
        border-theme-500/40
        transition-all
        duration-500
        font-mono
        `,
        scrolled ? "shadow-[0_10px_30px_rgba(0,0,0,0.8),0_5px_15px_rgba(var(--theme-500),0.1)]" : "",
        className
      )}
    >
      {/* 背景装飾 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
      
      <div className="w-full px-6 py-4 relative z-10">
        <div className="flex items-center justify-between w-full">
          {/* Logo and app name */}
          <div className="flex items-center gap-x-4 group/logo cursor-pointer" onClick={() => router.push("/")}>
            <div className="relative">
              <div className="absolute -inset-2 bg-theme-500/20 rounded-none blur-md opacity-0 group-hover/logo:opacity-100 transition-all duration-500" />
              <div className="relative p-1 border border-theme-500/30 group-hover/logo:border-theme-500 transition-colors">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="relative z-10 drop-shadow-[0_0_8px_rgba(var(--theme-500),0.6)] group-hover/logo:scale-110 transition-transform"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-2xl tracking-[0.2em] text-white uppercase drop-shadow-[0_0_10px_rgba(var(--theme-500),0.8)] cyber-glitch">
                BadWave
              </h1>
              <span className="text-[8px] text-theme-500/40 tracking-[0.5em] uppercase -mt-1 font-bold">
                // SYSTEM_CORE_v2.0
              </span>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-x-6">
            {user ? (
              <div className="flex items-center gap-x-4">
                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="xl:hidden p-2 bg-theme-500/10 border border-theme-500/30 text-theme-500 hover:text-white transition-all"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>

                {/* User profile */}
                <div className="relative group/user">
                  <div className="absolute -inset-1 bg-theme-500/20 rounded-none blur-sm opacity-0 group-hover/user:opacity-100 transition-all duration-500" />
                  <Link href="/account" className="relative flex items-center gap-3 bg-theme-500/5 border border-theme-500/20 px-3 py-1.5 hover:border-theme-500/60 transition-all">
                    <div className="relative w-8 h-8 rounded-none overflow-hidden border border-theme-500/40 shrink-0">
                      {userDetails?.avatar_url ? (
                        <Image
                          src={userDetails.avatar_url}
                          alt="avatar"
                          fill
                          className="object-cover grayscale-[50%] group-hover/user:grayscale-0 transition-all duration-500 group-hover/user:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
                          <User className="w-4 h-4 text-theme-500" />
                        </div>
                      )}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                       <span className="text-[10px] text-white font-black uppercase tracking-widest truncate max-w-[100px]">
                          {userDetails?.full_name || "OPERATOR"}
                       </span>
                       <span className="text-[7px] text-theme-500/60 uppercase font-bold tracking-tighter">
                          [ IDENTITY_VERIFIED ]
                       </span>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={authModal.onOpen}
                  className="text-theme-500/60 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all"
                >
                  [ LOGIN ]
                </button>
                <button
                  onClick={authModal.onOpen}
                  className="px-6 py-2 bg-theme-500 text-[#0a0a0f] font-black text-[10px] uppercase tracking-[0.3em] hover:shadow-[0_0_20px_rgba(var(--theme-500),0.6)] transition-all cyber-glitch"
                >
                  // INITIALIZE_AUTH
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && user && (
          <div className="xl:hidden absolute top-full left-0 w-full bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-theme-500/40 animate-fadeDown overflow-hidden">
            {/* スキャンライン */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
            
            <div className="flex flex-col p-6 gap-y-2 relative z-10 font-mono text-[10px] font-black tracking-widest uppercase">
              {[
                { icon: Home, label: "CENTRAL_HUB", href: "/" },
                { icon: Search, label: "SIGNAL_SCAN", href: "/search" },
                { icon: RiPlayListFill, label: "DATA_CLUSTERS", href: "/playlists" },
                { icon: FaHeart, label: "FAVORITE_LOGS", href: "/liked" },
                { icon: Settings, label: "NODE_CONFIG", href: "/account" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-x-4 px-4 py-4 border border-theme-500/10 hover:bg-theme-500/10 hover:border-theme-500/40 transition-all group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon size={18} className="text-theme-500 group-hover:text-white transition-colors" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-x-4 px-4 py-4 border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all mt-4"
              >
                <LogOut size={18} />
                <span>[ TERMINATE_SESSION ]</span>
              </button>
            </div>
            
            {/* HUDコーナー */}
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-theme-500/20 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
});

// displayName を設定
HomeHeader.displayName = "HomeHeader";

export default HomeHeader;
