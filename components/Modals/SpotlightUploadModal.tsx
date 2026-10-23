"use client";

import React, { memo, useCallback, useRef } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { RiVideoLine, RiUploadCloud2Line } from "react-icons/ri";

import Modal from "./Modal";
import Input from "@/components/common/Input";
import UploadSubmitButton from "@/components/common/UploadSubmitButton";

import useSpotLightUploadModal from "@/hooks/modal/useSpotLightUpload";
import useSpotlightUploadMutation from "@/hooks/data/useSpotlightUploadMutation";
import useFilePreview from "@/hooks/utils/useFilePreview";
import useResetOnClose from "@/hooks/utils/useResetOnClose";

const SpotlightUploadModal: React.FC = memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const spotlightUploadModal = useSpotLightUploadModal();

  // TanStack Queryを使用したミューテーション
  const { mutateAsync, isPending: isLoading } =
    useSpotlightUploadMutation(spotlightUploadModal);

  const { register, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      video: null,
      title: "",
      author: "",
      genre: "",
      description: "",
    },
  });

  // Blob URL の生成・解放は共通フックに任せる
  const {
    previewUrl: videoPreview,
    showPreview,
    clearPreview,
  } = useFilePreview();

  const resetForm = useCallback(() => {
    reset();
    clearPreview();
  }, [reset, clearPreview]);

  // ストア経由で閉じられた場合もフォームをリセットする
  useResetOnClose(spotlightUploadModal.isOpen, resetForm);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setValue("video", [file]);
        showPreview(file);
      }
    },
    [setValue, showPreview]
  );

  const onChange = useCallback(
    (open: boolean) => {
      if (!open) {
        spotlightUploadModal.onClose();
      }
    },
    [spotlightUploadModal]
  );

  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async (values) => {
      try {
        // TanStack Queryのミューテーションを使用
        await mutateAsync({
          title: values.title,
          author: values.author,
          genre: values.genre,
          description: values.description,
          videoFile: values.video?.[0] || null,
        });

        // 成功時の処理はミューテーションのonSuccessで行われる
        resetForm();
      } catch (error) {
        // エラー処理はミューテーション内で行われる
        console.error("Spotlight upload error:", error);
      }
    },
    [mutateAsync, resetForm]
  );

  return (
    <Modal
      title="SPOTLIGHT_SYNC"
      description="TRANSMIT_PRIORITY_VISUAL_ASSET_TO_HUD"
      isOpen={spotlightUploadModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-6 font-mono"
        aria-label="Spotlight投稿"
      >
        {/* タイトル・投稿者名 (HUD Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="title" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
              [ ASSET_TITLE ]
            </label>
            <Input
              id="title"
              disabled={isLoading}
              {...register("title", { required: true })}
              placeholder="INPUT_NODE_NAME"
              className="bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] rounded-none h-10"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="author" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
              [ OPERATOR_ID ]
            </label>
            <Input
              id="author"
              disabled={isLoading}
              {...register("author", { required: true })}
              placeholder="INPUT_ID_CODE"
              className="bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] rounded-none h-10"
            />
          </div>
        </div>

        {/* ジャンル・説明 (HUD Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="genre" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
              [ SECTOR_INDEX ]
            </label>
            <Input
              id="genre"
              disabled={isLoading}
              {...register("genre")}
              placeholder="MV // LIVE // PROMO"
              className="bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] rounded-none h-10"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="description" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
              [ ASSET_DESCRIPTOR ]
            </label>
            <Input
              id="description"
              disabled={isLoading}
              {...register("description")}
              placeholder="INPUT_METADATA"
              className="bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] rounded-none h-10"
            />
          </div>
        </div>

        {/* 動画ファイル選択 (Scan Zone) */}
        <div className="space-y-1">
          <label htmlFor="video" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
            [ MOTION_BINARY_SOURCE ]
          </label>
          <div
            className="
              relative p-6 border-2 border-dashed rounded-none 
              bg-[#0a0a0f] border-theme-500/20 
              hover:border-theme-500 hover:bg-theme-500/5
              hover:shadow-[0_0_20px_rgba(var(--theme-500),0.1)]
              transition-all duration-500 cursor-pointer
              group flex flex-col items-center justify-center gap-3
            "
          >
            <Input
              type="file"
              accept="video/*"
              id="video"
              disabled={isLoading}
              onChange={onFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-3 bg-theme-500/10 border border-theme-500/30 group-hover:bg-theme-500/20 transition-all duration-500">
              <RiUploadCloud2Line className="w-8 h-8 text-theme-500 group-hover:text-white drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]" />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-theme-300 font-black tracking-widest group-hover:text-white transition-colors">
                INITIATE_MOTION_SCAN
              </p>
              <p className="text-[8px] text-theme-500/40 mt-1 uppercase">
                MP4 // WEBM // MOV
              </p>
            </div>
          </div>
        </div>

        {/* 動画プレビュー (HUD Style) */}
        {videoPreview && (
          <div className="relative group overflow-hidden border border-theme-500/30 bg-[#0a0a0f] shadow-[0_0_20px_rgba(var(--theme-500),0.1)] cyber-glitch">
            <video
              ref={videoRef}
              controls
              className="w-full max-h-48 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            >
              <source src={videoPreview} />
            </video>
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-theme-500/20 text-[8px] text-theme-300 uppercase tracking-widest border border-theme-500/40">
               STREAM_PREVIEW: OK
            </div>
          </div>
        )}

        {/* 送信ボタン */}
        <UploadSubmitButton
          isLoading={isLoading}
          label="EXECUTE_SYNC"
          loadingLabel="TRANSMITTING..."
          icon={<RiVideoLine className="w-6 h-6" />}
        />
      </form>
    </Modal>
  );
});

// displayName を設定
SpotlightUploadModal.displayName = "SpotlightUploadModal";

export default SpotlightUploadModal;
