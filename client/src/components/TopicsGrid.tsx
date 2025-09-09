import React, { useRef } from "react";
import { TopicCard } from "./TopicCard";
import { Topic } from "../../../shared/types";
import topicsData from "../data/topicsData.json";
import { useRovingTabIndex } from "./accessibility/FocusManager";

interface TopicsGridProps {
  onTopicClick: (topicId: string) => void;
  className?: string;
}

export const TopicsGrid: React.FC<TopicsGridProps> = ({
  onTopicClick,
  className = "",
}) => {
  const topics = topicsData as Topic[];
  const gridRef = useRef<HTMLDivElement>(null);

  // Set up roving tabindex for grid navigation
  const { focusItem } = useRovingTabIndex(
    gridRef,
    '[role="button"], button, a'
  );

  return (
    <div
      ref={gridRef}
      className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      role="grid"
      aria-label="Mathematics topics"
    >
      {topics.map((topic, index) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          onClick={onTopicClick}
          tabIndex={index === 0 ? 0 : -1}
          role="gridcell"
          aria-posinset={index + 1}
          aria-setsize={topics.length}
        />
      ))}
    </div>
  );
};
