# 聴取統計ダッシュボード (Listening Stats) 実装計画

## 概要

ユーザーの聴取習慣を可視化するダッシュボード機能を追加します。
既存のコードベース (`badwave`) を調査した結果、既に再生履歴を記録する基盤 (`hooks/player/usePlayHistory.ts`, `play_history` テーブルへのアクセス) が存在することが確認できました。本計画では、この既存基盤を活用しつつ、統計データの集計と可視化機能を追加実装します。

## 現状のコードベース分析

以下の機能は既に実装されています：

- **履歴記録**: `hooks/player/usePlayHistory.ts` および `useOnPlay.ts` により、再生時に `play_history` テーブルへの INSERT が行われている。
- **再生回数加算**: `useOnPlay.ts` 内で RPC `increment_song_play_count` を呼び出している。
- **データ構造**: `Song` 型 (`types.ts`) や `useUser.tsx` によるユーザー情報取得基盤は整っている。

## 実装ステップ

### 1. データベース確認と拡張 (Supabase)

既存の `play_history` テーブルと RPC が集計に適しているか確認します。

- [ ] **Schema 確認**: `play_history` テーブルのカラム構成が統計に適しているか確認（`duration` などが必要か検討）。
- [ ] **RPC 実装 (集計用)**: クライアントサイドや単純なクエリで集計するとパフォーマンスが悪化するため、Supabase 側に集計用の RPC (Remote Procedure Call) を作成することを推奨します。
  - 例: `get_listening_stats(user_id, period)`
  - 戻り値: `{ recent_plays, top_songs, hourly_activity }`

### 2. バックエンド実装 (Server Actions)

- [ ] **Action 作成**: `actions/stats.ts` を新規作成。
  - `getListeningStats(period: 'week' | 'month' | 'all')`:
    - サーバーサイドで認証済みユーザーを取得。
    - 上記の RPC または Supabase クエリを実行して集計データを取得する。
    - 必要に応じてデータの整形を行う。

### 3. フロントエンド・ロジック (Hooks)

既存の `usePlayHistory.ts` は書き込み用なので、読み取り用のフックを追加します。

- [ ] **Hooks 作成**: `hooks/useStats.ts` (API 呼び出し用)。
  - `useListeningStats`: `getListeningStats` Action を呼び出す `useQuery` (TanStack Query)。
  - キャッシュ戦略: 統計データは頻繁に変わらないため、`staleTime` を長めに設定。

### 4. フロントエンド・UI (Dashboard)

- [ ] **Dependencies**: `npm install recharts` を実行 (グラフ描画用)。
- [ ] **Page Creation**: `app/stats/page.tsx` を作成。
  - **Header**: タイトルと期間切り替えフィルター (Week / Month / All)。
  - **Overview**: 総再生時間、再生曲数などのサマリーカード。
  - **Charts**:
    - `recharts` を使用した「時間帯別アクティビティ」棒グラフ (BarChart)。
  - **Lists**:
    - 「よく聴く曲 (Top Songs)」: 再生回数順のリスト。
    - 「最近の再生 (Recent History)」: `play_history` の時系列リスト。
    - 「ジャンル分布 (Genre Share)」: よく聴くジャンルのパイチャート。
    - 「現在のストリーク (Current Streak)」: 連続聴取日数の表示。
- [ ] **Navigation**: サイドバー (`components/Sidebar/Sidebar.tsx` 等) に「統計 (Stats)」リンクを追加。

## 技術的詳細

### DB Schema & RPC (Proposal)

既存のテーブル定義を前提としつつ、以下の RPC 追加を計画します。

```sql
-- create_listening_stats_rpc.sql

create or replace function get_user_stats(
  target_user_id uuid,
  period_start timestamp with time zone
)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'recent_plays', (
      select json_agg(t) from (
        select s.*, ph.played_at
        from play_history ph
        join songs s on ph.song_id = s.id
        where ph.user_id = target_user_id
        order by ph.played_at desc
        limit 20
      ) t
    ),
    'hourly_activity', (
      select json_agg(t) from (
        select extract(hour from played_at) as hour, count(*) as count
        from play_history
        where user_id = target_user_id
        and played_at >= period_start
        group by 1
        order by 1
      ) t
    ),
    'top_songs', (
      select json_agg(t) from (
        select s.*, count(*) as play_count
        from play_history ph
        join songs s on ph.song_id = s.id
        where ph.user_id = target_user_id
        and played_at >= period_start
        group by s.id
        order by count(*) desc
        limit 10
      ) t
    ),
    'genre_stats', (
      select json_agg(t) from (
        select s.genre, count(*) as count
        from play_history ph
        join songs s on ph.song_id = s.id
        where ph.user_id = target_user_id
        and played_at >= period_start
        and s.genre is not null
        group by s.genre
        order by count(*) desc
      ) t
    ),
    'streak', (
      with distinct_dates as (
        select distinct date(played_at at time zone 'UTC') as play_date
        from play_history
        where user_id = target_user_id
      ),
      groups as (
        select play_date,
               play_date - (row_number() over (order by play_date) * interval '1 day') as grp
        from distinct_dates
      )
      select count(*)
      from groups
      where grp = (
        select grp
        from groups
        where play_date = current_date
        limit 1
      )
    )
  ) into result;

  return result;
end;
$$;
```

### Server Actions Interface

```typescript
// actions/stats.ts
"use server";

import { createClient } from "@/libs/supabase/server";

export async function getListeningStats(
  period: "all" | "month" | "week" = "week"
) {
  const supabase = createClient();
  // ... get user ...

  // Calculate start date based on period
  // Call RPC
  const { data, error } = await supabase.rpc("get_user_stats", {
    target_user_id: user.id,
    period_start: startDate,
  });

  return data;
}
```
