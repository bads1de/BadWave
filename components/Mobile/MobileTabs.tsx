"use client";

import Link from "next/link";
import React, { useState } from "react";
import { AiFillHome, AiOutlineBars, AiOutlineSearch } from "react-icons/ai";
import { FaHeart } from "react-icons/fa6";

const MobileTabs = () => {
  const [activeTab, setActiveTab] = useState("home");

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[75px] bg-[#0a0a0f]/90 backdrop-blur-xl border-t-2 border-theme-500/40 flex items-center justify-center z-50 font-mono">
      {/* HUD装飾背景 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[length:4px_100%] bg-[linear-gradient(90deg,rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
      
      <div className="flex w-full justify-around items-center px-4 relative z-10">
        {[
          { id: "home", icon: AiFillHome, href: "/", label: "HOME" },
          { id: "add", icon: AiOutlineSearch, href: "/search", label: "SCAN" },
          { id: "playlist", icon: AiOutlineBars, href: "/playlists", label: "NODE" },
          { id: "liked", icon: FaHeart, href: "/liked", label: "DATA" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              relative flex flex-col items-center gap-1 group transition-all duration-300
              ${activeTab === tab.id ? "text-white" : "text-theme-500/40 hover:text-theme-500/80"}
            `}
          >
            <Link href={tab.href} className="flex flex-col items-center">
              <div className={`
                p-2 transition-all duration-500
                ${activeTab === tab.id ? "bg-theme-500/20 shadow-[0_0_15px_rgba(var(--theme-500),0.3)] border-t-2 border-theme-500" : ""}
              `}>
                <tab.icon size={22} className={activeTab === tab.id ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : ""} />
              </div>
              <span className={`text-[8px] font-black tracking-widest mt-0.5 ${activeTab === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
                {tab.label}
              </span>
            </Link>
            
            {activeTab === tab.id && (
              <div className="absolute -top-[38px] w-1 h-1 bg-theme-500 shadow-[0_0_10px_#fff]" />
            )}
          </button>
        ))}
      </div>
      
      {/* 左右のHUDエンドパーツ */}
      <div className="absolute bottom-0 left-0 w-4 h-full border-l border-theme-500/20" />
      <div className="absolute bottom-0 right-0 w-4 h-full border-r border-theme-500/20" />
    </div>
  );
};

export default MobileTabs;
