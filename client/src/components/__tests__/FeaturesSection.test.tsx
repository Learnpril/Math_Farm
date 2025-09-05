import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeaturesSection } from "../FeaturesSection";

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
Object.defineProperty(Element.prototype, "scrollIntoView", {
  value: mockScrollIntoView,
  writable: true,
});

describe("FeaturesSection", () => {
  beforeEach(() => {
    mockScrollIntoView.mockClear();
  });

  it("renders the features section with heading", () => {
    render(<FeaturesSection />);

    expect(
      screen.getByRole("heading", { name: /why choose math farm/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/discover the features that make math farm/i)
    ).toBeInTheDocument();
  });

  it("renders all feature cards", () => {
    render(<FeaturesSection />);

    // Check for key features
    expect(screen.getByText("Privacy-Focused")).toBeInTheDocument();
    expect(screen.getByText("Lightning Fast")).toBeInTheDocument();
    expect(screen.getByText("Self-Hosted")).toBeInTheDocument();
    expect(screen.getByText("Fully Accessible")).toBeInTheDocument();
    expect(screen.getByText("Comprehensive Curriculum")).toBeInTheDocument();
    expect(screen.getByText("Interactive Tools")).toBeInTheDocument();
    expect(screen.getByText("Responsive Design")).toBeInTheDocument();
    expect(screen.getByText("Open Source")).toBeInTheDocument();
    expect(screen.getByText("Gamified Learning")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<FeaturesSection />);

    const section = screen.getByRole("region");
    expect(section).toHaveAttribute("aria-labelledby", "features-heading");

    const heading = screen.getByRole("heading", {
      name: /why choose math farm/i,
    });
    expect(heading).toHaveAttribute("id", "features-heading");
  });

  it("renders call-to-action buttons", () => {
    render(<FeaturesSection />);

    expect(
      screen.getByRole("button", { name: /explore topics/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try practice problems/i })
    ).toBeInTheDocument();
  });

  it("handles navigation to topics section", () => {
    // Mock getElementById
    const mockElement = { scrollIntoView: mockScrollIntoView };
    vi.spyOn(document, "getElementById").mockReturnValue(mockElement as any);

    render(<FeaturesSection />);

    const exploreButton = screen.getByRole("button", {
      name: /explore topics/i,
    });
    fireEvent.click(exploreButton);

    expect(document.getElementById).toHaveBeenCalledWith("topics");
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("handles navigation to practice section", () => {
    // Mock getElementById
    const mockElement = { scrollIntoView: mockScrollIntoView };
    vi.spyOn(document, "getElementById").mockReturnValue(mockElement as any);

    render(<FeaturesSection />);

    const practiceButton = screen.getByRole("button", {
      name: /try practice problems/i,
    });
    fireEvent.click(practiceButton);

    expect(document.getElementById).toHaveBeenCalledWith("practice");
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("applies custom className", () => {
    render(<FeaturesSection className="custom-class" />);

    const section = screen.getByRole("region");
    expect(section).toHaveClass("custom-class");
  });

  it("has proper grid layout for feature cards", () => {
    render(<FeaturesSection />);

    const grid = screen.getByRole("region").querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3");
  });
});
