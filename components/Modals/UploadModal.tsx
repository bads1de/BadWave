"use client";

import * as React from "react";
import {
  useState,
  useRef,
  useEffect,
  DragEvent,
  memo,
  useCallback,
} from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Image from "next/image";

import useUploadModal from "@/hooks/modal/useUploadModal";
import { useUser } from "@/hooks/auth/useUser";
import useUploadSongMutation from "@/hooks/data/useUploadSongMutation";

import Modal from "./Modal";
import Input from "../common/Input";
import { Textarea } from "../ui/textarea";
import GenreSelect from "../Genre/GenreSelect";
import Button from "../common/Button";
import { RiUploadCloud2Line, RiMusic2Line } from "react-icons/ri";

const UploadModal: React.FC = memo(() => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const uploadModal = useUploadModal();
  const { user } = useUser();

  // TanStack Queryを使用したミューテーション
  const { mutateAsync, isPending: isLoading } =
    useUploadSongMutation(uploadModal);

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<FieldValues>({
      defaultValues: {
        author: "",
        title: "",
        lyrics: "",
        song: null,
        image: null,
      },
    });

  const song = watch("song");
  const image = watch("image");

  const handleFileDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) handleFiles(files);
    },
    []
  );

  const handleFiles = useCallback(
    (files: FileList) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.type.startsWith("audio/")) {
          setValue("song", [file]);
          setAudioPreview(URL.createObjectURL(file));
        } else if (file.type.startsWith("image/")) {
          setValue("image", [file]);
          setImagePreview(URL.createObjectURL(file));
        } else {
          toast.error("サポートされていないファイル形式です");
        }
      }
    },
    [setValue]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (image && image.length > 0) {
      const file = image[0];
      setImagePreview(URL.createObjectURL(file));
    }
  }, [image]);

  useEffect(() => {
    if (song && song.length > 0) {
      const file = song[0];
      setAudioPreview(URL.createObjectURL(file));
    }
  }, [song]);

  useEffect(() => {
    if (!uploadModal.isOpen) {
      reset();
      setImagePreview(null);
      setAudioPreview(null);
    }
  }, [uploadModal.isOpen, reset]);

  const onChange = useCallback(
    (open: boolean) => {
      if (!open) {
        reset();
        setImagePreview(null);
        setAudioPreview(null);
        uploadModal.onClose();
      }
    },
    [reset, uploadModal]
  );

  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async (values) => {
      try {
        const imageFile = values.image?.[0];
        const songFile = values.song?.[0];

        if (!imageFile || !songFile || !user) {
          toast.error("必須フィールドが未入力です");
          return;
        }

        // TanStack Queryのミューテーションを使用
        await mutateAsync({
          title: values.title,
          author: values.author,
          lyrics: values.lyrics,
          genre: selectedGenres,
          songFile,
          imageFile,
        });

        // 成功時の処理（ミューテーションのonSuccessで処理されるため、ここでは最小限の処理のみ）
        reset();
        setImagePreview(null);
        setAudioPreview(null);
      } catch (error) {
        // エラー処理はミューテーション内で行われるため、ここでは何もしない
        console.error("Upload error:", error);
      }
    },
    [mutateAsync, reset, user, selectedGenres, setImagePreview, setAudioPreview]
  );

  return (
    <Modal
      title="DATA_INGESTION"
      description="TRANSMIT_BINARY_STREAM_TO_CENTRAL_CORE"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono"
        aria-label="曲をアップロード"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label htmlFor="title" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
                [ ASSET_TITLE ]
              </label>
              <Input
                id="title"
                disabled={isLoading}
                {...register("title", { required: true })}
                placeholder="INPUT_TRACK_NAME"
                className="h-10 bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] rounded-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="author" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
                [ ORIGIN_AUTHOR ]
              </label>
              <Input
                id="author"
                disabled={isLoading}
                {...register("author", { required: true })}
                placeholder="INPUT_OPERATOR_ID"
                className="h-10 bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] rounded-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="lyrics" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
              [ TEXTUAL_DATA_LOG ]
            </label>
            <Textarea
              id="lyrics"
              disabled={isLoading}
              {...register("lyrics")}
              placeholder="PASTE_LOG_STREAM_HERE"
              className="bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 h-24 resize-none rounded-none shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">[ SECTOR_INDEX ]</label>
            <GenreSelect
              onGenreChange={(genres: string) => setSelectedGenres([genres])}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="file" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
              [ BINARY_SOURCE ]
            </label>
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
              className={`
                relative p-6 border-2 border-dashed transition-all duration-500 cursor-pointer group rounded-none
                ${
                  isDragging
                    ? "border-theme-500 bg-theme-500/20 shadow-[0_0_20px_rgba(var(--theme-500),0.3)]"
                    : "border-theme-500/20 bg-[#0a0a0f] hover:border-theme-500/50 hover:bg-theme-500/5 hover:shadow-[0_0_15px_rgba(var(--theme-500),0.1)]"
                }
              `}
            >
              <Input
                type="file"
                accept="audio/*,image/*"
                id="file"
                disabled={isLoading}
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                multiple
              />
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-theme-500/10 border border-theme-500/30 group-hover:bg-theme-500/20 transition-all duration-500">
                  <RiUploadCloud2Line className="w-8 h-8 text-theme-500 group-hover:text-white drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]" />
                </div>
                <div>
                  <p className="text-xs text-theme-300 font-bold tracking-widest group-hover:text-white transition-colors">
                    INITIATE_UPLOADER_SCAN
                  </p>
                  <p className="text-[8px] text-theme-500/60 mt-1 uppercase">
                    SUPPORTED: .MP3 // .JPG // .PNG
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {imagePreview && (
              <div className="aspect-square relative overflow-hidden rounded-none border border-theme-500/40 shadow-[0_0_15px_rgba(var(--theme-500),0.2)] cyber-glitch">
                <Image
                  src={imagePreview}
                  alt="PREVIEW"
                  className="object-cover opacity-80"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-theme-500/10 mix-blend-overlay animate-pulse" />
              </div>
            )}
            {audioPreview && (
              <div className="flex flex-col items-center justify-center p-4 bg-[#0a0a0f] border border-theme-500/40 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.1)]">
                <RiMusic2Line className="w-8 h-8 text-theme-500 mb-2 animate-pulse" />
                <span className="text-[8px] text-theme-500 tracking-[0.2em]">SIGNAL_DETECTED</span>
              </div>
            )}
          </div>
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="col-span-full relative group overflow-hidden bg-theme-500 text-[#0a0a0f] font-black py-4 uppercase tracking-[0.5em] transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--theme-500),0.6)] disabled:opacity-50 cyber-glitch"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                TRANSMITTING...
              </>
            ) : (
              <>
                <RiMusic2Line className="w-6 h-6" />
                EXECUTE_INGESTION
              </>
            )}
          </div>
          {/* 背景装飾 */}
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
        </button>
      </form>
    </Modal>
  );
});

// displayName を設定
UploadModal.displayName = "UploadModal";

export default UploadModal;
