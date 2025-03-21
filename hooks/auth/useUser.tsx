import { UserDetails } from "@/types";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  getUserDetails: () => Promise<any>;
};

/**
 * ユーザーコンテキストを作成
 */
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

/**
 * ユーザーコンテキストプロバイダーコンポーネント
 *
 * @param {Props} props - プロパティ
 * @returns {JSX.Element} ユーザーコンテキストプロバイダー
 */
export const MyUserContextProvider = (props: Props) => {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsloadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const getUserDetails = useCallback(async () => {
    return await supabase.from("users").select("*").single();
  }, [supabase]);

  // セッション状態を監視
  useEffect(() => {
    const getSession = async () => {
      setIsLoadingUser(true);
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoadingUser(false);
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
  }, [supabase]);

  // ユーザー情報の取得
  useEffect(() => {
    if (user && !isLoadingData && !userDetails) {
      setIsloadingData(true);

      Promise.allSettled([getUserDetails()]).then((results) => {
        const userDetailsPromise = results[0];

        if (userDetailsPromise.status === "fulfilled") {
          setUserDetails(userDetailsPromise.value.data as UserDetails);
        }

        setIsloadingData(false);
      });
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setIsloadingData(false);
    }
  }, [
    user,
    isLoadingUser,
    supabase,
    isLoadingData,
    userDetails,
    getUserDetails,
  ]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    getUserDetails,
  };

  return <UserContext.Provider value={value} {...props} />;
};

/**
 * ユーザーコンテキストを使用するカスタムフック
 *
 * @returns {UserContextType} ユーザーコンテキスト
 */
export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a MyUserContextProvider");
  }

  return context;
};
