import { ReactNode } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';

interface SidebarLayoutProps {
  children: ReactNode;
  showSidebars?: boolean;
  className?: string;
}

/**
 * Layout component with left and right sidebars
 * Left sidebar contains topics navigation
 * Right sidebar contains math tools
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
    <div className={`flex min-h-screen ${className}`}>
      {/* Left Sidebar - Topics */}
      <LeftSidebar />

      {/* Main Content */}
      <main className='flex-1 min-w-0'>{children}</main>

      {/* Right Sidebar - Tools */}
      <RightSidebar />
    </div>
  );
}
