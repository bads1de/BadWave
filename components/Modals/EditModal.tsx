"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";

import { Song } from "@/types";
import Modal from "./Modal";
import Input from "../common/Input";
import { Textarea } from "../ui/textarea";
import GenreSelect from "../Genre/GenreSelect";
import Button from "../common/Button";
import useEditSongMutation from "@/hooks/data/useEditSongMutation";

interface EditFormValues extends Partial<Song> {
  video?: FileList;
  song?: FileList;
  image?: FileList;
}

interface EditModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}

const EditModal = ({ song, isOpen, onClose }: EditModalProps) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // TanStack Queryを使用したミューテーション
  const { mutateAsync, isPending: isLoading } = useEditSongMutation({
    onClose,
  });

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<EditFormValues>({
      defaultValues: {
        id: song.id,
        user_id: song.user_id,
        title: song.title,
        author: song.author,
        lyrics: song.lyrics,
        image_path: song.image_path,
        video_path: song.video_path || "",
        song_path: song.song_path,
        genre: song.genre || "All",
      },
    });

  const watchVideo = watch("video");
  const watchSong = watch("song");
  const watchImage = watch("image");

  useEffect(() => {
    if (isOpen) {
      reset({
        id: song.id,
        user_id: song.user_id,
        title: song.title,
        author: song.author,
        lyrics: song.lyrics,
        image_path: song.image_path,
        song_path: song.song_path,
        genre: song.genre || "All",
        video_path: song.video_path || "",
        video: undefined,
        song: undefined,
        image: undefined,
      });
      setSelectedGenres(song.genre ? song.genre.split(", ") : []);
    }
  }, [isOpen, song, reset]);

  const onSubmit: SubmitHandler<EditFormValues> = async (values) => {
    try {
      // TanStack Queryのミューテーションを使用
      await mutateAsync({
        id: song.id,
        title: values.title!,
        author: values.author!,
        lyrics: values.lyrics,
        genre: selectedGenres,
        videoFile: values.video?.[0] || null,
        songFile: values.song?.[0] || null,
        imageFile: values.image?.[0] || null,
        currentSong: song,
      });

      // 成功時の処理はミューテーションのonSuccessで行われる
    } catch (error) {
      // エラー処理はミューテーション内で行われる
      console.error("Edit error:", error);
    }
  };

  return (
    <Modal
      title="ASSET_MODIFICATION"
      description="EXECUTE_DATA_OVERRIDE_ON_TARGET_NODE"
      isOpen={isOpen}
      onChange={() => onClose()}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono"
        aria-label="曲の編集"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">[ DATA_IDENTIFIER ]</label>
              <Input
                disabled={isLoading}
                {...register("title", { required: true })}
                placeholder="TRACK_NAME"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">[ ORIGIN_AUTH ]</label>
              <Input
                disabled={isLoading}
                {...register("author", { required: true })}
                placeholder="OPERATOR_ID"
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">[ TEXTUAL_LOG ]</label>
            <Textarea
              disabled={isLoading}
              {...register("lyrics")}
              placeholder="LYRICS_DATA_STREAM"
              className="min-h-[180px]"
            />
            <div className="absolute top-8 right-2">
              <label
                htmlFor="lrc-upload"
                className="cursor-pointer bg-theme-500/10 border border-theme-500/40 hover:bg-theme-500 hover:text-[#0a0a0f] text-[8px] font-black px-2 py-1 transition-all uppercase tracking-widest"
              >
                // LOAD_LRC
              </label>
              <input
                id="lrc-upload"
                type="file"
                accept=".lrc,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const text = ev.target?.result as string;
                    if (text) {
                      setValue("lyrics", text);
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">[ SECTOR_LINK ]</label>
            <GenreSelect
              onGenreChange={(genres: string) => setSelectedGenres([genres])}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="song" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
                [ AUDIO_BINARY_SWAP ]
              </label>
              <Input
                id="song"
                disabled={isLoading}
                type="file"
                accept="audio/*"
                {...register("song")}
                className="text-[10px]"
              />
              {song.song_path && (
                <div className="mt-2 p-4 bg-theme-500/5 border border-theme-500/10">
                  <div className="flex justify-between items-center text-[8px] text-theme-500/40 uppercase mb-2">
                     <span>CURRENT_SIGNAL_PATH</span>
                     <span className="text-green-500">READY</span>
                  </div>
                  <audio controls className="w-full h-8 opacity-60 hover:opacity-100 transition-opacity">
                    <source src={song.song_path} type="audio/mpeg" />
                  </audio>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="image" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
                [ VISUAL_BUFFER_SWAP ]
              </label>
              <Input
                id="image"
                disabled={isLoading}
                type="file"
                accept="image/*"
                {...register("image")}
                className="text-[10px]"
              />
              {song.image_path && (
                <div className="mt-2 relative w-full aspect-video border border-theme-500/20 group/img">
                  <Image
                    src={song.image_path}
                    alt="Current Image"
                    fill
                    className="object-cover opacity-60 group-hover/img:opacity-100 transition-opacity"
                    sizes="(max-width: 640px) 100vw, 300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-40" />
                  <div className="absolute bottom-2 left-2 text-[8px] text-white font-bold bg-theme-500/40 px-2 py-0.5 border border-theme-500/60">
                     EXISTING_TEXTURE
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="video" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
                [ MOTION_DATA_LINK ]
              </label>
              <Input
                id="video"
                disabled={isLoading}
                type="file"
                accept="video/*"
                {...register("video")}
                className="text-[10px]"
              />
              {song.video_path && (
                <div className="mt-2 flex items-center justify-between p-3 bg-theme-500/5 border border-theme-500/10">
                  <span className="text-[8px] text-theme-500/60 uppercase tracking-widest">SIGNAL_DETECTED: .MP4</span>
                  <a
                    href={song.video_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[8px] font-black text-theme-500 hover:text-white underline tracking-widest"
                  >
                    [ VERIFY_STREAM ]
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          disabled={isLoading} 
          type="submit"
          className="col-span-full relative group overflow-hidden bg-theme-500 text-[#0a0a0f] font-black py-4 uppercase tracking-[0.5em] transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--theme-500),0.6)] disabled:opacity-50 cyber-glitch"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            {isLoading ? "[ OVERWRITING_NODE... ]" : "// COMMIT_MODIFICATIONS"}
          </div>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
        </button>
      </form>
    </Modal>
  );
};

export default EditModal;
