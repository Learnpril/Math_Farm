import React from 'react';
import { cn } from '../../../lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface ForumLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

/**
 * Forum layout component that provides consistent structure for forum pages
 * Integrates with existing Math Farm layout patterns and shadcn/ui components
 */
export function ForumLayout({
  children,
  sidebar,
  breadcrumbs,
  className = '',
}: ForumLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Forum breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className='border-b border-border bg-muted/30'>
          <div className='container mx-auto px-4 py-3'>
            <nav
              aria-label='Forum breadcrumb navigation'
              className='flex items-center space-x-2 text-sm'
            >
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <span className='text-muted-foreground' aria-hidden='true'>
                      /
                    </span>
                  )}
                  {crumb.href && !crumb.isActive ? (
                    <a
                      href={crumb.href}
                      className='text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      className={cn(
                        crumb.isActive
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                      aria-current={crumb.isActive ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main forum content area */}
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Main content */}
          <main
            className={cn('flex-1', sidebar ? 'lg:pr-6' : '')}
            role='main'
            aria-label='Forum content'
          >
            {children}
          </main>

          {/* Sidebar */}
          {sidebar && (
            <aside
              className='lg:w-80 lg:flex-shrink-0'
              role='complementary'
              aria-label='Forum sidebar'
            >
              {sidebar}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Forum page header component for consistent page titles and actions
 */
interface ForumPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ForumPageHeader({
  title,
  description,
  actions,
  className = '',
}: ForumPageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>{title}</h1>
          {description && (
            <p className='mt-2 text-muted-foreground'>{description}</p>
          )}
        </div>
        {actions && <div className='flex items-center gap-2'>{actions}</div>}
      </div>
    </div>
  );
}

/**
 * Forum section wrapper for consistent spacing and styling
 */
interface ForumSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ForumSection({
  children,
  title,
  className = '',
}: ForumSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {title && (
        <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
      )}
      {children}
    </section>
  );
}
