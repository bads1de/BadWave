import { UserDetails } from "@/types";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  useUser as useSupaUser,
  useSessionContext,
  User,
} from "@supabase/auth-helpers-react";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
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
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsloadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const getUserDetails = useCallback(() => {
    return supabase.from("users").select("*").single();
  }, [supabase]);

  // ユーザー情報とサブスクリプション情報の取得
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
