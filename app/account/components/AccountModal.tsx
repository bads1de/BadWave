"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Modal from "@/components/Modals/Modal";
import uploadFileToR2 from "@/actions/uploadFileToR2";
import deleteFileFromR2 from "@/actions/deleteFileFromR2";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

const AccountModal = ({ isOpen, onClose, user }: AccountModalProps) => {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [newFullName, setNewFullName] = useState(user?.full_name || "");
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // プロフィール名を更新
      const { error } = await supabaseClient
        .from("users")
        .update({ full_name: newFullName })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("プロフィールを更新しました");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // 既存のアバター画像がある場合は削除する
      if (currentAvatar) {
        try {
          const filePath = currentAvatar.split("/").pop();

          await deleteFileFromR2({
            bucketName: "image",
            filePath: filePath!,
            showToast: false,
          });
        } catch (error) {
          toast.dismiss();
          toast.error("画像の削除に失敗しました");
          console.error("画像の削除に失敗しました", error);
        }
      }

      // 新しいアバター画像をアップロードする
      const avatarUrl = await uploadFileToR2({
        file,
        bucketName: "image",
        fileType: "image",
        fileNamePrefix: `avatar-${user?.id}`,
      });

      if (!avatarUrl) throw new Error("アップロードに失敗しました");

      // データベースのユーザー情報を更新する
      const { error } = await supabaseClient
        .from("users")
        .update({ avatar_url: avatarUrl })
        .eq("id", user?.id);

      if (error) throw error;

      // 現在のアバターを更新して成功メッセージを表示
      setCurrentAvatar(avatarUrl);
      toast.success("アバターを更新しました");
      router.refresh();
    } catch (error) {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="プロフィール編集"
      description="プロフィール情報を編集できます"
      isOpen={isOpen}
      onChange={onClose}
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="relative w-24 h-24 group">
            <Image
              src={currentAvatar || "/images/default-avatar.png"}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <span className="text-white text-sm">画像を変更</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <input
            type="text"
            value={newFullName}
            onChange={(e) => setNewFullName(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-800/50 border border-white/10 rounded-lg text-white"
            placeholder="ユーザー名"
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-500/20 border border-purple-500/30 text-white px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AccountModal;
