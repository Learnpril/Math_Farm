import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BreadcrumbNavigation } from "../BreadcrumbNavigation";

// Mock wouter
const mockUseLocation = vi.fn();
vi.mock("wouter", () => ({
  useLocation: () => mockUseLocation(),
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("BreadcrumbNavigation", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue(["/topic/algebra"]);
  });

  it("renders breadcrumbs for topic pages", () => {
    render(<BreadcrumbNavigation />);

    // Should show Home > Topics > Algebra
    expect(screen.getByLabelText("Go to home page")).toBeInTheDocument();
    expect(screen.getByText("Topics")).toBeInTheDocument();
    expect(screen.getByText("Algebra")).toBeInTheDocument();
  });

  it("supports custom breadcrumb items", () => {
    const customItems = [
      { label: "Custom", href: "/custom" },
      { label: "Page", isActive: true },
    ];

    render(<BreadcrumbNavigation items={customItems} />);

    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByText("Page")).toBeInTheDocument();
  });

  it("includes proper ARIA attributes for accessibility", () => {
    render(<BreadcrumbNavigation />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "breadcrumb");
  });

  it("has keyboard navigation support with focus indicators", () => {
    render(<BreadcrumbNavigation />);

    const homeLink = screen.getByLabelText("Go to home page");
    expect(homeLink).toHaveClass("focus-visible:ring-2");

    const topicsLink = screen.getByText("Topics").closest("a");
    expect(topicsLink).toHaveClass("focus-visible:ring-2");
  });

  it("supports keyboard navigation between breadcrumb links", () => {
    const { container } = render(<BreadcrumbNavigation />);

    const breadcrumbContainer = container.querySelector('[role="navigation"]');
    expect(breadcrumbContainer).toBeInTheDocument();
    expect(breadcrumbContainer).toHaveAttribute(
      "aria-label",
      "Breadcrumb navigation"
    );

    // Check that links have proper tabIndex
    const links = container.querySelectorAll("a[href]");
    links.forEach((link) => {
      expect(link).toHaveAttribute("tabIndex", "0");
    });
  });

  it("does not render on home page", () => {
    mockUseLocation.mockReturnValue(["/"]);

    const { container } = render(<BreadcrumbNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it("handles tools page breadcrumbs correctly", () => {
    mockUseLocation.mockReturnValue(["/tools"]);

    render(<BreadcrumbNavigation />);

    expect(screen.getByLabelText("Go to home page")).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();
  });

  it("handles guide page breadcrumbs correctly", () => {
    mockUseLocation.mockReturnValue(["/latex-guide"]);

    render(<BreadcrumbNavigation />);

    expect(screen.getByLabelText("Go to home page")).toBeInTheDocument();
    expect(screen.getByText("LaTeX Guide")).toBeInTheDocument();
  });
});
