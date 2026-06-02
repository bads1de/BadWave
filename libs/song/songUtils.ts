import { Song } from "@/types";

/**
 * JOIN クエリ（liked_songs / playlist_songs と songs の JOIN）の結果から Song 配列を抽出する
 *
 * useGetLikedSongs, useGetPlaylistSongs, actions/getLikedSongs, actions/getPlaylistSongs で
 * 重複していた `data.map((item) => ({ ...item.songs, songType: "regular" }))` を共通化。
 *
 * @param data - Supabase JOIN クエリの結果
 * @returns Song 配列
 */
export function extractSongsFromJoin(data: { songs: Song }[]): Song[] {
  return data.map((item) => ({
    ...item.songs,
    songType: "regular" as const,
  }));
}

/**
 * ジャンル文字列をパースして配列に変換する
 *
 * @param genreStr - カンマ区切りのジャンル文字列
 * @returns ジャンルの配列
 */
export function parseGenres(genreStr?: string | null): string[] {
  if (!genreStr) return [];
  return genreStr.split(",").map((g) => g.trim()).filter(Boolean);
}

/**
 * ジャンル配列を文字列にシリアライズする
 *
 * @param genres - ジャンルの配列
 * @returns カンマ区切りのジャンル文字列
 */
export function serializeGenres(genres: string[]): string {
  return genres.join(", ");
}
