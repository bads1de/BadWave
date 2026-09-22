import { render, screen } from "@testing-library/react";
import SongListContent, {
  SongListEmptyState,
} from "@/components/Song/SongListContent";
import { useUser } from "@/hooks/auth/useUser";
import { Song } from "@/types";

// 子コンポーネントはモックして受け渡された内容だけを検証する
jest.mock("@/components/Song/SongList", () => ({
  __esModule: true,
  default: ({ data }: { data: Song }) => {
    const React =
      jest.requireActual<typeof import("react")>("react");
    return React.createElement(
      "div",
      { "data-testid": "song-row" },
      data.title
    );
  },
}));

jest.mock("@/components/Song/SongOptionsPopover", () => ({
  __esModule: true,
  default: ({ song }: { song: Song }) => {
    const React =
      jest.requireActual<typeof import("react")>("react");
    return React.createElement(
      "div",
      { "data-testid": "song-options" },
      song.title
    );
  },
}));

jest.mock("@/hooks/player/useOnPlay", () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(),
}));

describe("components/Song/SongListContent", () => {
  const mockSongs: Song[] = [
    {
      id: "song-1",
      user_id: "user-1",
      title: "Song 1",
      author: "Author 1",
      song_path: "song1.mp3",
      image_path: "img1.jpg",
      created_at: "2024-01-01",
    },
    {
      id: "song-2",
      user_id: "user-1",
      title: "Song 2",
      author: "Author 2",
      song_path: "song2.mp3",
      image_path: "img2.jpg",
      created_at: "2024-01-01",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as unknown as jest.Mock).mockReturnValue({
      user: { id: "user-1" },
    });
  });

  it("曲が0件のときは空状態を表示すること", () => {
    render(
      <SongListContent
        songs={[]}
        emptyState={<SongListEmptyState message="[ ! ] NO_DATA" />}
      />
    );

    expect(screen.getByText("[ ! ] NO_DATA")).toBeInTheDocument();
    expect(screen.queryByTestId("song-row")).not.toBeInTheDocument();
  });

  it("渡された曲を一覧表示すること", () => {
    render(<SongListContent songs={mockSongs} />);

    const rows = screen.getAllByTestId("song-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Song 1");
    expect(rows[1]).toHaveTextContent("Song 2");
  });

  it("reverseが指定された場合は逆順で表示すること", () => {
    render(<SongListContent songs={mockSongs} reverse />);

    const rows = screen.getAllByTestId("song-row");
    expect(rows[0]).toHaveTextContent("Song 2");
    expect(rows[1]).toHaveTextContent("Song 1");
  });

  it("ログイン中のユーザーがいるときはオプションを表示すること", () => {
    render(<SongListContent songs={mockSongs} />);

    expect(screen.getAllByTestId("song-options")).toHaveLength(2);
  });

  it("ログインしていない場合はオプションを表示しないこと", () => {
    (useUser as unknown as jest.Mock).mockReturnValue({ user: null });
    render(<SongListContent songs={mockSongs} />);

    expect(screen.queryByTestId("song-options")).not.toBeInTheDocument();
  });

  it("showOptionsが指定された場合はログインなしでもオプションを表示すること", () => {
    (useUser as unknown as jest.Mock).mockReturnValue({ user: null });
    render(<SongListContent songs={mockSongs} showOptions />);

    expect(screen.getAllByTestId("song-options")).toHaveLength(2);
  });

  it("ヘッダーが指定された場合は表示すること", () => {
    render(
      <SongListContent songs={mockSongs} header={<span>SCAN_RESULTS</span>} />
    );

    expect(screen.getByText("SCAN_RESULTS")).toBeInTheDocument();
  });
});
