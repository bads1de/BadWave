import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeleteButton from "@/components/DeleteButton";
import { useUser } from "@/hooks/auth/useUser";
import { createClient } from "@/libs/supabase/client";
import { deleteFileFromR2 } from "@/actions/r2";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@/hooks/auth/useUser");
jest.mock("@/libs/supabase/client");
jest.mock("@/actions/r2");
jest.mock("react-hot-toast");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-icons/hi", () => {
  const React = require("react");
  return {
    __esModule: true,
    HiTrash: () => React.createElement("div", { "data-testid": "hi-trash" }),
  };
});

describe("DeleteButton", () => {
  const mockRouter = { refresh: jest.fn() };
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  it("renders trash icon", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    render(<DeleteButton songId="1" />);
    expect(screen.getByTestId("hi-trash")).toBeInTheDocument();
  });

  it("handles delete flow successfully", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });

    // Mock chain for delete
    mockSupabase.select.mockResolvedValue({
      data: [
        {
          id: 1,
          song_path: "path/to/song.mp3",
          image_path: "path/to/image.png",
        },
      ],
      error: null,
    });

    (deleteFileFromR2 as jest.Mock).mockResolvedValue({ success: true });

    render(<DeleteButton songId="1" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("songs");
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(deleteFileFromR2).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalledWith("削除しました");
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it("shows error toast if delete fails", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });

    mockSupabase.select.mockResolvedValue({
      data: null,
      error: { message: "Database failure" },
    });

    render(<DeleteButton songId="1" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete record from database: Database failure"
      );
    });
  });

  it("does nothing if user is not logged in", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    render(<DeleteButton songId="1" />);
    fireEvent.click(screen.getByRole("button"));

    expect(mockSupabase.from).not.toHaveBeenCalled();
  });
});
