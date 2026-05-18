import { create } from "zustand";

interface ModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * モーダル用のZustandストアを生成するファクトリ関数
 *
 * useUploadModal, usePlaylistModal, useSpotLightUploadModal,
 * usePulseUploadModal, useAuthModal で重複していた
 * `{ isOpen, onOpen, onClose }` パターンを共通化。
 *
 * @returns モーダルストア
 */
export function createModalStore() {
  return create<ModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }));
}
