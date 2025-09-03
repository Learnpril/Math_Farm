import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ToolDemo from "../ToolDemo";

describe("ToolDemo", () => {
  const defaultProps = {
    title: "Test Tool",
    description: "A test tool demonstration",
    demoType: "calculator" as const,
    interactive: true,
    children: <div>Test content</div>,
  };

  it("renders with basic props", () => {
    render(<ToolDemo {...defaultProps} />);

    expect(screen.getByText("Test Tool")).toBeInTheDocument();
    expect(screen.getByText("A test tool demonstration")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("shows demo only badge for non-interactive tools", () => {
    render(<ToolDemo {...defaultProps} interactive={false} />);

    expect(screen.getByText("Demo Only")).toBeInTheDocument();
  });

  it("displays error state correctly", () => {
    const errorMessage = "Failed to load library";
    render(<ToolDemo {...defaultProps} error={errorMessage} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Tool Error")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(/Try refreshing the page/)).toBeInTheDocument();
  });

  it("displays loading state correctly", () => {
    render(<ToolDemo {...defaultProps} isLoading={true} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading calculator tool...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ToolDemo {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has proper accessibility attributes for error state", () => {
    render(<ToolDemo {...defaultProps} error="Test error" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "polite");
  });

  it("has proper accessibility attributes for loading state", () => {
    render(<ToolDemo {...defaultProps} isLoading={true} />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Loading tool demonstration");
  });

  it("renders different demo types correctly", () => {
    const { rerender } = render(
      <ToolDemo {...defaultProps} demoType="graphing" isLoading={true} />
    );
    expect(screen.getByText("Loading graphing tool...")).toBeInTheDocument();

    rerender(<ToolDemo {...defaultProps} demoType="solver" isLoading={true} />);
    expect(screen.getByText("Loading solver tool...")).toBeInTheDocument();
  });
});
