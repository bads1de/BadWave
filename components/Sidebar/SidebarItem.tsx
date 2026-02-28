"use client";

import { IconType } from "react-icons";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import Hover from "../common/Hover";
import { memo } from "react";

interface SidebarItemProps {
  icon: IconType;
  label: string;
  active?: boolean;
  href: string;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = memo(
  ({ icon: Icon, label, active, href, isCollapsed }) => {
    if (isCollapsed) {
      return (
        <Link
          href={href}
          className={twMerge(
            `w-full flex items-center justify-center`,
            active ? "border-theme-500/30" : "border-white/5",
          )}
        >
          <Hover
            description={label}
            contentSize="w-auto px-3 py-2"
            side="right"
          >
            <div className="p-3 rounded-xl">
              <Icon
                size={20}
                className={twMerge(
                  active ? "text-theme-400" : "text-neutral-400",
                )}
              />
            </div>
          </Hover>
        </Link>
      );
    }

    return (
      <Link
        href={href}
        className={twMerge(
          `relative flex h-auto w-full items-center gap-x-3 py-3 px-3 rounded-none transition-all cyber-glitch group/item`,
          active
            ? "bg-[#0a0a0f] text-white border border-theme-500/50 shadow-[inset_0_0_15px_rgba(var(--theme-500),0.15)]"
            : "text-neutral-400 border border-transparent hover:text-white hover:border-theme-500/30 hover:bg-theme-500/5",
        )}
      >
        {/* HUD装飾コーナー */}
        <div
          className={twMerge(
            "absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors",
            active
              ? "border-theme-500"
              : "border-theme-500/0 group-hover/item:border-theme-500/40",
          )}
        />
        <div
          className={twMerge(
            "absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors",
            active
              ? "border-theme-500"
              : "border-theme-500/0 group-hover/item:border-theme-500/40",
          )}
        />

        <Icon
          size={24}
          className={twMerge(
            active && "drop-shadow-[0_0_8px_rgba(var(--theme-500),0.8)]",
          )}
        />
        <p className="truncate text-sm font-medium">{label}</p>
      </Link>
    );
  },
);

// displayName を設定
SidebarItem.displayName = "SidebarItem";

export default SidebarItem;
