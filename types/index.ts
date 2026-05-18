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
  billing_address?: any;
  payment_method?: any;
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
