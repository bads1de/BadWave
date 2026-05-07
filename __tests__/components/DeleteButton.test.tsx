import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteButton from "@/components/DeleteButton";
import useDeleteSongMutation from "@/hooks/data/useDeleteSongMutation";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@/hooks/data/useDeleteSongMutation");

jest.mock("react-icons/hi", () => {
  const React = require("react");
  return {
    __esModule: true,
    HiTrash: () => React.createElement("div", { "data-testid": "hi-trash" }),
  };
});

describe("DeleteButton", () => {
  const mockMutate = jest.fn();
  
  beforeEach(() => {
    (useDeleteSongMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    jest.clearAllMocks();
  });

  it("renders trash icon", () => {
    render(<DeleteButton songId="1" />);
    expect(screen.getByTestId("hi-trash")).toBeInTheDocument();
  });

  it("calls delete mutation when clicked", () => {
    render(<DeleteButton songId="1" />);
    fireEvent.click(screen.getByRole("button"));

    expect(mockMutate).toHaveBeenCalledWith({ songId: "1" });
  });

  it("is disabled when mutation is pending", () => {
    (useDeleteSongMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });
    
    render(<DeleteButton songId="1" />);
    expect(screen.getByRole("button")).toBeDisabled();
    
    fireEvent.click(screen.getByRole("button"));
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
