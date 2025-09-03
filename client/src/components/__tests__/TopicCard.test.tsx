import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopicCard } from "../TopicCard";
import { Topic } from "../../../shared/types";

// Mock the MathExpression component
vi.mock("../MathExpression", () => ({
  MathExpression: ({
    expression,
    fallback,
  }: {
    expression: string;
    fallback?: string;
  }) => <div data-testid="math-expression">{fallback || expression}</div>,
}));

const mockTopic: Topic = {
  id: "algebra",
  title: "Algebra",
  description: "Explore variables, equations, and algebraic expressions",
  level: "middle",
  icon: "Variable",
  mathExpression: "x^2 + 5x - 6 = (x + 6)(x - 1)",
  prerequisites: ["arithmetic"],
  estimatedTime: 60,
  difficulty: 2,
};

const mockOnClick = vi.fn();

describe("TopicCard", () => {
  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("renders topic information correctly", () => {
    render(<TopicCard topic={mockTopic} onClick={mockOnClick} />);

    expect(screen.getByText("Algebra")).toBeInTheDocument();
    expect(screen.getByText("Middle School")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Explore variables, equations, and algebraic expressions"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("2/5")).toBeInTheDocument();
    expect(screen.getByText("60 min")).toBeInTheDocument();
    expect(screen.getByText("1 prereq")).toBeInTheDocument();
  });

  it("renders math expression", () => {
    render(<TopicCard topic={mockTopic} onClick={mockOnClick} />);

    const mathExpression = screen.getByTestId("math-expression");
    expect(mathExpression).toBeInTheDocument();
    expect(mathExpression).toHaveTextContent("x^2 + 5x - 6 = (x + 6)(x - 1)");
  });

  it("handles click events", () => {
    render(<TopicCard topic={mockTopic} onClick={mockOnClick} />);

    const card = screen.getByRole("button");
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith("algebra");
  });

  it("handles keyboard navigation", () => {
    render(<TopicCard topic={mockTopic} onClick={mockOnClick} />);

    const card = screen.getByRole("button");

    // Test Enter key
    fireEvent.keyDown(card, { key: "Enter" });
    expect(mockOnClick).toHaveBeenCalledWith("algebra");

    mockOnClick.mockClear();

    // Test Space key
    fireEvent.keyDown(card, { key: " " });
    expect(mockOnClick).toHaveBeenCalledWith("algebra");
  });

  it("has proper accessibility attributes", () => {
    render(<TopicCard topic={mockTopic} onClick={mockOnClick} />);

    const card = screen.getByRole("button");
    expect(card).toHaveAttribute("tabIndex", "0");
    expect(card).toHaveAttribute(
      "aria-label",
      "Explore Algebra - Explore variables, equations, and algebraic expressions"
    );

    const difficultyBadge = screen.getByText("2/5");
    expect(difficultyBadge).toHaveAttribute(
      "aria-label",
      "Difficulty level 2 out of 5"
    );
  });

  it("displays correct difficulty colors", () => {
    const easyTopic = { ...mockTopic, difficulty: 1 as const };
    const { rerender } = render(
      <TopicCard topic={easyTopic} onClick={mockOnClick} />
    );

    let difficultyBadge = screen.getByText("1/5");
    expect(difficultyBadge).toHaveClass("bg-green-100", "text-green-800");

    const hardTopic = { ...mockTopic, difficulty: 5 as const };
    rerender(<TopicCard topic={hardTopic} onClick={mockOnClick} />);

    difficultyBadge = screen.getByText("5/5");
    expect(difficultyBadge).toHaveClass("bg-red-100", "text-red-800");
  });

  it("handles topics with no prerequisites", () => {
    const topicWithoutPrereqs = { ...mockTopic, prerequisites: [] };
    render(<TopicCard topic={topicWithoutPrereqs} onClick={mockOnClick} />);

    expect(screen.queryByText(/prereq/)).not.toBeInTheDocument();
  });

  it("handles topics with multiple prerequisites", () => {
    const topicWithMultiplePrereqs = {
      ...mockTopic,
      prerequisites: ["arithmetic", "geometry", "algebra"],
    };
    render(
      <TopicCard topic={topicWithMultiplePrereqs} onClick={mockOnClick} />
    );

    expect(screen.getByText("3 prereqs")).toBeInTheDocument();
  });

  it("displays correct level labels", () => {
    const levels: Array<{ level: Topic["level"]; label: string }> = [
      { level: "elementary", label: "Elementary" },
      { level: "middle", label: "Middle School" },
      { level: "high", label: "High School" },
      { level: "advanced", label: "Advanced" },
      { level: "specialized", label: "Specialized" },
    ];

    levels.forEach(({ level, label }) => {
      const topic = { ...mockTopic, level };
      const { rerender } = render(
        <TopicCard topic={topic} onClick={mockOnClick} />
      );

      expect(screen.getByText(label)).toBeInTheDocument();

      if (level !== levels[levels.length - 1].level) {
        rerender(<div />); // Clear for next iteration
      }
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <TopicCard
        topic={mockTopic}
        onClick={mockOnClick}
        className="custom-class"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("custom-class");
  });
});
