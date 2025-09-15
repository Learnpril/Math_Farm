import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import {
  MessageSquare,
  Users,
  Plus,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Target,
} from 'lucide-react';
import {
  getTopicCategoryMapping,
  createForumDeepLink,
  createTopicDiscussionThread,
  generateStudyGroupSuggestions,
  StudyGroupData,
  CurriculumProgress,
} from '../lib/curriculum-integration';
import { StudyGroupManager } from './StudyGroupManager';
import { ProgressSharingWidget } from './ProgressSharingWidget';
import { ForumThread } from '../types';
import { useForumApi } from '../hooks/useForumApi';

interface TopicForumSectionProps {
  topicId: string;
  topicTitle: string;
  userProgress?: CurriculumProgress[];
  className?: string;
}

const DISCUSSION_TYPES = [
  {
    type: 'general' as const,
    label: 'General Discussion',
    icon: MessageSquare,
    description: 'Share thoughts and insights',
    color: 'bg-blue-500',
  },
  {
    type: 'homework' as const,
    label: 'Homework Help',
    icon: HelpCircle,
    description: 'Get help with assignments',
    color: 'bg-green-500',
  },
  {
    type: 'concept' as const,
    label: 'Concept Clarification',
    icon: Lightbulb,
    description: 'Understand difficult concepts',
    color: 'bg-yellow-500',
  },
  {
    type: 'application' as const,
    label: 'Real-world Applications',
    icon: Target,
    description: 'Explore practical uses',
    color: 'bg-purple-500',
  },
];

export function TopicForumSection({
  topicId,
  topicTitle,
  userProgress = [],
  className = '',
}: TopicForumSectionProps) {
  const [recentThreads, setRecentThreads] = useState<ForumThread[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  const { createThread, getThreadsByCategory } = useForumApi();

  // Get category mapping for this topic
  const topicMapping = getTopicCategoryMapping().find(
    m => m.topicId === topicId
  );
  const forumLink = createForumDeepLink(topicId);

  useEffect(() => {
    loadForumData();
  }, [topicId]);

  const loadForumData = async () => {
    setIsLoading(true);
    try {
      // Load recent threads for this topic's category
      if (topicMapping) {
        const threads = await getThreadsByCategory(topicMapping.categoryId);
        setRecentThreads(threads.slice(0, 5)); // Show latest 5 threads
      }

      // Generate study group suggestions
      const suggestions = generateStudyGroupSuggestions(userProgress, topicId);
      setStudyGroups(suggestions);
    } catch (error) {
      console.error('Failed to load forum data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiscussion = async (
    discussionType: (typeof DISCUSSION_TYPES)[0]['type']
  ) => {
    if (!topicMapping) return;

    setIsCreatingThread(true);
    try {
      const threadData = createTopicDiscussionThread(topicId, discussionType);

      await createThread({
        title: threadData.title,
        categoryId: threadData.categoryId,
        content: {
          text: threadData.content,
          mathExpressions: [],
        },
      });

      // Reload forum data to show the new thread
      await loadForumData();
    } catch (error) {
      console.error('Failed to create discussion thread:', error);
    } finally {
      setIsCreatingThread(false);
    }
  };

  if (!topicMapping) {
    return null; // Topic not mapped to forum category
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Forum Section Header */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <MessageSquare className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle className='text-lg'>Community Discussion</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Connect with others learning {topicTitle}
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => window.open(forumLink, '_blank')}
              className='flex items-center gap-2'
            >
              <ExternalLink className='h-4 w-4' />
              View Forum
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Progress Sharing Widget */}
        <div className='lg:col-span-1'>
          <ProgressSharingWidget
            topicId={topicId}
            userProgress={userProgress}
          />
        </div>
        {/* Quick Discussion Starters */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Plus className='h-4 w-4' />
                Start a Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {DISCUSSION_TYPES.map(discussionType => {
                const Icon = discussionType.icon;
                return (
                  <Button
                    key={discussionType.type}
                    variant='outline'
                    className='w-full justify-start h-auto p-4'
                    onClick={() => handleCreateDiscussion(discussionType.type)}
                    disabled={isCreatingThread}
                  >
                    <div className='flex items-center gap-3 w-full'>
                      <div
                        className={`p-2 rounded-md ${discussionType.color} text-white`}
                      >
                        <Icon className='h-4 w-4' />
                      </div>
                      <div className='text-left flex-1'>
                        <div className='font-medium'>
                          {discussionType.label}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {discussionType.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Discussions */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <MessageSquare className='h-4 w-4' />
                Recent Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-3'>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className='animate-pulse'>
                      <div className='h-4 bg-muted rounded w-3/4 mb-2'></div>
                      <div className='h-3 bg-muted rounded w-1/2'></div>
                    </div>
                  ))}
                </div>
              ) : recentThreads.length > 0 ? (
                <div className='space-y-3'>
                  {recentThreads.map(thread => (
                    <div
                      key={thread.id}
                      className='p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors'
                      onClick={() =>
                        window.open(`/community/thread/${thread.id}`, '_blank')
                      }
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <h4 className='font-medium text-sm truncate'>
                            {thread.title}
                          </h4>
                          <div className='flex items-center gap-2 mt-1'>
                            <span className='text-xs text-muted-foreground'>
                              by {thread.authorName}
                            </span>
                            <Badge variant='outline' className='text-xs'>
                              {thread.postCount} replies
                            </Badge>
                          </div>
                        </div>
                        <ExternalLink className='h-3 w-3 text-muted-foreground flex-shrink-0' />
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full'
                    onClick={() => window.open(forumLink, '_blank')}
                  >
                    View All Discussions
                    <ExternalLink className='h-3 w-3 ml-2' />
                  </Button>
                </div>
              ) : (
                <div className='text-center py-6'>
                  <MessageSquare className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
                  <p className='text-sm text-muted-foreground'>
                    No discussions yet. Be the first to start one!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Study Groups Manager */}
      <StudyGroupManager
        currentTopicId={topicId}
        userProgress={userProgress}
        className='mt-6'
      />

      {/* Study Groups */}
      {studyGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Suggested Study Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {studyGroups.map(group => (
                <div
                  key={group.id}
                  className='p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() =>
                    window.open(`/community/study-group/${group.id}`, '_blank')
                  }
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1'>
                      <h4 className='font-medium text-sm'>{group.name}</h4>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {group.description}
                      </p>
                      <div className='flex items-center gap-2 mt-2'>
                        <Badge variant='secondary' className='text-xs'>
                          {group.memberCount} members
                        </Badge>
                        {group.isActive && (
                          <Badge
                            variant='outline'
                            className='text-xs text-green-600'
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ExternalLink className='h-3 w-3 text-muted-foreground flex-shrink-0' />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic Integration Info */}
      <Card className='bg-muted/30'>
        <CardContent className='p-4'>
          <div className='flex items-start gap-3'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <BookOpen className='h-4 w-4 text-primary' />
            </div>
            <div className='flex-1'>
              <h4 className='font-medium text-sm'>Connected Learning</h4>
              <p className='text-xs text-muted-foreground mt-1'>
                Forum discussions are linked to your {topicTitle} progress.
                Participating in discussions can help reinforce your
                understanding and contribute to your learning journey.
              </p>
              <div className='flex items-center gap-2 mt-2'>
                <Badge variant='outline' className='text-xs'>
                  Level: {topicMapping.level}
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  Category: {topicMapping.categoryName}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
