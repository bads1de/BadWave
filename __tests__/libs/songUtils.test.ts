import {
  extractSongsFromJoin,
  parseGenres,
  serializeGenres,
} from "@/libs/song/songUtils";

describe("libs/songUtils", () => {
  describe("extractSongsFromJoin", () => {
    it("JOIN結果からSong配列を抽出する", () => {
      const data = [
        { songs: { id: "1", title: "Song 1", artist: "Artist 1" } },
        { songs: { id: "2", title: "Song 2", artist: "Artist 2" } },
      ];

      const result = extractSongsFromJoin(data);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        title: "Song 1",
        artist: "Artist 1",
        songType: "regular",
      });
      expect(result[1]).toEqual({
        id: "2",
        title: "Song 2",
        artist: "Artist 2",
        songType: "regular",
      });
    });

    it("空配列の場合は空配列を返す", () => {
      const result = extractSongsFromJoin([]);
      expect(result).toEqual([]);
    });
  });

  describe("parseGenres", () => {
    it("カンマ区切りの文字列を配列に変換する", () => {
      expect(parseGenres("Rock, Pop, Jazz")).toEqual(["Rock", "Pop", "Jazz"]);
    });

    it("余分な空白を除去する", () => {
      expect(parseGenres("  Rock  , Pop ,Jazz ")).toEqual([
        "Rock",
        "Pop",
        "Jazz",
      ]);
    });

    it("nullの場合は空配列を返す", () => {
      expect(parseGenres(null)).toEqual([]);
    });

    it("undefinedの場合は空配列を返す", () => {
      expect(parseGenres(undefined)).toEqual([]);
    });

    it("空文字列の場合は空配列を返す", () => {
      expect(parseGenres("")).toEqual([]);
    });

    it("単一のジャンルの場合は1要素の配列を返す", () => {
      expect(parseGenres("Electronic")).toEqual(["Electronic"]);
    });
  });

  describe("serializeGenres", () => {
    it("配列をカンマ区切りの文字列に変換する", () => {
      expect(serializeGenres(["Rock", "Pop", "Jazz"])).toBe("Rock, Pop, Jazz");
    });

    it("空配列の場合は空文字列を返す", () => {
      expect(serializeGenres([])).toBe("");
    });

    it("単一要素の場合はそのまま返す", () => {
      expect(serializeGenres(["Electronic"])).toBe("Electronic");
    });
  });
});
