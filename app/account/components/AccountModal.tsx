"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Modal from "@/components/Modals/Modal";
import uploadFileToR2 from "@/actions/uploadFileToR2";
import deleteFileFromR2 from "@/actions/deleteFileFromR2";
import { Camera, User, Lock } from "lucide-react";

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
  const supabaseClient = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [newFullName, setNewFullName] = useState(user?.full_name || "");
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordAuthUser, setIsPasswordAuthUser] = useState(false);

  useEffect(() => {
    // ユーザーの認証プロバイダーを確認する関数
    const checkAuthProvider = async () => {
      // 現在のセッション情報を取得
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      // プロバイダーがパスワード認証の場合のみtrue
      setIsPasswordAuthUser(session?.user?.app_metadata?.provider === "email");
    };

    // コンポーネントマウント時に認証プロバイダーを確認
    checkAuthProvider();
  }, [supabaseClient]);

  // プロフィール情報更新処理
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

      // 成功メッセージを表示
      toast.success("プロフィールを更新しました");
      router.refresh();
      onClose();
    } catch (error) {
      // エラーメッセージを表示
      toast.error("エラーが発生しました");
    } finally {
      // 処理完了後、ローディング状態を解除
      setIsLoading(false);
    }
  };

  // アバター画像変更処理
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // 既存のアバター画像がある場合は削除する
      if (currentAvatar) {
        try {
          // 画像のファイルパスを取得
          const filePath = currentAvatar.split("/").pop();

          // R2ストレージから既存画像を削除
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
      // エラーメッセージを表示
      toast.error("エラーが発生しました");
    } finally {
      // 処理完了後、ローディング状態を解除
      setIsLoading(false);
    }
  };

  // パスワード更新処理
  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // パスワードの一致確認
    if (newPassword !== confirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }

    // パスワードの長さ確認
    if (newPassword.length < 8) {
      toast.error("パスワードは8文字以上で入力してください");
      return;
    }

    setIsLoading(true);

    try {
      // Supabaseの認証APIでパスワードを更新
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // 成功メッセージを表示し、入力をリセット
      toast.success("パスワードを更新しました");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (error) {
      // エラーメッセージを表示
      toast.error("パスワードの更新に失敗しました");
    } finally {
      // 処理完了後、ローディング状態を解除
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
      <div className="space-y-8">
        {/* アバターセクション */}
        <div className="flex justify-center">
          <div className="relative w-28 h-28 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-900/20 animate-pulse" />
            <Image
              src={currentAvatar || "/images/default-avatar.png"}
              alt="Profile"
              fill
              className="rounded-full object-cover border-4 border-neutral-800/50 group-hover:border-purple-500/50 transition-all duration-300"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Camera className="w-6 h-6 text-purple-400" />
                <span className="text-white text-sm font-medium">
                  画像を変更
                </span>
              </div>
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

        {/* プロフィール編集フォーム */}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-400">
              <User className="w-4 h-4" />
              ユーザー名
            </label>
            <input
              type="text"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900/60 border border-white/[0.02] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-300"
              placeholder="ユーザー名を入力"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-br from-purple-500/20 to-purple-900/20 hover:from-purple-500/30 hover:to-purple-900/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50"
          >
            プロフィールを更新
          </button>
        </form>

        {/* パスワード変更フォーム */}
        {isPasswordAuthUser && (
          <form
            onSubmit={handlePasswordUpdate}
            className="space-y-6 pt-6 border-t border-white/[0.02]"
          >
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                <Lock className="w-4 h-4" />
                パスワード変更
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900/60 border border-white/[0.02] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-300"
                placeholder="新しいパスワード"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900/60 border border-white/[0.02] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-300"
                placeholder="パスワードの確認"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-neutral-900/60 border border-white/[0.02] hover:border-purple-500/30 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50"
            >
              パスワードを更新
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AccountModal;
