import { render, screen, fireEvent } from "@testing-library/react";
import DeletePlaylistSongsBtn from "@/components/Playlist/DeletePlaylistSongsBtn";
import useMutatePlaylistSong from "@/hooks/data/useMutatePlaylistSong";

// Mock hooks
jest.mock("@/hooks/data/useMutatePlaylistSong");

describe("components/Playlist/DeletePlaylistSongsBtn", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutatePlaylistSong as jest.Mock).mockReturnValue({
      deletePlaylistSong: {
        mutate: mockMutate,
        isPending: false,
      },
    });
  });

  it("renders delete icon button", () => {
    render(
      <DeletePlaylistSongsBtn songId="song-1" playlistId="playlist-1" />
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders text when showText is true", () => {
    render(
      <DeletePlaylistSongsBtn 
        songId="song-1" 
        playlistId="playlist-1" 
        showText={true} 
      />
    );
    expect(screen.getByText("削除")).toBeInTheDocument();
  });

  it("triggers deletion on click", () => {
    render(
      <DeletePlaylistSongsBtn songId="song-1" playlistId="playlist-1" />
    );
    
    fireEvent.click(screen.getByRole("button"));
    
    expect(mockMutate).toHaveBeenCalledWith({
      songId: "song-1",
      playlistId: "playlist-1",
    });
  });
});