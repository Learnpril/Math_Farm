import { render, screen, fireEvent } from "@testing-library/react";
import { BadgeSystem } from "../BadgeSystem";

// Mock the useProgressTracker hook
const mockUserProgress = {
  completedTopics: [],
  topicProgress: {},
  totalTimeSpent: 0,
  streak: 0,
  lastVisitDate: new Date().toDateString(),
  badges: [],
};

describe("BadgeSystem", () => {
  it("should render badge system without errors", () => {
    render(
      <BadgeSystem
        userProgress={mockUserProgress}
        topicId="algebra"
        onBadgeEarned={() => {}}
      />
    );

    expect(screen.getByText("Badges (0)")).toBeInTheDocument();
  });

  it("should show progress towards badges", () => {
    render(
      <BadgeSystem
        userProgress={mockUserProgress}
        topicId="algebra"
        onBadgeEarned={() => {}}
      />
    );

    expect(screen.getByText("Progress Towards Badges")).toBeInTheDocument();
  });

  it("should display empty state when no badges earned", () => {
    render(
      <BadgeSystem
        userProgress={mockUserProgress}
        topicId="algebra"
        onBadgeEarned={() => {}}
      />
    );

    expect(
      screen.getByText("Start learning to earn your first badge!")
    ).toBeInTheDocument();
  });
});
