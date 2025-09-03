import React from 'react';
import { TopicCard } from './TopicCard';
import { Topic } from '../../../shared/types';
import topicsData from '../data/topicsData.json';

interface TopicsGridProps {
  onTopicClick: (topicId: string) => void;
  className?: string;
}

export const TopicsGrid: React.FC<TopicsGridProps> = ({ onTopicClick, className = '' }) => {
  const topics = topicsData as Topic[];

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          onClick={onTopicClick}
        />
      ))}
    </div>
  );
};