import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge Component", () => {
  it("renders with default variant", () => {
    render(<Badge>Default Badge</Badge>);
    expect(screen.getByText("Default Badge")).toBeInTheDocument();
  });

  it("renders with level variants", () => {
    render(<Badge variant="elementary">Elementary</Badge>);
    expect(screen.getByText("Elementary")).toBeInTheDocument();
  });

  it("renders with difficulty variants", () => {
    render(<Badge variant="difficulty3">Difficulty 3</Badge>);
    expect(screen.getByText("Difficulty 3")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge).toHaveClass("custom-class");
  });
});
