"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { createClient } from "@/libs/supabase/client";
import Image from "next/image";
import Modal from "@/components/Modals/Modal";
import { Camera, User, Lock } from "lucide-react";
import useUpdateUserProfileMutation from "@/hooks/data/useUpdateUserProfileMutation";

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
  const supabaseClient = useMemo(() => createClient(), []);
  const [newFullName, setNewFullName] = useState(user?.full_name || "");
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordAuthUser, setIsPasswordAuthUser] = useState(false);

  // TanStack Queryを使用したミューテーション
  const { updateProfile, updateAvatar, updatePassword } =
    useUpdateUserProfileMutation({ onClose });

  // ローディング状態を取得
  const isLoading =
    updateProfile.isPending ||
    updateAvatar.isPending ||
    updatePassword.isPending;

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

    if (!user?.id) return;

    // TanStack Queryのミューテーションを使用
    updateProfile.mutate({
      userId: user.id,
      fullName: newFullName,
    });
  };

  // アバター画像変更処理
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // TanStack Queryのミューテーションを使用
    updateAvatar.mutate(
      {
        userId: user.id,
        avatarFile: file,
        currentAvatarUrl: currentAvatar,
      },
      {
        onSuccess: ({ avatarUrl }) => {
          // 成功時に現在のアバターを更新
          setCurrentAvatar(avatarUrl);
        },
      }
    );
  };

  // パスワード更新処理
  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // パスワードのバリデーション
    if (newPassword.length < 8) {
      toast.error("パスワードは8文字以上で入力してください");
      return;
    }

    // パスワードの一致確認
    if (newPassword !== confirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }

    // TanStack Queryのミューテーションを使用
    updatePassword.mutate(
      {
        newPassword,
      },
      {
        onSuccess: () => {
          // 成功時に入力をリセット
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  return (
    <Modal
      title="OPERATOR_CONFIGURATION"
      description="MODIFY_USER_IDENTIFIER_AND_SECURITY_PROTOCOLS"
      isOpen={isOpen}
      onChange={onClose}
    >
      <div className="space-y-10 font-mono">
        {/* アバターセクション (HUD Scanner Style) */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40 group">
            <div className="absolute -inset-4 border border-theme-500/20 rounded-full animate-[spin_10s_linear_infinite] group-hover:border-theme-500/40 transition-colors" />
            <div className="absolute -inset-2 border border-theme-500/40 rounded-full group-hover:border-theme-500 transition-colors" />
            
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-theme-500 shadow-[0_0_20px_rgba(var(--theme-500),0.4)] cyber-glitch bg-[#0a0a0f]">
              <Image
                src={currentAvatar || "/images/default-avatar.png"}
                alt="Profile"
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-70"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-theme-500/20 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-500 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <span className="text-[10px] text-white font-black tracking-widest uppercase">
                    UPDATE_BIO_SCAN
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
            {/* 装飾パーツ */}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-theme-500 animate-pulse" />
          </div>
        </div>

        {/* プロフィール編集フォーム */}
        <form
          onSubmit={handleUpdateProfile}
          className="space-y-8"
          aria-label="profile-form"
        >
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-[10px] font-bold text-theme-500 uppercase tracking-[0.3em]">
              <User className="w-3 h-3" />
              [ OPERATOR_HANDLE ]
            </label>
            <input
              type="text"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:outline-none focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] focus:shadow-[0_0_15px_rgba(var(--theme-500),0.1)] transition-all duration-300"
              placeholder="INPUT_NEW_NAME"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative group overflow-hidden bg-theme-500 text-[#0a0a0f] font-black py-4 uppercase tracking-[0.4em] transition-all duration-500 hover:shadow-[0_0_25px_rgba(var(--theme-500),0.5)] disabled:opacity-50 cyber-glitch"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
               {isLoading ? "[ SYNCING_DATA... ]" : "// EXECUTE_PROFILE_SYNC"}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
          </button>
        </form>

        {/* パスワード変更フォーム */}
        {isPasswordAuthUser && (
          <form
            onSubmit={handlePasswordUpdate}
            className="space-y-8 pt-10 border-t border-theme-500/10"
            data-testid="password-form"
          >
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-[10px] font-bold text-theme-500 uppercase tracking-[0.3em]">
                <Lock className="w-3 h-3" />
                [ SECURITY_CREDENTIALS ]
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:outline-none focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] transition-all duration-300"
                placeholder="NEW_SECURITY_PHRASE"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-theme-500/30 text-theme-300 placeholder:text-theme-900 focus:outline-none focus:border-theme-500 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)] transition-all duration-300"
                placeholder="VERIFY_SECURITY_PHRASE"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 border border-theme-500 text-theme-500 font-black uppercase tracking-[0.4em] hover:bg-theme-500/10 transition-all duration-500"
            >
              // REWRITE_CREDENTIALS
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AccountModal;
