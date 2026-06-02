export type SongType = "regular";

export interface Song {
  id: string;
  user_id: string;
  author: string;
  title: string;
  song_path: string;
  image_path: string;
  video_path?: string;
  genre?: string;
  count?: string;
  like_count?: string;
  lyrics?: string;
  created_at: string;
}

export interface SongWithRecommendation extends Song {
  recommendation_score: string;
}

export interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar_url?: string;
  billing_address?: Record<string, unknown>;
  payment_method?: Record<string, unknown>;
}

export interface Playlist {
  id: string;
  user_id: string;
  image_path?: string;
  title: string;
  songs?: Song[];
  is_public: boolean;
  created_at: string;
  user_name?: string;
}

export interface PlaylistSong {
  id: string;
  user_id: string;
  playlist_id: string;
  song_id?: string;
  suno_song_id?: string;
  song_type: SongType;
}

export interface Spotlight {
  id: string;
  video_path: string;
  title: string;
  author: string;
  genre?: string;
  description?: string;
  thumbnail_path?: string;
  created_at?: string;
}

export interface Pulse {
  id: string;
  title: string;
  genre: string;
  music_path: string;
}

/**
 * ページネーション対応の曲取得結果
 * actions/getSongsPaginated と hooks/data/useGetAllSongsPaginated で共有
 */
export interface PaginatedSongsResult {
  songs: Song[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * 再生回数付きの曲
 * hooks/data/useGetTopPlayedSongs で使用
 */
export interface TopPlayedSong extends Song {
  play_count: number;
}

/**
 * モーダルHook共通インターフェース
 * 各モーダルミューテーションHookで共通使用
 */
export interface ModalHook {
  onClose: () => void;
}

// ============================================================================
// 共通型定義
// ============================================================================

/**
 * 同期用の曲型（badwave-windowsのIPC通信で使用）
 * Song型にオプショナルフィールドを追加
 */
export interface SongForSync {
  id: string;
  title: string;
  author: string;
  song_path: string;
  image_path: string;
  genre?: string;
  count?: number;
  like_count?: number;
  created_at: string;
  user_id?: string;
  video_path?: string;
  duration?: number;
  lyrics?: string;
}

/**
 * 同期用のプレイリスト型
 */
export interface PlaylistForSync {
  id: string;
  title: string;
  image_path?: string;
  is_public: boolean;
  created_at: string;
  user_name?: string;
  user_id?: string;
  createdAt?: string;
}

/**
 * 同期用のスポットライト型
 */
export interface SpotlightForSync {
  id: string;
  video_path: string;
  title: string;
  author: string;
  genre?: string;
  description?: string;
  thumbnail_path?: string;
  created_at?: string;
}

/**
 * アイコンコンポーネントの型
 * lucide-reactなどのアイコンライブラリと互換性のある型
 */
export type IconComponent = React.ComponentType<{
  size?: string | number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}>;

/**
 * Cookieオプションの型
 * Supabase認証で使用
 */
export interface CookieOptions {
  path?: string;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
}
