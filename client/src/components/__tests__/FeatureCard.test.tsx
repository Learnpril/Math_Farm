import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Calculator } from "lucide-react";
import { FeatureCard } from "../FeatureCard";

describe("FeatureCard", () => {
  const defaultProps = {
    icon: Calculator,
    title: "Test Feature",
    description: "This is a test feature description.",
  };

  it("renders with title and description", () => {
    render(<FeatureCard {...defaultProps} />);

    expect(screen.getByText("Test Feature")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test feature description.")
    ).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(<FeatureCard {...defaultProps} />);

    // The icon should be present (Lucide icons render as SVG)
    const iconContainer = screen
      .getByRole("article")
      .querySelector(".w-12.h-12");
    expect(iconContainer).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<FeatureCard {...defaultProps} />);

    const article = screen.getByRole("article");
    expect(article).toHaveAttribute("aria-labelledby", "feature-test-feature");

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveAttribute("id", "feature-test-feature");
  });

  it("applies custom className", () => {
    render(<FeatureCard {...defaultProps} className="custom-class" />);

    const article = screen.getByRole("article");
    expect(article).toHaveClass("custom-class");
  });

  it("renders children when provided", () => {
    render(
      <FeatureCard {...defaultProps}>
        <div data-testid="child-content">Child content</div>
      </FeatureCard>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("has hover effects", () => {
    render(<FeatureCard {...defaultProps} />);

    const article = screen.getByRole("article");
    expect(article).toHaveClass("hover:shadow-lg", "hover:border-primary/20");

    const iconContainer = article.querySelector(".w-12.h-12");
    expect(iconContainer).toHaveClass("group-hover:bg-primary/20");
  });

  it("handles title with spaces correctly in ID", () => {
    render(<FeatureCard {...defaultProps} title="Multi Word Title" />);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveAttribute("id", "feature-multi-word-title");
  });

  it("has proper semantic structure", () => {
    render(<FeatureCard {...defaultProps} />);

    // Should be an article with heading and description
    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();

    // Description should be in a paragraph
    const description = screen.getByText("This is a test feature description.");
    expect(description.tagName).toBe("P");
  });
});
