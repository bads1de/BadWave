import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LikeButton from "@/components/LikeButton";
import { useUser } from "@/hooks/auth/useUser";
import useAuthModal from "@/hooks/auth/useAuthModal";
import useLikeStatus from "@/hooks/data/useLikeStatus";
import useLikeMutation from "@/hooks/data/useLikeMutation";
import "@testing-library/jest-dom";

// Mock hooks
jest.mock("@/hooks/auth/useUser");
jest.mock("@/hooks/auth/useAuthModal");
jest.mock("@/hooks/data/useLikeStatus");
jest.mock("@/hooks/data/useLikeMutation");

// Mock react-icons
jest.mock("react-icons/ai", () => {
  const React = require("react");
  return {
    __esModule: true,
    AiFillHeart: () =>
      React.createElement("div", { "data-testid": "fill-heart" }),
    AiOutlineHeart: () =>
      React.createElement("div", { "data-testid": "outline-heart" }),
  };
});

describe("LikeButton", () => {
  const mockOnOpen = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    (useAuthModal as unknown as jest.Mock).mockReturnValue({
      onOpen: mockOnOpen,
    });
    (useLikeMutation as unknown as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    jest.clearAllMocks();
  });

  it("renders outline heart when not liked", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: false });

    render(<LikeButton songId="song-1" songType="regular" />);
    expect(screen.getByTestId("outline-heart")).toBeInTheDocument();
    expect(screen.queryByTestId("fill-heart")).not.toBeInTheDocument();
  });

  it("renders fill heart when liked", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: true });

    render(<LikeButton songId="song-1" songType="regular" />);
    expect(screen.getByTestId("fill-heart")).toBeInTheDocument();
  });

  it("opens auth modal if not logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: false });

    render(<LikeButton songId="song-1" songType="regular" />);
    fireEvent.click(screen.getByRole("button"));

    expect(mockOnOpen).toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls mutate when logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: false });

    render(<LikeButton songId="song-1" songType="regular" />);
    fireEvent.click(screen.getByRole("button"));

    expect(mockMutate).toHaveBeenCalledWith(false); // Called with current isLiked state
  });

  it("shows text when showText prop is true", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    (useLikeStatus as jest.Mock).mockReturnValue({ isLiked: true });

    render(<LikeButton songId="song-1" songType="regular" showText={true} />);
    expect(screen.getByText("いいね済み")).toBeInTheDocument();
  });
});
