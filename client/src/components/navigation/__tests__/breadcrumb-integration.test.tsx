import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Router } from "wouter";
import { Layout } from "../../layout/Layout";

// Mock wouter location hook
const mockUseLocation = vi.fn();
vi.mock("wouter", async () => {
  const actual = await vi.importActual("wouter");
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

describe("Breadcrumb Integration", () => {
  it("shows breadcrumbs in Layout component for topic pages", () => {
    mockUseLocation.mockReturnValue(["/topic/algebra"]);

    render(
      <Router>
        <Layout>
          <div>Topic content</div>
        </Layout>
      </Router>
    );

    // Should show breadcrumb navigation
    expect(
      screen.getByRole("navigation", { name: "breadcrumb" })
    ).toBeInTheDocument();
    // Check breadcrumb navigation specifically
    const breadcrumbNav = screen.getByRole("navigation", {
      name: "breadcrumb",
    });
    expect(breadcrumbNav).toContainElement(screen.getAllByText("Topics")[1]); // Second "Topics" is in breadcrumb
    expect(screen.getByText("Algebra")).toBeInTheDocument();
  });

  it("hides breadcrumbs on home page", () => {
    mockUseLocation.mockReturnValue(["/"]);

    render(
      <Router>
        <Layout>
          <div>Home content</div>
        </Layout>
      </Router>
    );

    // Should not show breadcrumb navigation on home page
    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument();
  });

  it("shows breadcrumbs for tools page", () => {
    mockUseLocation.mockReturnValue(["/tools"]);

    render(
      <Router>
        <Layout>
          <div>Tools content</div>
        </Layout>
      </Router>
    );

    expect(
      screen.getByRole("navigation", { name: "breadcrumb" })
    ).toBeInTheDocument();
    // Check breadcrumb navigation specifically
    const breadcrumbNav = screen.getByRole("navigation", {
      name: "breadcrumb",
    });
    expect(breadcrumbNav).toContainElement(screen.getAllByText("Tools")[1]); // Second "Tools" is in breadcrumb
  });

  it("shows breadcrumbs for guide pages", () => {
    mockUseLocation.mockReturnValue(["/latex-guide"]);

    render(
      <Router>
        <Layout>
          <div>LaTeX guide content</div>
        </Layout>
      </Router>
    );

    expect(
      screen.getByRole("navigation", { name: "breadcrumb" })
    ).toBeInTheDocument();
    // Check breadcrumb navigation specifically
    const breadcrumbNav = screen.getByRole("navigation", {
      name: "breadcrumb",
    });
    expect(breadcrumbNav).toContainElement(
      screen.getAllByText("LaTeX Guide")[1]
    ); // Second "LaTeX Guide" is in breadcrumb
  });

  it("supports keyboard navigation with proper focus management", () => {
    mockUseLocation.mockReturnValue(["/topic/calculus"]);

    render(
      <Router>
        <Layout>
          <div>Calculus content</div>
        </Layout>
      </Router>
    );

    const homeLink = screen.getByLabelText("Go to home page");
    const topicsLink = screen.getAllByText("Topics")[1].closest("a"); // Get breadcrumb Topics link

    // Check that links have proper keyboard navigation classes
    expect(homeLink).toHaveClass("focus-visible:ring-2");
    expect(topicsLink).toHaveClass("focus-visible:ring-2");
  });
});
