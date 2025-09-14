/**
 * Forum Avatar Display Component Tests
 * Math Farm Community Forum - Unit Tests for Forum Avatar Display
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ForumAvatarDisplay } from '../ForumAvatarDisplay';
import { AvatarConfigUtils } from '../../../lib/avatar-config';
import type { AvatarConfig } from '../../../types/avatar';

// Mock the AvatarThumbnail component
vi.mock('../AvatarThumbnail', () => ({
  AvatarThumbnail: ({ config, size, fallbackInitials, onClick }: any) => (
    <div
      data-testid='avatar-thumbnail'
      data-size={size}
      onClick={onClick}
      role='img'
      aria-label='User avatar'
    >
      {config ? 'Avatar' : fallbackInitials?.charAt(0) || '?'}
    </div>
  ),
}));

describe('ForumAvatarDisplay', () => {
  let mockConfig: AvatarConfig;
  const mockUserStats = {
    posts: 42,
    likes: 128,
    helpfulAnswers: 15,
    joinDate: new Date('2023-01-15'),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  };

  beforeEach(() => {
    mockConfig = AvatarConfigUtils.createDefaultConfig(1);
    vi.clearAllMocks();
  });

  it('renders basic avatar display', () => {
    render(
      <ForumAvatarDisplay config={mockConfig} username='TestUser' userId={1} />
    );

    expect(screen.getByTestId('avatar-thumbnail')).toBeInTheDocument();
  });

  it('displays username when showUsername is true', () => {
    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='TestUser'
        userId={1}
        showUsername={true}
      />
    );

    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('shows achievement tier badge for high-tier users', () => {
    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='MathMaster'
        userId={1}
        showAchievements={true}
        achievements={['community-champion', 'math-master']}
      />
    );

    // Should show legendary tier styling
    const tierBadge = document.querySelector(
      '.bg-gradient-to-r.from-yellow-400'
    );
    expect(tierBadge).toBeInTheDocument();
  });

  it('displays different tier badges based on achievements', () => {
    const { rerender } = render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='ExpertUser'
        userId={1}
        showAchievements={true}
        achievements={['calculus-master', 'infinity-seeker']}
      />
    );

    // Should show expert tier (purple)
    let tierBadge = document.querySelector('.bg-gradient-to-r.from-purple-400');
    expect(tierBadge).toBeInTheDocument();

    rerender(
      <ForumAvatarDisplay
        config={mockConfig}
        username='AdvancedUser'
        userId={1}
        showAchievements={true}
        achievements={['helpful-member', 'geometry-explorer']}
      />
    );

    // Should show advanced tier (blue)
    tierBadge = document.querySelector('.bg-gradient-to-r.from-blue-400');
    expect(tierBadge).toBeInTheDocument();
  });

  it('shows online status indicator based on last active time', () => {
    const recentlyActive = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago

    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='OnlineUser'
        userId={1}
        userStats={{
          ...mockUserStats,
          lastActive: recentlyActive,
        }}
      />
    );

    // Should show green (online) status
    const onlineIndicator = document.querySelector('.bg-green-500');
    expect(onlineIndicator).toBeInTheDocument();
  });

  it('shows away status for users active within an hour', () => {
    const recentlyActive = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='AwayUser'
        userId={1}
        userStats={{
          ...mockUserStats,
          lastActive: recentlyActive,
        }}
      />
    );

    // Should show yellow (away) status
    const awayIndicator = document.querySelector('.bg-yellow-500');
    expect(awayIndicator).toBeInTheDocument();
  });

  it('shows offline status for inactive users', () => {
    const longAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='OfflineUser'
        userId={1}
        userStats={{
          ...mockUserStats,
          lastActive: longAgo,
        }}
      />
    );

    // Should show gray (offline) status
    const offlineIndicator = document.querySelector('.bg-gray-400');
    expect(offlineIndicator).toBeInTheDocument();
  });

  it('displays hover card on mouse enter with delay', async () => {
    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='HoverUser'
        userId={1}
        showHoverCard={true}
        userStats={mockUserStats}
        achievements={['helpful-member']}
      />
    );

    const avatar = screen.getByTestId('avatar-thumbnail');
    fireEvent.mouseEnter(avatar);

    // Wait for hover delay
    await waitFor(
      () => {
        expect(screen.getByText('View Profile')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('hides hover card on mouse leave', async () => {
    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='HoverUser'
        userId={1}
        showHoverCard={true}
        userStats={mockUserStats}
      />
    );

    const avatar = screen.getByTestId('avatar-thumbnail');

    // Show hover card
    fireEvent.mouseEnter(avatar);
    await waitFor(() => {
      expect(screen.getByText('View Profile')).toBeInTheDocument();
    });

    // Hide hover card
    fireEvent.mouseLeave(avatar);
    await waitFor(
      () => {
        expect(screen.queryByText('View Profile')).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('formats user statistics correctly', () => {
    const stats = {
      posts: 1234,
      likes: 5678,
      helpfulAnswers: 89,
      joinDate: new Date('2023-03-15'),
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
    };

    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='StatsUser'
        userId={1}
        showHoverCard={true}
        userStats={stats}
      />
    );

    const avatar = screen.getByTestId('avatar-thumbnail');
    fireEvent.mouseEnter(avatar);

    waitFor(() => {
      expect(screen.getByText('1,234')).toBeInTheDocument(); // Posts
      expect(screen.getByText('5,678')).toBeInTheDocument(); // Likes
      expect(screen.getByText('89')).toBeInTheDocument(); // Helpful answers
      expect(screen.getByText('Mar 2023')).toBeInTheDocument(); // Join date
    });
  });

  it('displays recent achievements in hover card', async () => {
    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='AchievementUser'
        userId={1}
        showHoverCard={true}
        showAchievements={true}
        achievements={[
          'math-master',
          'calculus-master',
          'helpful-member',
          'geometry-explorer',
        ]}
        userStats={mockUserStats}
      />
    );

    const avatar = screen.getByTestId('avatar-thumbnail');
    fireEvent.mouseEnter(avatar);

    await waitFor(() => {
      expect(screen.getByText('Recent Achievements')).toBeInTheDocument();
      expect(screen.getByText('math master')).toBeInTheDocument();
      expect(screen.getByText('calculus master')).toBeInTheDocument();
      expect(screen.getByText('helpful member')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument(); // Should show +1 more for 4th achievement
    });
  });

  it('handles click events', () => {
    const handleClick = vi.fn();

    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='ClickableUser'
        userId={1}
        onClick={handleClick}
      />
    );

    const avatar = screen.getByTestId('avatar-thumbnail');
    fireEvent.click(avatar);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('navigates to user profile when View Profile is clicked', async () => {
    // Mock window.location
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='ProfileUser'
        userId={123}
        showHoverCard={true}
        userStats={mockUserStats}
      />
    );

    const avatar = screen.getByTestId('avatar-thumbnail');
    fireEvent.mouseEnter(avatar);

    await waitFor(() => {
      const profileButton = screen.getByText('View Profile');
      fireEvent.click(profileButton);
      expect(mockLocation.href).toBe('/forum/user/123');
    });
  });

  it('renders fallback avatar when config is not provided', () => {
    render(
      <ForumAvatarDisplay
        config={undefined}
        username='FallbackUser'
        userId={1}
      />
    );

    const thumbnail = screen.getByTestId('avatar-thumbnail');
    expect(thumbnail).toHaveTextContent('F'); // First letter of username
  });

  it('applies correct size to thumbnail', () => {
    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='SizeUser'
        userId={1}
        size='lg'
      />
    );

    const thumbnail = screen.getByTestId('avatar-thumbnail');
    expect(thumbnail).toHaveAttribute('data-size', 'lg');
  });

  it('does not show achievement badge for regular members', () => {
    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='RegularUser'
        userId={1}
        showAchievements={true}
        achievements={[]} // No achievements
      />
    );

    // Should not have any tier badge
    const tierBadge = document.querySelector('.bg-gradient-to-r');
    expect(tierBadge).toBeNull();
  });

  it('shows member tier in hover card for users without special achievements', async () => {
    render(
      <ForumAvatarDisplay
        config={mockConfig}
        username='MemberUser'
        userId={1}
        showHoverCard={true}
        showAchievements={true}
        achievements={[]}
        userStats={mockUserStats}
      />
    );

    const avatar = screen.getByTestId('avatar-thumbnail');
    fireEvent.mouseEnter(avatar);

    await waitFor(() => {
      expect(screen.getByText('member Member')).toBeInTheDocument();
    });
  });
});
