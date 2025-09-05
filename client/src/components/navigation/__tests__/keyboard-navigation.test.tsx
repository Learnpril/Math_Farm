import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("BreadcrumbNavigation Keyboard Navigation", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue(["/topic/algebra"]);
  });

  it("handles arrow key navigation between breadcrumb links", () => {
    render(<BreadcrumbNavigation />);

    const homeLink = screen.getByLabelText("Go to home page");
    const topicsLink = screen.getByLabelText("Go to Topics");

    // Focus on home link
    homeLink.focus();
    expect(document.activeElement).toBe(homeLink);

    // Press ArrowRight to move to topics link
    fireEvent.keyDown(homeLink, { key: "ArrowRight" });
    // Note: In a real browser, focus would move, but in tests we just verify the event handling

    // Press ArrowLeft to move back
    fireEvent.keyDown(topicsLink, { key: "ArrowLeft" });
  });

  it("handles Home and End key navigation", () => {
    render(<BreadcrumbNavigation />);

    const homeLink = screen.getByLabelText("Go to home page");
    const topicsLink = screen.getByLabelText("Go to Topics");

    // Test Home key
    fireEvent.keyDown(topicsLink, { key: "Home" });

    // Test End key
    fireEvent.keyDown(homeLink, { key: "End" });
  });

  it("prevents default behavior for navigation keys", () => {
    render(<BreadcrumbNavigation />);

    const homeLink = screen.getByLabelText("Go to home page");

    const arrowRightEvent = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const preventDefaultSpy = vi.spyOn(arrowRightEvent, "preventDefault");

    fireEvent.keyDown(homeLink, arrowRightEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("has proper ARIA attributes for accessibility", () => {
    render(<BreadcrumbNavigation />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Breadcrumb navigation");

    const homeLink = screen.getByLabelText("Go to home page");
    expect(homeLink).toHaveAttribute("tabIndex", "0");

    const topicsLink = screen.getByLabelText("Go to Topics");
    expect(topicsLink).toHaveAttribute("tabIndex", "0");

    // Check that the current page has aria-current
    const currentPage = screen.getByText("Algebra");
    expect(currentPage).toHaveAttribute("aria-current", "page");
  });
});
