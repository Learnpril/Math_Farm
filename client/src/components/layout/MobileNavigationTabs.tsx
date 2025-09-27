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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
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
  const [location, setLocation] = useLocation();
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
          <ScrollArea className='w-full'>
            <div className='flex space-x-2 pb-2'>
              {topics.map(topic => (
                <button
                  key={topic.id}
                  className={`flex-shrink-0 flex flex-col items-center space-y-1 p-2 rounded-md text-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-w-[70px] ${
                    isActiveLink(`/topic/${topic.id}`)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => handleTopicClick(topic)}
                >
                  <span className='flex-shrink-0' aria-hidden='true'>
                    {topic.icon && iconMap[topic.icon]
                      ? React.createElement(iconMap[topic.icon], {
                          className: 'h-5 w-5',
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
          </ScrollArea>
        )}

        {activeTab === 'tools' && (
          <div className='flex space-x-2'>
            {tools.map(tool => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.id}
                  className='flex-1 flex flex-col items-center space-y-1 p-2 rounded-md text-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground'
                  onClick={() => openTool(tool.id)}
                >
                  <IconComponent className='h-5 w-5 text-primary' />
                  <div className='text-center min-w-0'>
                    <div className='font-medium text-foreground text-xs truncate'>
                      {tool.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className='px-2 pb-2'>
        <div className='flex space-x-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex-1 text-xs'
            onClick={() => {
              if (location === '/') {
                const element = document.getElementById('topics');
                element?.scrollIntoView({ behavior: 'smooth' });
              } else {
                setLocation('/#topics');
              }
            }}
          >
            All Topics
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex-1 text-xs'
            onClick={() => setLocation('/tools')}
          >
            All Tools
          </Button>
        </div>
      </div>
    </div>
  );
}
