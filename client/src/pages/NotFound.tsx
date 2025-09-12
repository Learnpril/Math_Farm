// React 19 - no need to import React
import { Link, useLocation } from 'wouter';
import { Home, Search, BookOpen, Lightbulb } from 'lucide-react';

export function NotFound() {
  const [location] = useLocation();

  // Extract potential topic name from URL for smart suggestions
  const extractTopicFromUrl = (url: string): string => {
    const segments = url.split('/').filter(Boolean);
    if (segments.length > 1 && segments[0] === 'topic') {
      return segments[1].replace(/-/g, ' ').toLowerCase();
    }
    return '';
  };

  const urlTopicName = extractTopicFromUrl(location);

  // Determine error context
  const getErrorContext = () => {
    if (location.includes('/topic/')) {
      return {
        title: 'Topic Not Found',
        message: urlTopicName
          ? `We couldn't find a topic matching "${urlTopicName.replace(
              /[-_]/g,
              ' '
            )}".`
          : "The topic you're looking for doesn't exist.",
      };
    } else if (location.includes('/tools/')) {
      return {
        title: 'Tool Not Found',
        message: "The mathematical tool you're looking for doesn't exist.",
      };
    } else {
      return {
        title: 'Page Not Found',
        message: "The page you're looking for doesn't exist or has been moved.",
      };
    }
  };

  const errorContext = getErrorContext();

  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='max-w-2xl mx-auto text-center'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-semibold text-foreground mb-4'>
            {errorContext.title}
          </h1>
          <p className='text-lg text-muted-foreground mb-4'>
            {errorContext.message}
          </p>
          {urlTopicName && (
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300'>
              <Lightbulb className='w-4 h-4' />
              <span className='text-sm'>
                Looking for:{' '}
                <strong>"{urlTopicName.replace(/[-_]/g, ' ')}"</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <Home className='w-4 h-4' />
            Go Home
          </Link>

          <Link
            href='/tools'
            className='inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <Search className='w-4 h-4' />
            Browse Tools
          </Link>
        </div>

        {/* Quick Navigation */}
        <div className='mb-8'>
          <h3 className='text-xl font-semibold text-foreground mb-6 text-center'>
            Where would you like to go?
          </h3>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto'>
            <Link
              href='/#topics'
              className='group p-4 bg-card border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-center'
            >
              <BookOpen className='w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform' />
              <h4 className='font-medium text-foreground mb-1'>Topics</h4>
              <p className='text-sm text-muted-foreground'>
                Browse all math topics
              </p>
            </Link>

            <Link
              href='/tools'
              className='group p-4 bg-card border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-center'
            >
              <Search className='w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform' />
              <h4 className='font-medium text-foreground mb-1'>Tools</h4>
              <p className='text-sm text-muted-foreground'>
                Math calculators & solvers
              </p>
            </Link>

            <Link
              href='/latex-guide'
              className='group p-4 bg-card border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-center'
            >
              <BookOpen className='w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform' />
              <h4 className='font-medium text-foreground mb-1'>LaTeX Guide</h4>
              <p className='text-sm text-muted-foreground'>
                Learn LaTeX formatting
              </p>
            </Link>

            <Link
              href='/community'
              className='group p-4 bg-card border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-center'
            >
              <Home className='w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform' />
              <h4 className='font-medium text-foreground mb-1'>Community</h4>
              <p className='text-sm text-muted-foreground'>
                Connect with learners
              </p>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className='mt-8 p-4 bg-muted/50 rounded-lg'>
          <p className='text-sm text-muted-foreground text-center'>
            Still can't find what you're looking for? Try checking the URL for
            typos or
            <Link
              href='/'
              className='text-primary hover:text-primary/80 font-medium ml-1'
            >
              start from the home page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
