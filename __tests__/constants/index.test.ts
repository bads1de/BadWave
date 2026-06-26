import {
  videoIds,
  genres,
  CACHE_PREFIX,
  CACHED_QUERIES,
  CACHE_CONFIG,
  PROTECTED_ROUTES,
  TABLES,
  DURATIONS,
  SPRING_CONFIG,
  ROUTES,
} from "@/constants";

describe("constants/index", () => {
  describe("videoIds", () => {
    it("should have valid video entries", () => {
      expect(videoIds.length).toBeGreaterThan(0);
      for (const entry of videoIds) {
        expect(entry.id).toEqual(expect.any(Number));
        expect(entry.name).toEqual(expect.any(String));
        expect(entry.videoId).toMatch(/^[a-zA-Z0-9_-]{11}$/);
      }
    });
  });

  describe("genres", () => {
    it("should have unique genre ids", () => {
      const ids = genres.map((g) => g.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("each genre should have id and name", () => {
      for (const genre of genres) {
        expect(genre.id).toEqual(expect.any(String));
        expect(genre.name).toEqual(expect.any(String));
      }
    });
  });

  describe("CACHE_PREFIX", () => {
    it("should be a non-empty string", () => {
      expect(CACHE_PREFIX).toEqual(expect.any(String));
      expect(CACHE_PREFIX.length).toBeGreaterThan(0);
    });
  });

  describe("CACHED_QUERIES", () => {
    it("should have expected query keys", () => {
      expect(CACHED_QUERIES).toHaveProperty("songsByGenres");
      expect(CACHED_QUERIES).toHaveProperty("trendSongs");
      expect(CACHED_QUERIES).toHaveProperty("playlists");
      expect(CACHED_QUERIES).toHaveProperty("spotlight");
      expect(CACHED_QUERIES).toHaveProperty("pulse");
      expect(CACHED_QUERIES).toHaveProperty("userStats");
    });

    it("all values should be non-empty strings", () => {
      for (const value of Object.values(CACHED_QUERIES)) {
        expect(value).toEqual(expect.any(String));
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  describe("CACHE_CONFIG", () => {
    it("should have staleTime and gcTime", () => {
      expect(CACHE_CONFIG.staleTime).toEqual(expect.any(Number));
      expect(CACHE_CONFIG.gcTime).toEqual(expect.any(Number));
      expect(CACHE_CONFIG.staleTime).toBeGreaterThan(0);
      expect(CACHE_CONFIG.gcTime).toBeGreaterThan(0);
    });
  });

  describe("PROTECTED_ROUTES", () => {
    it("should contain expected routes", () => {
      expect(PROTECTED_ROUTES).toContain("/account");
      expect(PROTECTED_ROUTES).toContain("/liked");
    });
  });

  describe("TABLES", () => {
    it("should have expected table names", () => {
      expect(TABLES.SONGS).toBe("songs");
      expect(TABLES.PLAYLISTS).toBe("playlists");
      expect(TABLES.PLAYLIST_SONGS).toBe("playlist_songs");
      expect(TABLES.LIKED_SONGS_REGULAR).toBe("liked_songs_regular");
      expect(TABLES.USERS).toBe("users");
      expect(TABLES.SPOTLIGHTS).toBe("spotlights");
      expect(TABLES.PULSES).toBe("pulses");
    });
  });

  describe("DURATIONS", () => {
    it("should have expected duration values", () => {
      expect(DURATIONS.FAST).toBe(0.3);
      expect(DURATIONS.NORMAL).toBe(0.5);
      expect(DURATIONS.SLOW).toBe(1);
    });
  });

  describe("SPRING_CONFIG", () => {
    it("should have mobile spring config", () => {
      expect(SPRING_CONFIG.mobile.type).toBe("spring");
      expect(SPRING_CONFIG.mobile.damping).toBe(30);
      expect(SPRING_CONFIG.mobile.stiffness).toBe(300);
    });

    it("should have mobileMass spring config", () => {
      expect(SPRING_CONFIG.mobileMass.type).toBe("spring");
      expect(SPRING_CONFIG.mobileMass.mass).toBe(0.8);
    });
  });

  describe("ROUTES", () => {
    it("should have expected static routes", () => {
      expect(ROUTES.HOME).toBe("/");
      expect(ROUTES.ACCOUNT).toBe("/account");
      expect(ROUTES.LIKED).toBe("/liked");
      expect(ROUTES.SEARCH).toBe("/search");
      expect(ROUTES.PLAYLISTS).toBe("/playlists");
    });

    it("SONGS_DETAIL should return correct path", () => {
      expect(ROUTES.SONGS_DETAIL("123")).toBe("/songs/123");
    });

    it("GENRE should return encoded path", () => {
      expect(ROUTES.GENRE("city pop")).toBe("/genre/city%20pop");
    });

    it("PLAYLISTS_DETAIL should return correct path", () => {
      expect(ROUTES.PLAYLISTS_DETAIL("abc")).toBe("/playlists/abc");
    });
  });
});
