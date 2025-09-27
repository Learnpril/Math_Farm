import { ReactNode } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MobileNavigationTabs } from './MobileNavigationTabs';

interface SidebarLayoutProps {
  children: ReactNode;
  showSidebars?: boolean;
  className?: string;
}

/**
 * Layout component with responsive sidebars
 * Desktop: Left and right sidebars
 * Mobile: Top navigation tabs for better space utilization
 */
export function SidebarLayout({
  children,
  showSidebars = true,
  className = '',
}: SidebarLayoutProps) {
  if (!showSidebars) {
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      {/* Desktop Layout - Sidebars */}
      <div className={`hidden lg:flex min-h-screen ${className}`}>
        {/* Left Sidebar - Topics */}
        <LeftSidebar />

        {/* Main Content */}
        <main className='flex-1 min-w-0'>{children}</main>

        {/* Right Sidebar - Tools */}
        <RightSidebar />
      </div>

      {/* Mobile Layout - Vertical Navigation */}
      <div className={`lg:hidden flex flex-col min-h-screen ${className}`}>
        {/* Mobile Navigation Tabs */}
        <MobileNavigationTabs />

        {/* Main Content */}
        <main className='flex-1 min-w-0'>{children}</main>
      </div>
    </>
  );
}
