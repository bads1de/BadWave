/**
 * @fileoverview ユーザー認証状態を管理するためのカスタムフック
 *
 * このモジュールはSupabaseを使用した認証状態の管理と、
 * ユーザー情報の取得を行うためのコンテキストとフックを提供します。
 * TanStack Queryを使用してユーザーデータのキャッシュと再取得を最適化しています。
 */

import { UserDetails } from "@/types";
import { useEffect, useRef, useState, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG, CACHED_QUERIES } from "@/constants";
import { getErrorMessage } from "@/libs/utils/error";

/**
 * ユーザーコンテキストの型定義
 * @typedef {Object} UserContextType
 * @property {string|null} accessToken - ユーザーの認証トークン
 * @property {User|null} user - Supabaseのユーザーオブジェクト
 * @property {UserDetails|null} userDetails - データベースから取得したユーザー詳細情報
 * @property {boolean} isLoading - ユーザー情報の読み込み状態
 */
type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
};

/**
 * ユーザー情報を保持するReactコンテキスト
 * アプリケーション全体でユーザー状態を共有するために使用
 */
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

/**
 * コンテキストプロバイダーのプロパティ型
 * @interface Props
 */
export interface Props {
  children: React.ReactNode;
}

/**
 * ユーザーコンテキストプロバイダーコンポーネント
 * アプリケーション内でユーザー認証状態を管理し、子コンポーネントに提供する
 * @param {Props} props - コンポーネントのプロパティ
 */
export const MyUserContextProvider = (props: Props) => {
  // useRefでクライアントを固定し、毎レンダリングで新インスタンスが生成されないようにする
  // （createClient()が再実行されると、useEffectの依存配列が変化して無限ループが発生する恐れがある）
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  /**
   * セッション状態を監視するエフェクト
   * 初期セッションの取得と認証状態の変更を監視する
   */
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  // supabaseは useRef で固定済みなので依存配列に含めない
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * ユーザー詳細情報をデータベースから取得するクエリ
   * TanStack Queryを使用してキャッシュと再取得を最適化
   */
  const { data: userDetails, isLoading: isLoadingUserDetails } = useQuery({
    queryKey: [CACHED_QUERIES.userDetails, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase.from("users").select("*").maybeSingle();

      if (error) {
        throw new Error(`ユーザー情報の取得に失敗しました: ${getErrorMessage(error)}`);
      }

      return data as UserDetails | null;
    },
    enabled: !!user, // ユーザーが存在する場合のみクエリを実行
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
  });

  /**
   * コンテキストに提供する値の構築
   * セッション、ユーザー、詳細情報、ローディング状態を含む
   */
  const value = {
    accessToken: session?.access_token ?? null,
    user,
    userDetails: userDetails ?? null,
    isLoading: !session || isLoadingUserDetails,
  };

  return <UserContext.Provider value={value} {...props} />;
};

/**
 * ユーザー情報にアクセスするためのカスタムフック
 *
 * このフックを使用することで、コンポーネントからユーザーの認証状態や
 * 詳細情報に簡単にアクセスできます。
 *
 * @returns {UserContextType} ユーザーコンテキスト情報
 * @throws {Error} MyUserContextProviderの外部で使用された場合にエラーをスロー
 */
export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a MyUserContextProvider");
  }

  return context;
};
