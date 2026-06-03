"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/libs/utils/error";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CACHE_CONFIG } from "@/constants";

interface Props {
  children: React.ReactNode;
}

const TanStackProvider = ({ children }: Props) => {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            console.error(error);
            toast.error(getErrorMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: CACHE_CONFIG.staleTime,
            gcTime: CACHE_CONFIG.gcTime,
            retry: false,
            refetchOnWindowFocus: false, // タブフォーカス時の再フェッチを無効化
          },
        },
      })

  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default TanStackProvider;
