import { render, screen, fireEvent } from "@testing-library/react";
import { LessonContent } from "../LessonContent";
import { lessonContentData } from "../../data/lessonContent";

// Mock MathJax components
jest.mock("better-react-mathjax", () => ({
  MathJax: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mathjax">{children}</div>
  ),
  MathJaxContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("LessonContent", () => {
  const mockOnSectionComplete = jest.fn();
  const arithmeticContent = lessonContentData.arithmetic;

  beforeEach(() => {
    mockOnSectionComplete.mockClear();
  });

  it("renders lesson content with accordion sections", () => {
    render(
      <LessonContent
        lessonContent={arithmeticContent}
        onSectionComplete={mockOnSectionComplete}
        completedSections={[]}
      />
    );

    expect(screen.getByText("Lesson Content")).toBeInTheDocument();
    expect(screen.getByText("Introduction to Arithmetic")).toBeInTheDocument();
    expect(screen.getByText("Addition and Subtraction")).toBeInTheDocument();
  });

  it("shows progress indicator", () => {
    render(
      <LessonContent
        lessonContent={arithmeticContent}
        onSectionComplete={mockOnSectionComplete}
        completedSections={["intro"]}
      />
    );

    expect(screen.getByText("1 of 4 sections completed")).toBeInTheDocument();
  });

  it("calls onSectionComplete when marking section as complete", () => {
    render(
      <LessonContent
        lessonContent={arithmeticContent}
        onSectionComplete={mockOnSectionComplete}
        completedSections={[]}
      />
    );

    // Find and click the "Mark as Complete" button for the first section
    const completeButton = screen.getByText("Mark as Complete");
    fireEvent.click(completeButton);

    expect(mockOnSectionComplete).toHaveBeenCalledWith("intro");
  });

  it("renders math expressions", () => {
    render(
      <LessonContent
        lessonContent={arithmeticContent}
        onSectionComplete={mockOnSectionComplete}
        completedSections={[]}
      />
    );

    // Check that MathJax components are rendered
    const mathElements = screen.getAllByTestId("mathjax");
    expect(mathElements.length).toBeGreaterThan(0);
  });

  it("shows completion message when all sections are done", () => {
    const allSections = arithmeticContent.sections.map((s) => s.id);

    render(
      <LessonContent
        lessonContent={arithmeticContent}
        onSectionComplete={mockOnSectionComplete}
        completedSections={allSections}
      />
    );

    expect(screen.getByText("Lesson Complete!")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You've completed all sections of this lesson. Great work!"
      )
    ).toBeInTheDocument();
  });
});
