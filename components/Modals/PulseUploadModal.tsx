"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { RiPulseLine } from "react-icons/ri";

import { useUser } from "@/hooks/auth/useUser";
import usePulseUploadModal from "@/hooks/modal/usePulseUploadModal";
import usePulseUploadMutation from "@/hooks/data/usePulseUploadMutation";

import Modal from "./Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

const PulseUploadModal: React.FC = memo(() => {
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const pulseUploadModal = usePulseUploadModal();
  const { user } = useUser();

  // TanStack Queryを使用したミューテーション
  const { mutateAsync, isPending: isLoading } =
    usePulseUploadMutation(pulseUploadModal);

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FieldValues>({
      defaultValues: {
        music: null,
        title: "",
        genre: "",
      },
    });

  const music = watch("music");

  useEffect(() => {
    if (music && music.length > 0) {
      const file = music[0];
      setAudioPreview(URL.createObjectURL(file));
    }
  }, [music]);

  useEffect(() => {
    if (!pulseUploadModal.isOpen) {
      reset();
      setAudioPreview(null);
    }
  }, [pulseUploadModal.isOpen, reset]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setValue("music", [file]);
        setAudioPreview(URL.createObjectURL(file));
      }
    },
    [setValue]
  );

  const onChange = useCallback(
    (open: boolean) => {
      if (!open) {
        reset();
        setAudioPreview(null);
        pulseUploadModal.onClose();
      }
    },
    [reset, pulseUploadModal]
  );

  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async (values) => {
      try {
        // TanStack Queryのミューテーションを使用
        await mutateAsync({
          title: values.title,
          genre: values.genre,
          musicFile: values.music?.[0] || null,
        });

        // 成功時の処理はミューテーションのonSuccessで行われる
        reset();
        setAudioPreview(null);
      } catch (error) {
        // エラー処理はミューテーション内で行われる
        console.error("Pulse upload error:", error);
      }
    },
    [mutateAsync, reset]
  );

  return (
    <Modal
      title="PULSE_TRANSMISSION"
      description="BROADCAST_RETRO_SIGNAL_TO_THE_NETWORK"
      isOpen={pulseUploadModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-6 font-mono"
        aria-label="Pulse投稿"
      >
        {/* ヘッダーアイコン (HUD Style) */}
        <div className="flex items-center justify-center py-4">
          <div className="relative group/pulse-icon">
            <div className="absolute -inset-4 bg-theme-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative p-6 border border-theme-500/40 bg-theme-500/5 shadow-[inset_0_0_20px_rgba(var(--theme-500),0.1)]">
              <RiPulseLine className="w-12 h-12 text-theme-500 group-hover/pulse-icon:text-white transition-colors duration-500 drop-shadow-[0_0_10px_rgba(var(--theme-500),0.8)]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="title" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
                [ SIGNAL_IDENTIFIER ]
              </label>
              <Input
                id="title"
                disabled={isLoading}
                {...register("title", { required: true })}
                placeholder="INPUT_PULSE_NAME"
                className="bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] rounded-none h-10"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="genre" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
                [ FREQUENCY_SECTOR ]
              </label>
              <Input
                id="genre"
                disabled={isLoading}
                {...register("genre", { required: true })}
                placeholder="SYNTH / VAPOR / RETRO"
                className="bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] rounded-none h-10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="music" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
              [ RAW_AUDIO_SOURCE ]
            </label>
            <div className="relative p-6 border-2 border-dashed border-theme-500/20 bg-[#0a0a0f] hover:border-theme-500/50 hover:bg-theme-500/5 transition-all duration-500 group rounded-none cursor-pointer h-[108px] flex items-center justify-center">
              <Input
                type="file"
                accept="audio/*"
                id="music"
                disabled={isLoading}
                onChange={onFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <p className="text-[10px] text-theme-300 font-black tracking-widest group-hover:text-white transition-colors">
                  INITIATE_SIGNAL_SCAN
                </p>
                <p className="text-[8px] text-theme-500/40 mt-1 uppercase">
                  MP3 // WAV // OGG
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 音声プレビュー (HUD Style) */}
        {audioPreview && (
          <div className="p-4 bg-[#0a0a0f] border border-theme-500/30 shadow-[inset_0_0_15px_rgba(var(--theme-500),0.1)] relative overflow-hidden group">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[length:100%_4px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-2 bg-theme-500/20 border border-theme-500/40">
                <RiPulseLine className="w-5 h-5 text-theme-500 animate-pulse" />
              </div>
              <audio ref={audioRef} controls className="flex-1 h-8 opacity-80 hover:opacity-100 transition-opacity">
                <source src={audioPreview} type="audio/mpeg" />
              </audio>
            </div>
            <div className="mt-2 text-[8px] text-theme-500/40 uppercase tracking-widest text-right italic">
               signal_detected: authentic // status: stable
            </div>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          disabled={isLoading}
          type="submit"
          className="relative group overflow-hidden bg-theme-500 text-[#0a0a0f] font-black py-4 uppercase tracking-[0.5em] transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--theme-500),0.6)] disabled:opacity-50 cyber-glitch"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                BROADCASTING...
              </>
            ) : (
              <>
                <RiPulseLine className="w-6 h-6" />
                EXECUTE_BROADCAST
              </>
            )}
          </div>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
        </button>
      </form>
    </Modal>
  );
});

// displayName を設定
PulseUploadModal.displayName = "PulseUploadModal";

export default PulseUploadModal;
