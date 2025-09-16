import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useToolModalContext } from '../ToolModalProvider';
import type { ToolType } from '../ToolModal';
import {
  ChevronLeft,
  ChevronRight,
  Calculator,
  BarChart3,
  ArrowLeftRight,
  Zap,
  Wrench,
} from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

/**
 * Right sidebar component containing math tools
 */
export function RightSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [, setLocation] = useLocation();
  const { openTool } = useToolModalContext();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const tools = [
    {
      id: 'calculator' as ToolType,
      title: 'Calculator',
      description: 'Advanced mathematical calculator',
      icon: Calculator,
    },
    {
      id: 'function-grapher' as ToolType,
      title: 'Function Grapher',
      description: 'Plot mathematical functions',
      icon: BarChart3,
    },
    {
      id: 'unit-converter' as ToolType,
      title: 'Unit Converter',
      description: 'Convert between units',
      icon: ArrowLeftRight,
    },
    {
      id: 'equation-solver' as ToolType,
      title: 'Equation Solver',
      description: 'Solve equations symbolically',
      icon: Zap,
    },
  ];

  return (
    <aside
      className={`bg-card border-l border-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label='Math tools'
    >
      <div className='flex flex-col h-full'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-border'>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleSidebar}
            className='h-8 w-8 p-0'
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronLeft className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
          {!isCollapsed && (
            <div className='flex items-center space-x-2'>
              <Wrench className='h-5 w-5 text-primary' />
              <h2 className='font-semibold text-foreground'>Tools</h2>
            </div>
          )}
        </div>

        {/* Tools List */}
        <ScrollArea className='flex-1'>
          <div className='p-2'>
            {isCollapsed ? (
              // Collapsed view - just icons
              <nav aria-label='Math tools'>
                <ul className='space-y-2'>
                  {tools.map(tool => {
                    const IconComponent = tool.icon;
                    return (
                      <li key={tool.id}>
                        <button
                          className='flex items-center justify-center p-3 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                          title={tool.title}
                          onClick={() => openTool(tool.id)}
                        >
                          <IconComponent className='h-5 w-5' />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : (
              // Expanded view - cards
              <div className='space-y-3'>
                {tools.map(tool => {
                  const IconComponent = tool.icon;
                  return (
                    <Card
                      key={tool.id}
                      className='cursor-pointer hover:shadow-md transition-shadow'
                      onClick={() => openTool(tool.id)}
                    >
                      <CardHeader className='pb-2'>
                        <CardTitle className='flex items-center gap-2 text-sm'>
                          <IconComponent className='h-4 w-4 text-primary' />
                          {tool.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='pt-0'>
                        <CardDescription className='text-xs'>
                          {tool.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {!isCollapsed && (
          <div className='p-4 border-t border-border'>
            <Button
              variant='outline'
              size='sm'
              className='w-full'
              onClick={() => setLocation('/tools')}
            >
              All Tools
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
