import type { Metadata } from "next";
import { Figtree, Syncopate, Space_Mono } from "next/font/google";

import getPlaylists from "@/actions/getPlaylists";

import Player from "@/components/Player/Player";
import RightSidebar from "@/components/RightSidebar/RightSidebar";
import Sidebar from "@/components/Sidebar/Sidebar";

import ModalProvider from "@/providers/ModalProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import PlaybackStateProvider from "@/providers/PlaybackStateProvider";

import ToasterProvider from "@/providers/ToasterProvider";
import UserProvider from "@/providers/UserProvider";
import TanStackProvider from "@/providers/TanStackProvider";
import "./globals.css";

const font = Figtree({ subsets: ["latin"] });
const syncopate = Syncopate({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-syncopate",
});
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "BadWave",
  description: "Listen to music!",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playlists = await getPlaylists();

  return (
    <html
      lang="ja"
      className={`${syncopate.variable} ${spaceMono.variable}`}
    >
      <body className={font.className}>
        <ToasterProvider />
        <TanStackProvider>
          <UserProvider>
            <ThemeProvider>
              <PlaybackStateProvider>
                <ModalProvider />
                <div className="app-wrapper">
                  <Sidebar>
                    <RightSidebar>{children}</RightSidebar>
                  </Sidebar>
                  <Player playlists={playlists} />
                </div>
              </PlaybackStateProvider>
            </ThemeProvider>
          </UserProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
