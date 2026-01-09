import { checkIsAdmin } from "@/actions/checkAdmin";
import { isCurrentUserAdmin } from "@/libs/admin";

// Mock the libs/admin module
jest.mock("@/libs/admin", () => ({
  isCurrentUserAdmin: jest.fn(),
}));

describe("actions/checkAdmin", () => {
  it("should return true if current user is admin", async () => {
    (isCurrentUserAdmin as jest.Mock).mockResolvedValue(true);

    const result = await checkIsAdmin();
    expect(result).toEqual({ isAdmin: true });
    expect(isCurrentUserAdmin).toHaveBeenCalled();
  });

  it("should return false if current user is not admin", async () => {
    (isCurrentUserAdmin as jest.Mock).mockResolvedValue(false);

    const result = await checkIsAdmin();
    expect(result).toEqual({ isAdmin: false });
    expect(isCurrentUserAdmin).toHaveBeenCalled();
  });
});
