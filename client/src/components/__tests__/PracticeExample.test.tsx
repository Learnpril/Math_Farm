import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PracticeExample } from "../PracticeExample";

const mockQuestion = {
  id: "algebra-1",
  question: "Solve for x: 2x + 4 = 10",
  expression: "2x + 4 = 10",
  steps: [
    {
      id: "step-1",
      description: "Subtract 4 from both sides",
      expression: "2x + 4 - 4 = 10 - 4",
      explanation: "We subtract 4 from both sides to isolate the term with x.",
    },
    {
      id: "step-2",
      description: "Simplify",
      expression: "2x = 6",
      explanation: "After subtracting, we get 2x = 6.",
    },
    {
      id: "step-3",
      description: "Divide both sides by 2",
      expression: "x = 3",
      explanation: "Dividing both sides by 2 gives us the final answer.",
    },
  ],
  correctAnswer: "3",
  hints: [
    "Start by isolating the term with x",
    "What operation undoes addition?",
    "Remember to do the same operation to both sides",
  ],
  difficulty: 2 as const,
  topic: "Algebra",
};

// Mock MathExpression component
vi.mock("../MathExpression", () => ({
  MathExpression: ({ expression }: { expression: string }) => (
    <div data-testid="math-expression">{expression}</div>
  ),
}));

describe("PracticeExample", () => {
  it("renders question and input field", () => {
    render(<PracticeExample question={mockQuestion} />);

    expect(screen.getByText("Solve for x: 2x + 4 = 10")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your answer...")
    ).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("displays question metadata correctly", () => {
    render(<PracticeExample question={mockQuestion} />);

    expect(screen.getByText("Algebra")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Practice Problem")).toBeInTheDocument();
  });

  it("shows math expression when provided", () => {
    render(<PracticeExample question={mockQuestion} />);

    expect(screen.getByTestId("math-expression")).toHaveTextContent(
      "2x + 4 = 10"
    );
  });

  it("handles correct answer submission", async () => {
    const onComplete = vi.fn();
    render(<PracticeExample question={mockQuestion} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText("Enter your answer...");
    const submitButton = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Correct!")).toBeInTheDocument();
      expect(screen.getByText("Perfect on first try!")).toBeInTheDocument();
    });

    expect(onComplete).toHaveBeenCalledWith(true, 1);
  });

  it("handles incorrect answer submission", async () => {
    render(<PracticeExample question={mockQuestion} />);

    const input = screen.getByPlaceholderText("Enter your answer...");
    const submitButton = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Not quite right.")).toBeInTheDocument();
      expect(screen.getByText("Try again!")).toBeInTheDocument();
    });
  });

  it("shows hint when hint button is clicked", async () => {
    render(<PracticeExample question={mockQuestion} />);

    // Submit wrong answer first to enable hint button
    const input = screen.getByPlaceholderText("Enter your answer...");
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Show Hint")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Show Hint"));

    await waitFor(() => {
      expect(screen.getByText("Hint 1:")).toBeInTheDocument();
      expect(
        screen.getByText("Start by isolating the term with x")
      ).toBeInTheDocument();
    });
  });

  it("shows solution after 3 incorrect attempts", async () => {
    const onComplete = vi.fn();
    render(<PracticeExample question={mockQuestion} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText("Enter your answer...");
    const submitButton = screen.getByText("Submit");

    // Submit 3 wrong answers
    for (let i = 0; i < 3; i++) {
      fireEvent.change(input, { target: { value: "5" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Not quite right.")).toBeInTheDocument();
      });

      // Reset for next attempt (except last one)
      if (i < 2) {
        fireEvent.click(screen.getByText("Reset"));
      }
    }

    // After 3rd attempt, solution should show
    await waitFor(() => {
      expect(screen.getByText("Step-by-Step Solution")).toBeInTheDocument();
      expect(
        screen.getByText("Subtract 4 from both sides")
      ).toBeInTheDocument();
    });

    expect(onComplete).toHaveBeenCalledWith(false, 3);
  });

  it("allows navigation through solution steps", async () => {
    render(<PracticeExample question={mockQuestion} />);

    // Force show solution
    const input = screen.getByPlaceholderText("Enter your answer...");
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      fireEvent.click(screen.getByText("Show Solution"));
    });

    await waitFor(() => {
      expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Subtract 4 from both sides")
      ).toBeInTheDocument();
    });

    // Click next step
    fireEvent.click(screen.getByText("Next Step"));

    await waitFor(() => {
      expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
      expect(screen.getByText("Simplify")).toBeInTheDocument();
    });
  });

  it("shows final answer at last step", async () => {
    render(<PracticeExample question={mockQuestion} />);

    // Force show solution and navigate to last step
    const input = screen.getByPlaceholderText("Enter your answer...");
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      fireEvent.click(screen.getByText("Show Solution"));
    });

    // Navigate through all steps
    for (let i = 0; i < 2; i++) {
      await waitFor(() => {
        fireEvent.click(screen.getByText("Next Step"));
      });
    }

    await waitFor(() => {
      expect(screen.getByText("Final Answer: 3")).toBeInTheDocument();
    });
  });

  it("resets state when reset button is clicked", async () => {
    render(<PracticeExample question={mockQuestion} />);

    const input = screen.getByPlaceholderText("Enter your answer...");
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Not quite right.")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Reset"));

    await waitFor(() => {
      expect(screen.queryByText("Not quite right.")).not.toBeInTheDocument();
      expect(input).toHaveValue("");
    });
  });

  it("handles keyboard submission with Enter key", async () => {
    const onComplete = vi.fn();
    render(<PracticeExample question={mockQuestion} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText("Enter your answer...");

    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Correct!")).toBeInTheDocument();
    });

    expect(onComplete).toHaveBeenCalledWith(true, 1);
  });

  it("disables input and submit after correct answer", async () => {
    render(<PracticeExample question={mockQuestion} />);

    const input = screen.getByPlaceholderText("Enter your answer...");
    const submitButton = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it("shows progress indicators for solution steps", async () => {
    render(<PracticeExample question={mockQuestion} />);

    // Force show solution
    const input = screen.getByPlaceholderText("Enter your answer...");
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      fireEvent.click(screen.getByText("Show Solution"));
    });

    await waitFor(() => {
      // Should show progress dots
      const progressDots = screen
        .getByText("Step 1 of 3")
        .closest("div")
        ?.querySelectorAll(".w-2.h-2");
      expect(progressDots).toHaveLength(3);
    });
  });
});
