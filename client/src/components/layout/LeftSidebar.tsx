import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronLeft,
  ChevronRight,
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
 * Left sidebar component containing mathematics topics navigation
 */
export function LeftSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location, setLocation] = useLocation();
  const topics = topicsData as Topic[];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActiveLink = (href: string) => {
    // Special case: highlight arithmetic when in curriculum
    if (
      href === '/topic/arithmetic' &&
      location.startsWith('/topic/arithmetic/curriculum')
    ) {
      return true;
    }
    return location === href;
  };

  return (
    <aside
      className={`bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label='Topics navigation'
    >
      <div className='flex flex-col h-full'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-border'>
          {!isCollapsed && (
            <div className='flex items-center space-x-2'>
              <BookOpen className='h-5 w-5 text-primary' />
              <h2 className='font-semibold text-foreground'>Topics</h2>
            </div>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleSidebar}
            className='h-8 w-8 p-0'
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className='h-4 w-4' />
            ) : (
              <ChevronLeft className='h-4 w-4' />
            )}
          </Button>
        </div>

        {/* Topics List */}
        <ScrollArea className='flex-1'>
          <nav className='p-2' aria-label='Mathematics topics'>
            <ul className='space-y-1'>
              {topics.map(topic => (
                <li key={topic.id}>
                  <button
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isActiveLink(`/topic/${topic.id}`)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    }`}
                    title={isCollapsed ? topic.title : undefined}
                    onClick={() => {
                      console.log(`Navigating to topic: ${topic.id}`);

                      // Special case: Arithmetic goes directly to curriculum
                      if (topic.id === 'arithmetic') {
                        const curriculumPath = `/topic/arithmetic/curriculum/1`;
                        console.log(
                          'Redirecting arithmetic to curriculum:',
                          curriculumPath
                        );
                        window.location.href = curriculumPath;
                        return;
                      }

                      const newPath = `/topic/${topic.id}`;
                      console.log('Attempting navigation to:', newPath);

                      // Force page navigation for testing
                      window.location.href = newPath;
                    }}
                  >
                    <span className='text-lg flex-shrink-0' aria-hidden='true'>
                      {topic.icon && iconMap[topic.icon]
                        ? React.createElement(iconMap[topic.icon], {
                            className: 'h-5 w-5',
                          })
                        : '📚'}
                    </span>
                    {!isCollapsed && (
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-foreground truncate'>
                          {topic.title}
                        </div>
                        <div className='text-xs text-muted-foreground truncate'>
                          {topic.description.split('.')[0]}
                        </div>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollArea>

        {/* Footer */}
        {!isCollapsed && (
          <div className='p-4 border-t border-border'>
            <Button
              variant='outline'
              size='sm'
              className='w-full'
              onClick={() => {
                if (location === '/') {
                  const element = document.getElementById('topics');
                  element?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setLocation('/#topics');
                }
              }}
            >
              View All Topics
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
