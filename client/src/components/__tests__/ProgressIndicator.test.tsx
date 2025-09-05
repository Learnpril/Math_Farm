import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProgressIndicator, CompactProgress } from "../ProgressIndicator";
import { ProgressData } from "../../../shared/types";

// Mock the progressUtils module
vi.mock("../../lib/progressUtils", () => ({
  calculateCompletionStats: vi.fn(() => ({
    sectionsVisited: 40,
    topicsExplored: 33.33,
    toolsUsed: 66.67,
    badgesEarned: 16.67,
    overall: 39.17,
  })),
}));

const mockProgress: ProgressData = {
  sectionsVisited: ["hero", "topics"],
  topicsExplored: ["algebra", "geometry", "calculus"],
  toolsUsed: ["calculator", "graphing"],
  practiceCompleted: 5,
  streak: 3,
  badges: [
    {
      id: "first-visit",
      name: "Welcome Explorer",
      description: "Visited Math Farm for the first time",
      icon: "star",
      category: "exploration",
      earnedAt: new Date("2024-01-01"),
    },
  ],
  lastVisit: new Date("2024-01-01"),
};

describe("ProgressIndicator", () => {
  it("renders progress indicator with correct information", () => {
    render(<ProgressIndicator progress={mockProgress} />);

    expect(screen.getByText("Learning Progress")).toBeInTheDocument();
    expect(screen.getByText("39% Complete")).toBeInTheDocument();
  });

  it("displays overall progress percentage in circle", () => {
    render(<ProgressIndicator progress={mockProgress} />);

    // Should show the overall percentage in the center of the circle
    expect(screen.getByText("39%")).toBeInTheDocument();
  });

  it("shows detailed progress bars when showDetails is true", () => {
    render(<ProgressIndicator progress={mockProgress} showDetails={true} />);

    expect(screen.getByText("Sections Visited")).toBeInTheDocument();
    expect(screen.getByText("Topics Explored")).toBeInTheDocument();
    expect(screen.getByText("Tools Used")).toBeInTheDocument();
    expect(screen.getByText("Badges Earned")).toBeInTheDocument();
  });

  it("hides detailed progress bars when showDetails is false", () => {
    render(<ProgressIndicator progress={mockProgress} showDetails={false} />);

    expect(screen.queryByText("Sections Visited")).not.toBeInTheDocument();
    expect(screen.queryByText("Topics Explored")).not.toBeInTheDocument();
    expect(screen.queryByText("Tools Used")).not.toBeInTheDocument();
    expect(screen.queryByText("Badges Earned")).not.toBeInTheDocument();
  });

  it("displays streak and badge count in summary", () => {
    render(<ProgressIndicator progress={mockProgress} />);

    expect(screen.getByText("3")).toBeInTheDocument(); // Streak
    expect(screen.getByText("Day Streak")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Badge count
    expect(screen.getByText("Badges Earned")).toBeInTheDocument();
  });

  it("has proper accessibility attributes for progress bars", () => {
    render(<ProgressIndicator progress={mockProgress} showDetails={true} />);

    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBeGreaterThan(0);

    progressBars.forEach((bar) => {
      expect(bar).toHaveAttribute("aria-valuenow");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
      expect(bar).toHaveAttribute("aria-label");
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <ProgressIndicator progress={mockProgress} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("CompactProgress", () => {
  it("renders compact progress indicator", () => {
    render(<CompactProgress progress={mockProgress} />);

    expect(screen.getByText("39%")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
  });

  it("displays streak and badge count in compact format", () => {
    render(<CompactProgress progress={mockProgress} />);

    expect(screen.getByText("3 day streak")).toBeInTheDocument();
    expect(screen.getByText("1 badges")).toBeInTheDocument();
  });

  it("uses smaller circle for compact display", () => {
    const { container } = render(<CompactProgress progress={mockProgress} />);

    expect(container.querySelector(".w-12")).toBeInTheDocument();
    expect(container.querySelector(".h-12")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <CompactProgress progress={mockProgress} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles zero values gracefully", () => {
    const emptyProgress: ProgressData = {
      ...mockProgress,
      streak: 0,
      badges: [],
    };

    render(<CompactProgress progress={emptyProgress} />);

    expect(screen.getByText("0 day streak")).toBeInTheDocument();
    expect(screen.getByText("0 badges")).toBeInTheDocument();
  });
});
