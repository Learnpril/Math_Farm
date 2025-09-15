import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../components/ui/collapsible';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  MessageSquare,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  generateCurriculumCategories,
  getTopicCategoryMapping,
  createTopicDeepLink,
  createForumDeepLink,
} from '../lib/curriculum-integration';
import { ForumCategory } from '../types';
import topicsData from '../../../data/topicsData.json';

interface CurriculumForumNavProps {
  currentCategoryId?: number;
  onCategorySelect?: (categoryId: number) => void;
  showTopicLinks?: boolean;
  className?: string;
}

interface TopicWithForum {
  id: string;
  title: string;
  level: string;
  description: string;
  categoryId: number;
  threadCount: number;
  hasRecentActivity: boolean;
}

export function CurriculumForumNav({
  currentCategoryId,
  onCategorySelect,
  showTopicLinks = true,
  className = '',
}: CurriculumForumNavProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(
    new Set(['elementary', 'middle'])
  );

  // Generate curriculum-based categories
  const categories = useMemo(() => generateCurriculumCategories(), []);
  const topicMapping = useMemo(() => getTopicCategoryMapping(), []);

  // Combine topics with forum data
  const topicsWithForum = useMemo(() => {
    const topics = topicsData as any[];
    return topics.map(topic => {
      const mapping = topicMapping.find(m => m.topicId === topic.id);
      return {
        ...topic,
        categoryId: mapping?.categoryId || 1,
        threadCount: Math.floor(Math.random() * 20), // Mock data
        hasRecentActivity: Math.random() > 0.6, // Mock data
      } as TopicWithForum;
    });
  }, [topicMapping]);

  // Group categories by level
  const categoriesByLevel = useMemo(() => {
    const levelCategories = categories.filter(cat => !cat.parentId);
    const result: Record<
      string,
      { parent: ForumCategory; children: ForumCategory[] }
    > = {};

    levelCategories.forEach(parent => {
      const children = categories.filter(cat => cat.parentId === parent.id);
      const levelKey = parent.name.toLowerCase().replace(/\s+/g, '-');
      result[levelKey] = { parent, children };
    });

    return result;
  }, [categories]);

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    if (!searchTerm.trim()) return topicsWithForum;

    const term = searchTerm.toLowerCase();
    return topicsWithForum.filter(
      topic =>
        topic.title.toLowerCase().includes(term) ||
        topic.description.toLowerCase().includes(term) ||
        topic.level.toLowerCase().includes(term)
    );
  }, [topicsWithForum, searchTerm]);

  const toggleLevel = (level: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const handleCategoryClick = (categoryId: number) => {
    onCategorySelect?.(categoryId);
  };

  const handleTopicClick = (topicId: string) => {
    if (showTopicLinks) {
      window.open(createTopicDeepLink(topicId), '_blank');
    }
  };

  const handleForumClick = (topicId: string) => {
    window.open(createForumDeepLink(topicId), '_blank');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      <Card>
        <CardContent className='p-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search topics...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <BookOpen className='h-4 w-4' />
            Math Curriculum
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {searchTerm.trim() ? (
            // Search Results
            <div className='p-4 space-y-2'>
              {filteredTopics.length > 0 ? (
                filteredTopics.map(topic => (
                  <div
                    key={topic.id}
                    className='p-3 border rounded-lg hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h4 className='font-medium text-sm'>{topic.title}</h4>
                          <Badge variant='outline' className='text-xs'>
                            {topic.level}
                          </Badge>
                        </div>
                        <p className='text-xs text-muted-foreground mb-2'>
                          {topic.description}
                        </p>
                        <div className='flex items-center gap-2'>
                          {showTopicLinks && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleTopicClick(topic.id)}
                              className='h-6 px-2 text-xs'
                            >
                              <BookOpen className='h-3 w-3 mr-1' />
                              Study
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleForumClick(topic.id)}
                            className='h-6 px-2 text-xs'
                          >
                            <MessageSquare className='h-3 w-3 mr-1' />
                            Discuss ({topic.threadCount})
                          </Button>
                          {topic.hasRecentActivity && (
                            <Badge variant='secondary' className='text-xs'>
                              <TrendingUp className='h-2 w-2 mr-1' />
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-6'>
                  <Search className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
                  <p className='text-sm text-muted-foreground'>
                    No topics found matching "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Level-based Navigation
            <div className='space-y-1'>
              {Object.entries(categoriesByLevel).map(
                ([levelKey, { parent, children }]) => {
                  const isExpanded = expandedLevels.has(levelKey);
                  const levelTopics = topicsWithForum.filter(topic => {
                    const category = children.find(
                      child => child.id === topic.categoryId
                    );
                    return category !== undefined;
                  });

                  return (
                    <Collapsible
                      key={levelKey}
                      open={isExpanded}
                      onOpenChange={() => toggleLevel(levelKey)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant='ghost'
                          className='w-full justify-start p-4 h-auto'
                        >
                          <div className='flex items-center gap-2 w-full'>
                            {isExpanded ? (
                              <ChevronDown className='h-4 w-4' />
                            ) : (
                              <ChevronRight className='h-4 w-4' />
                            )}
                            <div className='flex-1 text-left'>
                              <div className='font-medium'>{parent.name}</div>
                              <div className='text-xs text-muted-foreground'>
                                {levelTopics.length} topics
                              </div>
                            </div>
                            <Badge variant='outline' className='text-xs'>
                              {levelTopics.reduce(
                                (sum, topic) => sum + topic.threadCount,
                                0
                              )}{' '}
                              discussions
                            </Badge>
                          </div>
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className='pl-6 space-y-1'>
                          {levelTopics.map(topic => (
                            <div
                              key={topic.id}
                              className={`p-3 rounded-lg border-l-2 transition-colors ${
                                currentCategoryId === topic.categoryId
                                  ? 'border-l-primary bg-primary/5'
                                  : 'border-l-transparent hover:bg-muted/50'
                              }`}
                            >
                              <div className='flex items-start justify-between gap-2'>
                                <div className='flex-1'>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <h4 className='font-medium text-sm'>
                                      {topic.title}
                                    </h4>
                                    {topic.hasRecentActivity && (
                                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                    )}
                                  </div>
                                  <p className='text-xs text-muted-foreground mb-2'>
                                    {topic.description}
                                  </p>
                                  <div className='flex items-center gap-2'>
                                    {showTopicLinks && (
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          handleTopicClick(topic.id)
                                        }
                                        className='h-6 px-2 text-xs'
                                      >
                                        <BookOpen className='h-3 w-3 mr-1' />
                                        Study
                                      </Button>
                                    )}
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        handleCategoryClick(topic.categoryId)
                                      }
                                      className='h-6 px-2 text-xs'
                                    >
                                      <MessageSquare className='h-3 w-3 mr-1' />
                                      Forum ({topic.threadCount})
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
              )}

              {/* General Categories */}
              <div className='border-t pt-2 mt-4'>
                <div className='px-4 py-2'>
                  <h4 className='font-medium text-sm text-muted-foreground'>
                    General
                  </h4>
                </div>
                {categories
                  .filter(
                    cat =>
                      !cat.parentId &&
                      !Object.values(categoriesByLevel).some(
                        level => level.parent.id === cat.id
                      )
                  )
                  .map(category => (
                    <Button
                      key={category.id}
                      variant='ghost'
                      className={`w-full justify-start p-4 h-auto ${
                        currentCategoryId === category.id ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className='flex items-center gap-2 w-full'>
                        <MessageSquare className='h-4 w-4' />
                        <div className='flex-1 text-left'>
                          <div className='font-medium'>{category.name}</div>
                          <div className='text-xs text-muted-foreground'>
                            {category.description}
                          </div>
                        </div>
                        <Badge variant='outline' className='text-xs'>
                          {category.threadCount}
                        </Badge>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent className='p-4'>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <div className='text-lg font-bold text-primary'>
                {topicsWithForum.length}
              </div>
              <div className='text-xs text-muted-foreground'>Topics</div>
            </div>
            <div>
              <div className='text-lg font-bold text-primary'>
                {topicsWithForum.reduce(
                  (sum, topic) => sum + topic.threadCount,
                  0
                )}
              </div>
              <div className='text-xs text-muted-foreground'>Discussions</div>
            </div>
            <div>
              <div className='text-lg font-bold text-primary'>
                {
                  topicsWithForum.filter(topic => topic.hasRecentActivity)
                    .length
                }
              </div>
              <div className='text-xs text-muted-foreground'>Active</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
