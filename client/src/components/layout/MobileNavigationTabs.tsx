import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToolModalContext } from '../ToolModalProvider';
import type { ToolType } from '../ToolModal';
import {
  BookOpen,
  Calculator,
  Variable,
  TrendingUp,
  Shapes,
  BarChart3,
  Zap,
  Brain,
  Gamepad2,
  Palette,
  ArrowLeftRight,
  Wrench,
} from 'lucide-react';

import topicsData from '../../data/topicsData.json';
import { Topic } from '../../../../shared/types';

// Icon mapping for topic icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  Variable,
  TrendingUp,
  Shapes,
  BarChart3,
  Zap,
  Brain,
  Gamepad2,
  Palette,
};

/**
 * Mobile navigation component with horizontal scrollable tabs
 * Optimized for mobile viewing with compact layout
 */
export function MobileNavigationTabs() {
  const [activeTab, setActiveTab] = useState<'topics' | 'tools'>('topics');
  const [location] = useLocation();
  const { openTool } = useToolModalContext();
  const topics = topicsData as Topic[];

  const tools = [
    {
      id: 'calculator' as ToolType,
      title: 'Calculator',
      icon: Calculator,
    },
    {
      id: 'function-grapher' as ToolType,
      title: 'Grapher',
      icon: BarChart3,
    },
    {
      id: 'unit-converter' as ToolType,
      title: 'Converter',
      icon: ArrowLeftRight,
    },
    {
      id: 'equation-solver' as ToolType,
      title: 'Solver',
      icon: Zap,
    },
  ];

  const isActiveLink = (href: string) => {
    if (
      href === '/topic/arithmetic' &&
      location.startsWith('/topic/arithmetic/curriculum')
    ) {
      return true;
    }
    return location === href;
  };

  const handleTopicClick = (topic: Topic) => {
    if (topic.id === 'arithmetic') {
      const curriculumPath = `/topic/arithmetic/curriculum/1`;
      window.location.href = curriculumPath;
      return;
    }

    const newPath = `/topic/${topic.id}`;
    window.location.href = newPath;
  };

  return (
    <div className='bg-card border-b border-border'>
      {/* Tab Headers */}
      <div className='flex border-b border-border'>
        <button
          className={`flex-1 flex items-center justify-center space-x-2 p-3 transition-colors ${
            activeTab === 'topics'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          onClick={() => setActiveTab('topics')}
        >
          <BookOpen className='h-4 w-4' />
          <span className='font-medium'>Topics</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center space-x-2 p-3 transition-colors ${
            activeTab === 'tools'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          onClick={() => setActiveTab('tools')}
        >
          <Wrench className='h-4 w-4' />
          <span className='font-medium'>Tools</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className='p-2'>
        {activeTab === 'topics' && (
          <div className='w-full'>
            {/* Horizontal scrollable topics with touch support */}
            <div className='flex space-x-3 pb-2 overflow-x-auto scrollbar-hide touch-scroll px-1'>
              {topics.map(topic => (
                <button
                  key={topic.id}
                  className={`flex-shrink-0 flex flex-col items-center space-y-2 p-3 rounded-lg text-xs transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-w-[80px] touch-manipulation active:scale-95 ${
                    isActiveLink(`/topic/${topic.id}`)
                      ? 'bg-accent text-accent-foreground shadow-sm border border-accent-foreground/20'
                      : 'text-muted-foreground hover:shadow-sm'
                  }`}
                  onClick={() => handleTopicClick(topic)}
                >
                  <span className='flex-shrink-0' aria-hidden='true'>
                    {topic.icon && iconMap[topic.icon]
                      ? React.createElement(iconMap[topic.icon], {
                          className: 'h-6 w-6',
                        })
                      : '📚'}
                  </span>
                  <div className='text-center min-w-0'>
                    <div className='font-medium text-foreground text-xs truncate'>
                      {topic.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className='w-full'>
            {/* Horizontal scrollable tools with touch support */}
            <div className='flex space-x-3 pb-2 overflow-x-auto scrollbar-hide touch-scroll px-1'>
              {tools.map(tool => {
                const IconComponent = tool.icon;
                return (
                  <button
                    key={tool.id}
                    className='flex-shrink-0 flex flex-col items-center space-y-2 p-3 rounded-lg text-xs transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground min-w-[80px] touch-manipulation hover:shadow-sm active:scale-95'
                    onClick={() => openTool(tool.id)}
                  >
                    <IconComponent className='h-6 w-6 text-primary' />
                    <div className='text-center min-w-0'>
                      <div className='font-medium text-foreground text-xs truncate'>
                        {tool.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
