// 3環境（web / desktop / mobile）で共通化候補となる純粋定数。
//
// ※ drift 状況（2026-10-18 調査時点。変更する際は 3 環境すべてで差分を確認すること）:
//   - CACHE_PREFIX: 3 環境すべて同一（"@query-cache"）
//   - videoIds / genres: web=desktop 完全に同一（mobile は対応定義なし）
//   - CACHE_CONFIG: staleTime は 3 環境同一（10分）。gcTime は web/desktop=30分・mobile=7日で意図的に異なる
//   - CACHED_QUERIES: desktop は本ファイルの上位集合（共通キーは値まで一致）。mobile は別キー体系
//   - TABLES: desktop は本ファイル + PLAY_HISTORY。mobile は SUPABASE_TABLES（キー命名が異なる）
//   - PROTECTED_ROUTES / DURATIONS / SPRING_CONFIG / ROUTES: 環境ごとに異なる（統合しない）
export const videoIds = [
  { id: 1, name: "synthwave radio", videoId: "4xDzrJKXOOY" },
  { id: 2, name: "lofi hip hop radio", videoId: "jfKfPfyJRdk" },
  { id: 3, name: "dark ambient radio", videoId: "S_MOd40zlYU" },
  { id: 4, name: "Blade Runner Radio", videoId: "RrkrdYm3HPQ" },
  { id: 5, name: "tokyo night drive", videoId: "Lcdi9O2XB4E" },
];

export const genres = [
  { id: "j-pop", name: "J-Pop" },
  { id: "synth wave", name: "Synth Wave" },
  { id: "nu disco", name: "Nu Disco" },
  { id: "city pop", name: "City Pop" },
  { id: "tropical house", name: "Tropical House" },
  { id: "vapor wave", name: "Vapor Wave" },
  { id: "future funk", name: "Future Funk" },
  { id: "pop", name: "Pop" },
  { id: "electronic", name: "Electronic" },
  { id: "dance pop", name: "Dance Pop" },
  { id: "electro house", name: "Electro House" },
  { id: "hip-hop", name: "Hip-Hop" },
  { id: "dnb", name: "DnB" },
  { id: "r&b", name: "R&B" },
  { id: "other", name: "Other" },
];

export const CACHE_PREFIX = "@query-cache";

export const CACHED_QUERIES = {
  media: "media",
  songUrl: "songUrl",
  songById: "songById",
  songsByGenres: "songsByGenres",
  trendSongs: "trendSongs",
  downloadFile: "downloadFile",
  getTopSongs: "getTopSongs",
  playlists: "playlists",
  likeStatus: "likeStatus",
  likedSongs: "likedSongs",
  userDetails: "userDetails",
  spotlight: "spotlight",
  pulse: "pulse",
  userStats: "userStats",
  playlistSongStatus: "playlistSongStatus",
} as const;

export const CACHE_CONFIG = {
  staleTime: 1000 * 60 * 10, // 10分間
  gcTime: 1000 * 60 * 30, // 30分間
} as const;

/**
 * 認証が必要なルートのリスト
 */
export const PROTECTED_ROUTES = ["/account", "/liked", "/playlist"] as const;

export const TABLES = {
  SONGS: "songs",
  PLAYLISTS: "playlists",
  PLAYLIST_SONGS: "playlist_songs",
  LIKED_SONGS_REGULAR: "liked_songs_regular",
  USERS: "users",
  SPOTLIGHTS: "spotlights",
  PULSES: "pulses",
} as const;

export const DURATIONS = {
  FAST: 0.3,
  NORMAL: 0.5,
  SLOW: 1,
} as const;

export const SPRING_CONFIG = {
  mobile: { type: "spring" as const, damping: 30, stiffness: 300 },
  mobileMass: { type: "spring" as const, damping: 30, stiffness: 300, mass: 0.8 },
} as const;

export const ROUTES = {
  HOME: "/",
  ACCOUNT: "/account",
  LIKED: "/liked",
  SEARCH: "/search",
  PLAYLISTS: "/playlists",
  PULSE: "/pulse",
  SONGS_ALL: "/songs/all",
  SONGS_DETAIL: (id: string) => `/songs/${id}`,
  GENRE: (genre: string) => `/genre/${encodeURIComponent(genre)}`,
  PLAYLISTS_DETAIL: (id: string) => `/playlists/${id}`,
} as const;
