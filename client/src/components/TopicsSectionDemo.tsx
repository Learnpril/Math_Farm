import React from 'react';
import { TopicsSection } from './TopicsSection';

/**
 * Demo component to showcase the TopicsSection
 * This demonstrates how the TopicsSection can be used in a page
 */
export const TopicsSectionDemo: React.FC = () => {
  const handleTopicClick = (topicId: string) => {
    console.log('Navigate to topic:', topicId);
    alert(`Topic "${topicId}" clicked! Navigation will be implemented in future tasks.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopicsSection onTopicClick={handleTopicClick} />
    </div>
  );
};