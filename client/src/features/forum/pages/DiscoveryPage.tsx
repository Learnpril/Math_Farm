import React from 'react';
import { useLocation } from 'wouter';
import { Compass, TrendingUp, Flame, Activity, Tag } from 'lucide-react';
import { ForumLayout } from '../components/ForumLayout';
import { TrendingTopics } from '../components/TrendingTopics';
import { PopularDiscussions } from '../components/PopularDiscussions';
import { ActivityFeed } from '../components/ActivityFeed';
import { TagCloud } from '../components/TagCloud';
import type {
  TrendingTopic,
  PopularDiscussion,
  ActivityFeedItem,
  ForumTag,
} from '../../../../shared/forum-types';

export function DiscoveryPage() {
  const [, setLocation] = useLocation();

  const handleTopicClick = (topic: TrendingTopic) => {
    setLocation(`/forum/threads/${topic.id}`);
  };

  const handleDiscussionClick = (discussion: PopularDiscussion) => {
    setLocation(`/forum/threads/${discussion.id}`);
  };

  const handleActivityClick = (item: ActivityFeedItem) => {
    if (item.thread) {
      setLocation(`/forum/threads/${item.thread.id}#post-${item.id}`);
    }
  };

  const handleTagClick = (tag: ForumTag) => {
    setLocation(`/forum/tags/${encodeURIComponent(tag.name)}`);
  };

  const breadcrumbs = [
    { label: 'Forum', href: '/forum' },
    { label: 'Discovery', href: '/forum/discovery', isActive: true },
  ];

  return (
    <ForumLayout breadcrumbs={breadcrumbs} showSearch={false}>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='flex items-center gap-3'>
          <Compass className='h-8 w-8 text-primary' />
          <div>
            <h1 className='text-3xl font-bold'>Discover</h1>
            <p className='text-muted-foreground'>
              Find trending topics, popular discussions, and explore by tags
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Trending & Popular */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Trending Topics */}
            <TrendingTopics onTopicClick={handleTopicClick} limit={8} />

            {/* Popular Discussions */}
            <PopularDiscussions
              onDiscussionClick={handleDiscussionClick}
              limit={8}
            />
          </div>

          {/* Right Column - Activity & Tags */}
          <div className='space-y-6'>
            {/* Activity Feed */}
            <ActivityFeed onItemClick={handleActivityClick} />

            {/* Tag Cloud */}
            <TagCloud onTagClick={handleTagClick} limit={20} />
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t'>
          <div className='text-center p-4 rounded-lg bg-muted/30'>
            <TrendingUp className='h-6 w-6 mx-auto mb-2 text-primary' />
            <div className='text-2xl font-bold'>24</div>
            <div className='text-sm text-muted-foreground'>Trending Topics</div>
          </div>

          <div className='text-center p-4 rounded-lg bg-muted/30'>
            <Flame className='h-6 w-6 mx-auto mb-2 text-orange-500' />
            <div className='text-2xl font-bold'>156</div>
            <div className='text-sm text-muted-foreground'>
              Popular Discussions
            </div>
          </div>

          <div className='text-center p-4 rounded-lg bg-muted/30'>
            <Activity className='h-6 w-6 mx-auto mb-2 text-green-500' />
            <div className='text-2xl font-bold'>89</div>
            <div className='text-sm text-muted-foreground'>Active Users</div>
          </div>

          <div className='text-center p-4 rounded-lg bg-muted/30'>
            <Tag className='h-6 w-6 mx-auto mb-2 text-purple-500' />
            <div className='text-2xl font-bold'>42</div>
            <div className='text-sm text-muted-foreground'>Popular Tags</div>
          </div>
        </div>
      </div>
    </ForumLayout>
  );
}
