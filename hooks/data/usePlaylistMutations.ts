"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth/useUser";
import { createClient } from "@/libs/supabase/client";
import { CACHED_QUERIES } from "@/constants";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { getErrorMessage } from "@/libs/utils/error";
import { Playlist } from "@/types";

interface UpdatePlaylistTitleParams {
  playlistId: string;
  newTitle: string;
}

interface TogglePlaylistPublicParams {
  playlistId: string;
  isPublic: boolean;
}

interface DeletePlaylistParams {
  playlistId: string;
}

/**
 * プレイリストのタイトルを更新するミューテーション
 */
export const useUpdatePlaylistTitle = () => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ playlistId, newTitle }: UpdatePlaylistTitleParams) => {
      if (!user) throw new Error("Unauthorized");

      const { error } = await supabase
        .from("playlists")
        .update({ title: newTitle })
        .eq("id", playlistId)
        .eq("user_id", user.id);

      if (error) throw error;

      return { playlistId, newTitle };
    },
    onMutate: async ({ playlistId, newTitle }) => {
      await queryClient.cancelQueries({
        queryKey: [CACHED_QUERIES.playlists],
      });

      const previousPlaylists = queryClient.getQueryData<Playlist[]>([
        CACHED_QUERIES.playlists,
      ]);

      queryClient.setQueryData<Playlist[]>([CACHED_QUERIES.playlists], (old) =>
        (old || []).map((p) =>
          p.id === playlistId ? { ...p, title: newTitle } : p,
        ),
      );

      return { previousPlaylists };
    },
    onSuccess: ({ playlistId, newTitle }) => {
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.playlists] });
      toast.success("プレイリスト名を更新しました");
      router.push(
        `/playlists/${playlistId}?title=${encodeURIComponent(newTitle)}`
      );
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPlaylists) {
        queryClient.setQueryData(
          [CACHED_QUERIES.playlists],
          context.previousPlaylists,
        );
      }
      toast.error(getErrorMessage(_error, ERROR_MESSAGES.PLAYLIST_UPDATE_FAILED));
    },
  });
};

/**
 * プレイリストの公開/非公開を切り替えるミューテーション
 */
export const useTogglePlaylistPublic = () => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ playlistId, isPublic }: TogglePlaylistPublicParams) => {
      if (!user) throw new Error("Unauthorized");

      const { error } = await supabase
        .from("playlists")
        .update({ is_public: !isPublic })
        .eq("id", playlistId)
        .eq("user_id", user.id);

      if (error) throw error;
      return { isPublic: !isPublic, playlistId };
    },
    onMutate: async ({ playlistId, isPublic }) => {
      await queryClient.cancelQueries({
        queryKey: [CACHED_QUERIES.playlists],
      });

      const previousPlaylists = queryClient.getQueryData<Playlist[]>([
        CACHED_QUERIES.playlists,
      ]);

      queryClient.setQueryData<Playlist[]>([CACHED_QUERIES.playlists], (old) =>
        (old || []).map((p) =>
          p.id === playlistId ? { ...p, is_public: !isPublic } : p,
        ),
      );

      return { previousPlaylists };
    },
    onSuccess: ({ isPublic }) => {
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.playlists] });
      toast.success(
        isPublic
          ? "プレイリストを公開しました"
          : "プレイリストを非公開にしました"
      );
      router.refresh();
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPlaylists) {
        queryClient.setQueryData(
          [CACHED_QUERIES.playlists],
          context.previousPlaylists,
        );
      }
      toast.error(getErrorMessage(_error, ERROR_MESSAGES.PLAYLIST_VISIBILITY_UPDATE_FAILED));
    },
  });
};

/**
 * プレイリストを削除するミューテーション
 */
export const useDeletePlaylist = () => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ playlistId }: DeletePlaylistParams) => {
      if (!user) throw new Error("Unauthorized");

      await supabase
        .from("playlist_songs")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("user_id", user.id);

      await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistId)
        .eq("user_id", user.id);
    },
    onMutate: async ({ playlistId }) => {
      await queryClient.cancelQueries({
        queryKey: [CACHED_QUERIES.playlists],
      });

      const previousPlaylists = queryClient.getQueryData<Playlist[]>([
        CACHED_QUERIES.playlists,
      ]);

      queryClient.setQueryData<Playlist[]>([CACHED_QUERIES.playlists], (old) =>
        (old || []).filter((p) => p.id !== playlistId),
      );

      return { previousPlaylists };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.playlists] });
      toast.success("プレイリストを削除しました");
      router.push("/playlists");
      router.refresh();
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPlaylists) {
        queryClient.setQueryData(
          [CACHED_QUERIES.playlists],
          context.previousPlaylists,
        );
      }
      toast.error(getErrorMessage(_error, ERROR_MESSAGES.PLAYLIST_DELETE_FAILED));
    },
  });
};
