import React from 'react';
import { TopicCard } from './TopicCard';
import { Topic } from '../../../shared/types';
import topicsData from '../data/topicsData.json';

interface TopicsSectionProps {
  onTopicClick: (topicId: string) => void;
  className?: string;
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({ 
  onTopicClick, 
  className = '' 
}) => {
  const topics = topicsData as Topic[];

  return (
    <section 
      className={`py-16 px-4 sm:px-6 lg:px-8 ${className}`}
      aria-labelledby="topics-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            id="topics-heading"
            className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
          >
            Explore Mathematics Topics
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover our comprehensive collection of mathematics topics, from elementary 
            arithmetic to advanced calculus and specialized subjects. Each topic includes 
            interactive examples and step-by-step explanations.
          </p>
        </div>

        {/* Topics Grid */}
        <div 
          className="
            grid gap-6 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            xl:grid-cols-3
          "
          role="grid"
          aria-label="Mathematics topics"
        >
          {topics.map((topic, index) => (
            <div
              key={topic.id}
              role="gridcell"
              aria-rowindex={Math.floor(index / 3) + 1}
              aria-colindex={(index % 3) + 1}
            >
              <TopicCard
                topic={topic}
                onClick={onTopicClick}
                className="h-full"
              />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to start your mathematical journey?
          </p>
          <button
            onClick={() => {
              const firstTopic = topics[0];
              if (firstTopic) {
                onTopicClick(firstTopic.id);
              }
            }}
            className="
              inline-flex items-center px-6 py-3 
              bg-primary text-primary-foreground 
              rounded-lg font-medium
              hover:bg-primary/90 
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              transition-colors duration-200
            "
            aria-label="Start with the first topic: Arithmetic"
          >
            Start Learning
          </button>
        </div>
      </div>
    </section>
  );
};