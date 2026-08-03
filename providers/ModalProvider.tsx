"use client";

import AuthModal from "@/components/Modals/AuthModal";
import PlaylistModal from "@/components/Modals/PlaylistModal";
import SpotlightModal from "@/components/Modals/SpotlightModal";
import UploadModal from "@/components/Modals/UploadModal";
import { useSyncExternalStore } from "react";
import SpotlightUploadModal from "@/components/Modals/SpotlightUploadModal";
import PulseUploadModal from "@/components/Modals/PulseUploadModal";

const ModalProvider: React.FC = () => {
  // ハイドレーションエラーを防ぐため、クライアントでのマウント後にのみモーダルを描画する
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AuthModal />
      <UploadModal />
      <PlaylistModal />
      <SpotlightModal />
      <SpotlightUploadModal />
      <PulseUploadModal />
    </>
  );
};

export default ModalProvider;
