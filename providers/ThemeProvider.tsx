"use client";

import { useEffect, useSyncExternalStore } from "react";
import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorSchemeId } = useColorSchemeStore();
  // ハイドレーションエラーを防ぐため、クライアントでのマウント後にのみテーマを適用する
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isMounted) return;

    // data-theme属性を設定（CSS側でテーマ変数が切り替わる）
    document.documentElement.setAttribute("data-theme", colorSchemeId);
  }, [isMounted, colorSchemeId]);

  // ハイドレーションエラーを防ぐため、マウント前は何もレンダリングしない
  if (!isMounted) {
    return <>{children}</>;
  }

  const isCyberpunk = colorSchemeId === "cyberpunk";

  return (
    <>
      {isCyberpunk && (
        <div className="scanline-overlay scanline-moving" aria-hidden="true" />
      )}
      {children}
    </>
  );
};

export default ThemeProvider;
