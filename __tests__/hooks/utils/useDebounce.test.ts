import { renderHook, act } from "@testing-library/react";
import useDebounce from "@/hooks/utils/useDebounce";

describe("hooks/utils/useDebounce", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("should debounce value updates", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    // Update value
    rerender({ value: "updated", delay: 500 });

    // Should still be initial value immediately after update
    expect(result.current).toBe("initial");

    // Fast-forward time by 200ms
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    // Fast-forward time by another 300ms (total 500ms)
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("updated");
  });

  it("should use default delay if not provided", () => {
    // Default is 500ms in implementation
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });
});
