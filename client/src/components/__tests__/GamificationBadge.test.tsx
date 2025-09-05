import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GamificationBadge, BadgeGrid } from "../GamificationBadge";
import { Badge } from "../../../shared/types";

const mockBadge: Badge = {
  id: "first-visit",
  name: "Welcome Explorer",
  description: "Visited Math Farm for the first time",
  icon: "star",
  category: "exploration",
  earnedAt: new Date("2024-01-01"),
};

describe("GamificationBadge", () => {
  it("renders badge with correct information", () => {
    render(<GamificationBadge badge={mockBadge} />);

    expect(screen.getByText("Welcome Explorer")).toBeInTheDocument();
    expect(screen.getByText("1/1/2024")).toBeInTheDocument();
  });

  it("shows description when showDescription is true", () => {
    render(<GamificationBadge badge={mockBadge} showDescription={true} />);

    expect(
      screen.getByText("Visited Math Farm for the first time")
    ).toBeInTheDocument();
  });

  it("hides description when showDescription is false", () => {
    render(<GamificationBadge badge={mockBadge} showDescription={false} />);

    expect(
      screen.queryByText("Visited Math Farm for the first time")
    ).not.toBeInTheDocument();
  });

  it("applies correct size classes", () => {
    const { container } = render(
      <GamificationBadge badge={mockBadge} size="lg" />
    );

    expect(container.querySelector(".w-20")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<GamificationBadge badge={mockBadge} />);

    const badgeElement = screen.getByRole("img");
    expect(badgeElement).toHaveAttribute(
      "aria-label",
      "Welcome Explorer badge: Visited Math Farm for the first time"
    );
    expect(badgeElement).toHaveAttribute(
      "title",
      "Visited Math Farm for the first time"
    );
  });

  it("applies category-specific styling", () => {
    const { container } = render(<GamificationBadge badge={mockBadge} />);

    // Should have exploration category styling (blue colors)
    expect(container.querySelector(".bg-blue-100")).toBeInTheDocument();
  });
});

describe("BadgeGrid", () => {
  const mockBadges: Badge[] = [
    mockBadge,
    {
      id: "topic-explorer",
      name: "Topic Explorer",
      description: "Explored 3 different topics",
      icon: "compass",
      category: "exploration",
      earnedAt: new Date("2024-01-02"),
    },
    {
      id: "practice-starter",
      name: "Practice Starter",
      description: "Completed first practice problem",
      icon: "target",
      category: "practice",
      earnedAt: new Date("2024-01-03"),
    },
  ];

  it("renders all badges when under maxDisplay limit", () => {
    render(<BadgeGrid badges={mockBadges} maxDisplay={5} />);

    expect(screen.getByText("Welcome Explorer")).toBeInTheDocument();
    expect(screen.getByText("Topic Explorer")).toBeInTheDocument();
    expect(screen.getByText("Practice Starter")).toBeInTheDocument();
  });

  it("limits display and shows remaining count", () => {
    render(<BadgeGrid badges={mockBadges} maxDisplay={2} />);

    expect(screen.getByText("Welcome Explorer")).toBeInTheDocument();
    expect(screen.getByText("Topic Explorer")).toBeInTheDocument();
    expect(screen.queryByText("Practice Starter")).not.toBeInTheDocument();
    expect(screen.getByText("+1 more badge")).toBeInTheDocument();
  });

  it("shows empty state when no badges", () => {
    render(<BadgeGrid badges={[]} />);

    expect(screen.getByText("No badges earned yet")).toBeInTheDocument();
    expect(
      screen.getByText("Start exploring to earn your first badge!")
    ).toBeInTheDocument();
  });

  it("uses correct grid layout classes", () => {
    const { container } = render(<BadgeGrid badges={mockBadges} />);

    expect(container.querySelector(".grid-cols-3")).toBeInTheDocument();
    expect(container.querySelector(".sm\\:grid-cols-4")).toBeInTheDocument();
    expect(container.querySelector(".md\\:grid-cols-6")).toBeInTheDocument();
  });

  it("handles singular vs plural remaining count", () => {
    const manyBadges = Array(8)
      .fill(mockBadge)
      .map((badge, index) => ({
        ...badge,
        id: `badge-${index}`,
      }));

    render(<BadgeGrid badges={manyBadges} maxDisplay={6} />);

    expect(screen.getByText("+2 more badges")).toBeInTheDocument();
  });
});
