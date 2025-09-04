import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ServiceHours } from "../ServiceHours";

// Mock the current date/time for consistent testing
const mockDate = new Date("2024-01-15T10:30:00"); // Monday 10:30 AM

describe("ServiceHours", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders service hours component", () => {
    render(<ServiceHours />);

    expect(screen.getByText("Service Hours")).toBeInTheDocument();
    expect(screen.getByText("Weekly Schedule")).toBeInTheDocument();
  });

  it("displays all days of the week", () => {
    render(<ServiceHours />);

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("shows correct hours for weekdays and weekends", () => {
    render(<ServiceHours />);

    // Check weekday hours (Monday-Friday)
    expect(screen.getAllByText("7:00 AM - 2:00 AM")).toHaveLength(5);

    // Check weekend hours (Saturday-Sunday)
    expect(screen.getAllByText("7:00 AM - 3:00 AM")).toHaveLength(2);
  });

  it("highlights today correctly", () => {
    render(<ServiceHours />);

    // Monday should be highlighted as today
    expect(screen.getByText("Today")).toBeInTheDocument();

    // The Monday row should have special styling
    const mondayRow = screen.getByText("Monday").closest("div");
    expect(mondayRow).toHaveClass("bg-primary/10");
  });

  it("shows current time", () => {
    render(<ServiceHours />);

    // Should show the current time (10:30 AM from our mock)
    expect(screen.getByText(/Current time:/)).toBeInTheDocument();
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it("shows currently open status during business hours", () => {
    render(<ServiceHours />);

    // At 10:30 AM on Monday, should be open (7 AM - 2 AM next day)
    expect(screen.getByText("Currently Open")).toBeInTheDocument();
  });

  it("shows currently closed status outside business hours", () => {
    // Set time to 3:00 AM on Monday (closed time)
    const closedTime = new Date("2024-01-15T03:00:00");
    vi.setSystemTime(closedTime);

    render(<ServiceHours />);

    expect(screen.getByText("Currently Closed")).toBeInTheDocument();
  });

  it("handles weekend hours correctly", () => {
    // Set time to Saturday
    const saturdayTime = new Date("2024-01-13T10:30:00"); // Saturday 10:30 AM
    vi.setSystemTime(saturdayTime);

    render(<ServiceHours />);

    // Should be open on Saturday at 10:30 AM (7 AM - 3 AM next day)
    expect(screen.getByText("Currently Open")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("shows time zone notice", () => {
    render(<ServiceHours />);

    expect(
      screen.getByText("All times shown in your local time zone")
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<ServiceHours className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has proper accessibility attributes", () => {
    render(<ServiceHours />);

    // Check for proper heading structure
    expect(
      screen.getByRole("heading", { name: /service hours/i })
    ).toBeInTheDocument();

    // Check for icons with proper accessibility
    const clockIcon = screen.getByText("Service Hours").previousElementSibling;
    expect(clockIcon).toBeInTheDocument();
  });

  it("updates status correctly for late night hours", () => {
    // Test 1:00 AM on Tuesday (should be open from Monday's extended hours)
    const lateNightTime = new Date("2024-01-16T01:00:00"); // Tuesday 1:00 AM
    vi.setSystemTime(lateNightTime);

    render(<ServiceHours />);

    // Should be open because it's within Monday's extended hours (7 AM Mon - 2 AM Tue)
    expect(screen.getByText("Currently Open")).toBeInTheDocument();
  });

  it("handles Sunday late night hours correctly", () => {
    // Test 2:00 AM on Monday (should be open from Sunday's extended hours)
    const sundayLateTime = new Date("2024-01-15T02:00:00"); // Monday 2:00 AM
    vi.setSystemTime(sundayLateTime);

    render(<ServiceHours />);

    // Should be open because it's within Sunday's extended hours (7 AM Sun - 3 AM Mon)
    expect(screen.getByText("Currently Open")).toBeInTheDocument();
  });

  it("shows correct status indicator colors", () => {
    render(<ServiceHours />);

    // During open hours, should have green indicator
    const statusText = screen.getByText("Currently Open");
    expect(statusText).toHaveClass("text-green-600");
  });

  it("shows correct status indicator for closed hours", () => {
    // Set to closed time
    const closedTime = new Date("2024-01-15T04:00:00"); // Monday 4:00 AM (closed)
    vi.setSystemTime(closedTime);

    render(<ServiceHours />);

    const statusText = screen.getByText("Currently Closed");
    expect(statusText).toHaveClass("text-red-600");
  });
});
