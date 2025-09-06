import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PracticeProblems } from "../PracticeProblems";

// Mock MathJax component
vi.mock("../MathExpression", () => ({
  MathExpression: ({ expression }: { expression: string }) => (
    <div data-testid="math-expression">{expression}</div>
  ),
}));

describe("PracticeProblems", () => {
  const mockOnProblemComplete = vi.fn();
  const defaultProps = {
    topicId: "arithmetic",
    onProblemComplete: mockOnProblemComplete,
    completedProblems: [],
  };

  it("renders practice problems for a topic", () => {
    render(<PracticeProblems {...defaultProps} />);

    expect(screen.getByText("Practice Problems")).toBeInTheDocument();
    expect(
      screen.getByText("Test your understanding with interactive problems")
    ).toBeInTheDocument();
  });

  it("shows coming soon message for topics without problems", () => {
    render(<PracticeProblems {...defaultProps} topicId="nonexistent-topic" />);

    expect(
      screen.getByText("Practice Problems Coming Soon")
    ).toBeInTheDocument();
  });

  it("displays progress correctly", () => {
    render(
      <PracticeProblems {...defaultProps} completedProblems={["arith-1"]} />
    );

    expect(screen.getByText(/Progress: 1\/5/)).toBeInTheDocument();
  });

  it("handles multiple choice questions", () => {
    render(<PracticeProblems {...defaultProps} />);

    // Find the first multiple choice question
    const firstQuestion = screen.getByText("What is 3/4 + 1/2?");
    expect(firstQuestion).toBeInTheDocument();

    // Check that options are rendered
    expect(screen.getByText("5/4")).toBeInTheDocument();
    expect(screen.getByText("5/6")).toBeInTheDocument();
  });

  it("handles numeric input questions", () => {
    render(<PracticeProblems {...defaultProps} />);

    // Find numeric input questions
    const numericInputs = screen.getAllByPlaceholderText(
      /Enter your numerical answer/
    );
    expect(numericInputs.length).toBeGreaterThan(0);
  });

  it("shows completion message when all problems are solved", () => {
    const allCompleted = [
      "arith-1",
      "arith-2",
      "arith-3",
      "arith-4",
      "arith-5",
    ];
    render(
      <PracticeProblems {...defaultProps} completedProblems={allCompleted} />
    );

    expect(screen.getByText("Congratulations! 🎉")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You've completed all practice problems for this topic. Great job!"
      )
    ).toBeInTheDocument();
  });
});
