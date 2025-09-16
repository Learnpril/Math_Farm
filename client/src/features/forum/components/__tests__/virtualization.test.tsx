/**
 * Simple tests for forum virtualization components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
global.IntersectionObserver = mockIntersectionObserver;

import { VirtualizedThreadList } from '../VirtualizedThreadList';
import { ThreadListItem } from '../ThreadListItem';

// Mock data
const mockThreads = [
  {
    id: 1,
    title: 'Test Thread 1',
    categoryId: 1,
    authorId: 1,
    authorName: 'User1',
    isPinned: false,
    isLocked: false,
    postCount: 5,
    lastPostAt: new Date(),
    createdAt: new Date(),
    lastPostAuthor: 'LastUser1',
  },
  {
    id: 2,
    title: 'Test Thread 2',
    categoryId: 1,
    authorId: 2,
    authorName: 'User2',
    isPinned: true,
    isLocked: false,
    postCount: 10,
    lastPostAt: new Date(),
    createdAt: new Date(),
    lastPostAuthor: 'LastUser2',
  },
];

describe('Forum Virtualization', () => {
  it('should render ThreadListItem', () => {
    render(
      <ThreadListItem
        thread={mockThreads[0]}
        onClick={() => {}}
        onAuthorClick={() => {}}
      />
    );

    expect(screen.getByText('Test Thread 1')).toBeInTheDocument();
    expect(screen.getByText('User1')).toBeInTheDocument();
  });

  it('should render VirtualizedThreadList with empty state', () => {
    render(
      <VirtualizedThreadList
        threads={[]}
        containerHeight={400}
        itemHeight={120}
      />
    );

    expect(screen.getByText('No threads found')).toBeInTheDocument();
  });

  it('should render VirtualizedThreadList with threads', () => {
    render(
      <VirtualizedThreadList
        threads={mockThreads}
        containerHeight={400}
        itemHeight={120}
      />
    );

    // Should show pinned threads section
    expect(screen.getByText('Pinned Threads')).toBeInTheDocument();
    expect(screen.getByText('Test Thread 2')).toBeInTheDocument();
  });

  it('should handle pinned threads separately', () => {
    render(
      <VirtualizedThreadList
        threads={mockThreads}
        containerHeight={400}
        itemHeight={120}
        showPinnedSeparately={true}
      />
    );

    expect(screen.getByText('Pinned Threads')).toBeInTheDocument();
  });
});
