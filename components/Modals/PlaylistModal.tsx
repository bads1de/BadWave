"use client";

import usePlaylistModal from "@/hooks/modal/usePlaylistModal";
import { useUser } from "@/hooks/auth/useUser";
import React, { useEffect } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Modal from "./Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import useCreatePlaylistMutation from "@/hooks/data/useCreatePlaylistMutation";

const PlaylistModal = () => {
  const playlistModal = usePlaylistModal();

  // TanStack Queryを使用したミューテーション
  const { mutateAsync, isPending: isLoading } =
    useCreatePlaylistMutation(playlistModal);

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    if (!playlistModal.isOpen) {
      reset();
    }
  }, [playlistModal.isOpen, reset]);

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      playlistModal.onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      // TanStack Queryのミューテーションを使用
      await mutateAsync({
        title: values.title,
      });

      // 成功時の処理はミューテーションのonSuccessで行われる
    } catch (error) {
      // エラー処理はミューテーション内で行われる
      console.error("Create playlist error:", error);
    }
  };

  return (
    <Modal
      title="COLLECTION_INITIATION"
      description="ESTABLISH_NEW_DATA_CLUSTER_IDENTIFIER"
      isOpen={playlistModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-6 font-mono"
        aria-label="プレイリスト作成"
      >
        <div className="space-y-2">
          <label htmlFor="title" className="text-[10px] text-theme-500 font-bold uppercase tracking-widest">
            [ COLLECTION_IDENTIFIER ]
          </label>
          <Input
            id="title"
            disabled={isLoading}
            {...register("title", { required: true })}
            placeholder="INPUT_CLUSTER_NAME"
            className="bg-[#0a0a0f] border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] rounded-none h-12"
          />
        </div>
        
        <button
          disabled={isLoading}
          type="submit"
          className="relative group overflow-hidden bg-theme-500 text-[#0a0a0f] font-black py-4 uppercase tracking-[0.5em] transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--theme-500),0.6)] disabled:opacity-50 cyber-glitch"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? "[ CLUSTERING... ]" : "// EXECUTE_INITIATION"}
          </div>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
        </button>
      </form>
    </Modal>
  );
};

export default PlaylistModal;
