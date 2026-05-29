import { requireAdminPermission } from "@/libs/auth/requireAdmin";
import { checkIsAdmin } from "@/actions/checkAdmin";

// Mock checkIsAdmin action
jest.mock("@/actions/checkAdmin", () => ({
  checkIsAdmin: jest.fn(),
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

import toast from "react-hot-toast";

describe("libs/requireAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("管理者の場合にエラーをスローしない", async () => {
    (checkIsAdmin as jest.Mock).mockResolvedValue({ isAdmin: true });

    await expect(requireAdminPermission()).resolves.not.toThrow();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("管理者でない場合にエラーをスローする", async () => {
    (checkIsAdmin as jest.Mock).mockResolvedValue({ isAdmin: false });

    await expect(requireAdminPermission()).rejects.toThrow(
      "管理者権限が必要です"
    );
    expect(toast.error).toHaveBeenCalledWith("管理者権限が必要です");
  });

  it("checkIsAdmin がエラーを投げた場合に伝播する", async () => {
    const error = new Error("Network error");
    (checkIsAdmin as jest.Mock).mockRejectedValue(error);

    await expect(requireAdminPermission()).rejects.toThrow("Network error");
  });
});
