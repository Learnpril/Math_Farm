import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import {
  TrendingUp,
  Trophy,
  Target,
  Calendar,
  Share2,
  MessageSquare,
  Star,
  BookOpen,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import {
  CurriculumProgress,
  updateProgressWithForumActivity,
  createTopicDiscussionThread,
  getCategoryForTopic,
} from '../lib/curriculum-integration';
import { useForumApi } from '../hooks/useForumApi';
import topicsData from '../../../data/topicsData.json';

interface ProgressSharingWidgetProps {
  topicId: string;
  userProgress: CurriculumProgress[];
  onProgressUpdate?: (progress: CurriculumProgress[]) => void;
  className?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  earnedAt: Date;
  category: 'progress' | 'forum' | 'streak' | 'help';
}

interface ProgressMilestone {
  percentage: number;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: Date;
}

export function ProgressSharingWidget({
  topicId,
  userProgress,
  onProgressUpdate,
  className = '',
}: ProgressSharingWidgetProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const { createThread } = useForumApi();
  const topics = topicsData as any[];
  const currentTopic = topics.find(t => t.id === topicId);
  const currentProgress = userProgress.find(p => p.topicId === topicId);

  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: 'first-post',
      title: 'First Post',
      description: 'Made your first forum post',
      icon: MessageSquare,
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      category: 'forum',
    },
    {
      id: 'helpful-answer',
      title: 'Helpful Helper',
      description: 'Received 5 likes on your answers',
      icon: Star,
      earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      category: 'help',
    },
    {
      id: 'progress-milestone',
      title: 'Progress Champion',
      description: 'Completed 50% of a topic',
      icon: Target,
      earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      category: 'progress',
    },
  ];

  // Calculate progress milestones
  const progressMilestones: ProgressMilestone[] = [
    {
      percentage: 25,
      title: 'Getting Started',
      description: 'Completed the basics',
      achieved: (currentProgress?.progress || 0) >= 0.25,
      achievedAt: currentProgress?.progress >= 0.25 ? new Date() : undefined,
    },
    {
      percentage: 50,
      title: 'Halfway There',
      description: 'Making solid progress',
      achieved: (currentProgress?.progress || 0) >= 0.5,
      achievedAt: currentProgress?.progress >= 0.5 ? new Date() : undefined,
    },
    {
      percentage: 75,
      title: 'Almost Done',
      description: 'Nearly mastered the topic',
      achieved: (currentProgress?.progress || 0) >= 0.75,
      achievedAt: currentProgress?.progress >= 0.75 ? new Date() : undefined,
    },
    {
      percentage: 100,
      title: 'Topic Master',
      description: 'Fully completed the topic',
      achieved: (currentProgress?.progress || 0) >= 1.0,
      achievedAt: currentProgress?.completed ? new Date() : undefined,
    },
  ];

  const handleShareProgress = async () => {
    if (!currentTopic || !currentProgress) return;

    setIsSharing(true);
    try {
      const categoryId = getCategoryForTopic(topicId);
      if (!categoryId) return;

      const progressPercentage = Math.round(currentProgress.progress * 100);
      const title = `My ${currentTopic.title} Progress - ${progressPercentage}% Complete!`;

      let content = `I wanted to share my progress on **${currentTopic.title}**!\n\n`;
      content += `📊 **Current Progress:** ${progressPercentage}%\n`;
      content += `📚 **Topic Level:** ${currentTopic.level}\n\n`;

      // Add milestones achieved
      const achievedMilestones = progressMilestones.filter(m => m.achieved);
      if (achievedMilestones.length > 0) {
        content += `🏆 **Milestones Achieved:**\n`;
        achievedMilestones.forEach(milestone => {
          content += `- ${milestone.title} (${milestone.percentage}%)\n`;
        });
        content += '\n';
      }

      // Add forum participation stats
      if (currentProgress.forumParticipation) {
        const fp = currentProgress.forumParticipation;
        content += `💬 **Forum Activity:**\n`;
        content += `- Posts: ${fp.postsCount}\n`;
        content += `- Threads Created: ${fp.threadsCreated}\n`;
        content += `- Help Given: ${fp.helpGiven}\n`;
        content += `- Help Received: ${fp.helpReceived}\n\n`;
      }

      // Add custom message
      if (shareMessage.trim()) {
        content += `**My Thoughts:**\n${shareMessage.trim()}\n\n`;
      }

      content += `What's your experience with ${currentTopic.title}? Any tips or questions?\n\n`;
      content += `[Study this topic](${window.location.origin}/topic/${topicId})`;

      await createThread({
        title,
        categoryId,
        content: {
          text: content,
          mathExpressions: [],
        },
      });

      // Update progress with forum activity
      const updatedProgress = updateProgressWithForumActivity(currentProgress, {
        threadsCreated: 1,
      });

      if (onProgressUpdate) {
        const newProgressArray = userProgress.map(p =>
          p.topicId === topicId ? updatedProgress : p
        );
        onProgressUpdate(newProgressArray);
      }

      setIsShareDialogOpen(false);
      setShareMessage('');
    } catch (error) {
      console.error('Failed to share progress:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!currentTopic || !currentProgress) {
    return null;
  }

  const progressPercentage = Math.round(currentProgress.progress * 100);
  const recentAchievements = achievements
    .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
    .slice(0, 3);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <TrendingUp className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle className='text-lg'>Your Progress</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {currentTopic.title} - {progressPercentage}% Complete
                </p>
              </div>
            </div>

            <Dialog
              open={isShareDialogOpen}
              onOpenChange={setIsShareDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2'
                >
                  <Share2 className='h-4 w-4' />
                  Share Progress
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Your Progress</DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                  <div className='p-4 bg-muted/50 rounded-lg'>
                    <h4 className='font-medium mb-2'>{currentTopic.title}</h4>
                    <div className='flex items-center gap-2 mb-2'>
                      <Progress value={progressPercentage} className='flex-1' />
                      <span className='text-sm font-medium'>
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                      <span>Level: {currentTopic.level}</span>
                      <span>
                        Last activity:{' '}
                        {currentProgress.lastActivity?.toLocaleDateString() ||
                          'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className='text-sm font-medium'>
                      Add a personal message (optional)
                    </label>
                    <Textarea
                      value={shareMessage}
                      onChange={e => setShareMessage(e.target.value)}
                      placeholder='Share your thoughts, challenges, or achievements...'
                      rows={3}
                      className='mt-1'
                    />
                  </div>

                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setIsShareDialogOpen(false)}
                      disabled={isSharing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleShareProgress}
                      disabled={isSharing}
                      className='flex items-center gap-2'
                    >
                      {isSharing ? (
                        <>
                          <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                          Sharing...
                        </>
                      ) : (
                        <>
                          <Share2 className='h-4 w-4' />
                          Share to Forum
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            {/* Progress Bar */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium'>Overall Progress</span>
                <span className='text-sm text-muted-foreground'>
                  {progressPercentage}%
                </span>
              </div>
              <Progress value={progressPercentage} className='h-2' />
            </div>

            {/* Progress Milestones */}
            <div>
              <h4 className='text-sm font-medium mb-3'>Milestones</h4>
              <div className='grid grid-cols-2 gap-2'>
                {progressMilestones.map(milestone => (
                  <div
                    key={milestone.percentage}
                    className={`p-3 rounded-lg border ${
                      milestone.achieved
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className='flex items-center gap-2 mb-1'>
                      {milestone.achieved ? (
                        <CheckCircle className='h-4 w-4 text-green-600' />
                      ) : (
                        <Target className='h-4 w-4 text-muted-foreground' />
                      )}
                      <span className='text-sm font-medium'>
                        {milestone.title}
                      </span>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {milestone.description}
                    </p>
                    {milestone.achieved && milestone.achievedAt && (
                      <p className='text-xs text-green-600 mt-1'>
                        Achieved {milestone.achievedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Forum Participation Stats */}
            {currentProgress.forumParticipation && (
              <div>
                <h4 className='text-sm font-medium mb-3'>Forum Activity</h4>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-primary'>
                      {currentProgress.forumParticipation.postsCount}
                    </div>
                    <div className='text-xs text-muted-foreground'>Posts</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-primary'>
                      {currentProgress.forumParticipation.helpGiven}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Help Given
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Trophy className='h-4 w-4' />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recentAchievements.map(achievement => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'
                  >
                    <div className='p-2 bg-primary/10 rounded-lg'>
                      <Icon className='h-4 w-4 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium text-sm'>
                        {achievement.title}
                      </h4>
                      <p className='text-xs text-muted-foreground'>
                        {achievement.description}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Earned {achievement.earnedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant='outline' className='text-xs'>
                      {achievement.category}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent className='p-4'>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                window.open(
                  `/community/category/${getCategoryForTopic(topicId)}`,
                  '_blank'
                )
              }
              className='flex items-center gap-2'
            >
              <MessageSquare className='h-3 w-3' />
              Discuss Topic
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => window.open(`/topic/${topicId}`, '_blank')}
              className='flex items-center gap-2'
            >
              <BookOpen className='h-3 w-3' />
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
