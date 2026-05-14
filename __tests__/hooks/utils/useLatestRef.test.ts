import { renderHook } from "@testing-library/react";
import useLatestRef from "@/hooks/utils/useLatestRef";

describe("hooks/utils/useLatestRef", () => {
  it("初期値でRefが作成される", () => {
    const { result } = renderHook(() => useLatestRef("initial"));
    expect(result.current.current).toBe("initial");
  });

  it("値が更新されるとRefも更新される", () => {
    const { result, rerender } = renderHook(
      (value: string) => useLatestRef(value),
      { initialProps: "first" }
    );
    expect(result.current.current).toBe("first");

    rerender("second");
    expect(result.current.current).toBe("second");
  });

  it("数値でも正しく動作する", () => {
    const { result, rerender } = renderHook(
      (value: number) => useLatestRef(value),
      { initialProps: 0 }
    );
    expect(result.current.current).toBe(0);

    rerender(42);
    expect(result.current.current).toBe(42);
  });

  it("オブジェクトでも正しく動作する", () => {
    const obj1 = { key: "value1" };
    const obj2 = { key: "value2" };

    const { result, rerender } = renderHook(
      (value: object) => useLatestRef(value),
      { initialProps: obj1 }
    );
    expect(result.current.current).toBe(obj1);

    rerender(obj2);
    expect(result.current.current).toBe(obj2);
  });

  it("nullでも正しく動作する", () => {
    const { result } = renderHook(() => useLatestRef(null));
    expect(result.current.current).toBeNull();
  });
});
