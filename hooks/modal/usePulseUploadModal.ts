"use client";

import { create } from "zustand";

interface PulseUploadModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Pulseアップロードモーダルの状態を管理するカスタムフック
 *
 * @returns {Object} Pulseアップロードモーダルの状態と操作関数
 * @property {boolean} isOpen - モーダルが開いているかどうか
 * @property {function} onOpen - モーダルを開く関数
 * @property {function} onClose - モーダルを閉じる関数
 */
const usePulseUploadModal = create<PulseUploadModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default usePulseUploadModal;
