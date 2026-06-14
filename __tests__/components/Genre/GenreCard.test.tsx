import * as React from "react";
import { render, screen } from "@testing-library/react";
import GenreCard from "@/components/Genre/GenreCard";

jest.mock("next/image", () => "img");

describe("components/Genre/GenreCard", () => {
  it("ジャンル名とアイコンを表示する", () => {
    render(<GenreCard genre="Retro Wave" color="any" />);
    expect(screen.getByText("Retro Wave")).toBeInTheDocument();
    expect(screen.getByText("🌆")).toBeInTheDocument();
  });

  it("正しいリンクを設定する", () => {
    render(<GenreCard genre="City Pop" color="any" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/genre/City Pop");
  });

  describe("各ジャンルのグラデーション", () => {
    it("Retro Waveのグラデーションを適用する", () => {
      const { container } = render(<GenreCard genre="Retro Wave" color="any" />);
      expect(container.innerHTML).toContain("from-[#FF0080]");
    });

    it("Electro Houseのグラデーションを適用する", () => {
      const { container } = render(<GenreCard genre="Electro House" color="any" />);
      expect(container.innerHTML).toContain("from-[#00F5A0]");
    });

    it("Nu Discoのグラデーションを適用する", () => {
      const { container } = render(<GenreCard genre="Nu Disco" color="any" />);
      expect(container.innerHTML).toContain("from-[#FFD700]");
    });

    it("City Popのグラデーションを適用する", () => {
      const { container } = render(<GenreCard genre="City Pop" color="any" />);
      expect(container.innerHTML).toContain("from-[#6366F1]");
    });

    it("Tropical Houseのグラデーションを適用する", () => {
      const { container } = render(<GenreCard genre="Tropical House" color="any" />);
      expect(container.innerHTML).toContain("from-[#00B4DB]");
    });

    it("Vapor Waveのグラデーションを適用する", () => {
      const { container } = render(<GenreCard genre="Vapor Wave" color="any" />);
      expect(container.innerHTML).toContain("from-[#FF61D2]");
    });

    it("r&bのグラデーションを適用する", () => {
      const { container } = render(<GenreCard genre="r&b" color="any" />);
      expect(container.innerHTML).toContain("from-[#6A0DAD]");
    });

    it("Chill Houseのグラデーションを適用する", () => {
      const { container } = render(<GenreCard genre="Chill House" color="any" />);
      expect(container.innerHTML).toContain("from-[#43cea2]");
    });

    it("不明なジャンルはデフォルトグラデーションを適用する", () => {
      const { container } = render(<GenreCard genre="Unknown Genre" color="any" />);
      expect(container.innerHTML).toContain("from-gray-700");
    });
  });

  describe("各ジャンルのアイコン", () => {
    it("Electro Houseのアイコン", () => {
      render(<GenreCard genre="Electro House" color="any" />);
      expect(screen.getByText("⚡")).toBeInTheDocument();
    });

    it("Nu Discoのアイコン", () => {
      render(<GenreCard genre="Nu Disco" color="any" />);
      expect(screen.getByText("💿")).toBeInTheDocument();
    });

    it("City Popのアイコン", () => {
      render(<GenreCard genre="City Pop" color="any" />);
      expect(screen.getByText("🏙️")).toBeInTheDocument();
    });

    it("Tropical Houseのアイコン", () => {
      render(<GenreCard genre="Tropical House" color="any" />);
      expect(screen.getByText("🌴")).toBeInTheDocument();
    });

    it("Vapor Waveのアイコン", () => {
      render(<GenreCard genre="Vapor Wave" color="any" />);
      expect(screen.getByText("📼")).toBeInTheDocument();
    });

    it("r&bのアイコン", () => {
      render(<GenreCard genre="r&b" color="any" />);
      expect(screen.getByText("🎤")).toBeInTheDocument();
    });

    it("Chill Houseのアイコン", () => {
      render(<GenreCard genre="Chill House" color="any" />);
      expect(screen.getByText("🎧")).toBeInTheDocument();
    });

    it("不明なジャンルのデフォルトアイコン", () => {
      render(<GenreCard genre="Unknown Genre" color="any" />);
      expect(screen.getByText("🎵")).toBeInTheDocument();
    });
  });

  it("displayNameが設定されている", () => {
    expect(GenreCard.displayName).toBe("GenreCard");
  });
});
