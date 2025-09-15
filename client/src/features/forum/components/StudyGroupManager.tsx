import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Users,
  Plus,
  Calendar,
  BookOpen,
  MessageSquare,
  Star,
  Clock,
  Target,
  TrendingUp,
  UserPlus,
  Settings,
} from 'lucide-react';
import {
  generateStudyGroupSuggestions,
  getTopicCategoryMapping,
  createTopicDeepLink,
  StudyGroupData,
  CurriculumProgress,
} from '../lib/curriculum-integration';
import topicsData from '../../../data/topicsData.json';

interface StudyGroupManagerProps {
  currentTopicId?: string;
  userProgress?: CurriculumProgress[];
  className?: string;
}

interface StudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number; // minutes
  topicId: string;
  maxParticipants: number;
  currentParticipants: number;
  isRecurring: boolean;
  meetingLink?: string;
}

const STUDY_GROUP_TYPES = [
  { value: 'homework', label: 'Homework Help', icon: BookOpen },
  { value: 'concept', label: 'Concept Review', icon: Target },
  { value: 'practice', label: 'Practice Problems', icon: TrendingUp },
  { value: 'exam-prep', label: 'Exam Preparation', icon: Star },
];

export function StudyGroupManager({
  currentTopicId,
  userProgress = [],
  className = '',
}: StudyGroupManagerProps) {
  const [studyGroups, setStudyGroups] = useState<StudyGroupData[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<StudySession[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'groups' | 'sessions'>(
    'groups'
  );

  // Form state for creating study groups
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupTopic, setNewGroupTopic] = useState('');
  const [newGroupType, setNewGroupType] = useState('');

  const topics = topicsData as any[];
  const topicMapping = getTopicCategoryMapping();

  useEffect(() => {
    loadStudyGroupData();
  }, [currentTopicId, userProgress]);

  const loadStudyGroupData = async () => {
    setIsLoading(true);
    try {
      // Generate study group suggestions
      const suggestions = generateStudyGroupSuggestions(
        userProgress,
        currentTopicId
      );
      setStudyGroups(suggestions);

      // Mock upcoming sessions data
      const mockSessions: StudySession[] = [
        {
          id: 'session-1',
          groupId: suggestions[0]?.id || 'group-1',
          title: 'Algebra Problem Solving',
          description: 'Working through quadratic equations and factoring',
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          duration: 60,
          topicId: 'algebra',
          maxParticipants: 8,
          currentParticipants: 5,
          isRecurring: true,
        },
        {
          id: 'session-2',
          groupId: suggestions[1]?.id || 'group-2',
          title: 'Calculus Study Session',
          description: 'Derivatives and limits practice',
          scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          duration: 90,
          topicId: 'calculus',
          maxParticipants: 6,
          currentParticipants: 3,
          isRecurring: false,
        },
      ];
      setUpcomingSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load study group data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !newGroupTopic || !newGroupType) return;

    try {
      const newGroup: StudyGroupData = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        topicId: newGroupTopic,
        categoryId:
          topicMapping.find(m => m.topicId === newGroupTopic)?.categoryId || 1,
        memberCount: 1, // Creator is first member
        isActive: true,
        createdAt: new Date(),
        description: newGroupDescription || undefined,
      };

      setStudyGroups(prev => [newGroup, ...prev]);

      // Reset form
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupTopic('');
      setNewGroupType('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create study group:', error);
    }
  };

  const handleJoinGroup = (groupId: string) => {
    setStudyGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? { ...group, memberCount: group.memberCount + 1 }
          : group
      )
    );
  };

  const handleJoinSession = (sessionId: string) => {
    setUpcomingSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, currentParticipants: session.currentParticipants + 1 }
          : session
      )
    );
  };

  const getTopicTitle = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    return topic?.title || topicId;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className='p-6'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading study groups...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <Users className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle className='text-lg'>Study Groups</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Collaborate with others on your learning journey
                </p>
              </div>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Create Group
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Study Group</DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium'>Group Name</label>
                    <Input
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      placeholder='e.g., Algebra Study Buddies'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium'>Topic</label>
                    <Select
                      value={newGroupTopic}
                      onValueChange={setNewGroupTopic}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a topic...' />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map(topic => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className='text-sm font-medium'>Group Type</label>
                    <Select
                      value={newGroupType}
                      onValueChange={setNewGroupType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select group type...' />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDY_GROUP_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className='text-sm font-medium'>
                      Description (Optional)
                    </label>
                    <Textarea
                      value={newGroupDescription}
                      onChange={e => setNewGroupDescription(e.target.value)}
                      placeholder='Describe what your group will focus on...'
                      rows={3}
                    />
                  </div>

                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateGroup}
                      disabled={
                        !newGroupName.trim() || !newGroupTopic || !newGroupType
                      }
                    >
                      Create Group
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className='flex gap-2'>
        <Button
          variant={selectedTab === 'groups' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('groups')}
          className='flex items-center gap-2'
        >
          <Users className='h-4 w-4' />
          Study Groups ({studyGroups.length})
        </Button>
        <Button
          variant={selectedTab === 'sessions' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('sessions')}
          className='flex items-center gap-2'
        >
          <Calendar className='h-4 w-4' />
          Upcoming Sessions ({upcomingSessions.length})
        </Button>
      </div>

      {/* Study Groups Tab */}
      {selectedTab === 'groups' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {studyGroups.map(group => (
            <Card key={group.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='p-4'>
                <div className='space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='font-semibold'>{group.name}</h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {group.description ||
                          `Study group for ${getTopicTitle(group.topicId)}`}
                      </p>
                    </div>
                    <Badge
                      variant={group.isActive ? 'default' : 'secondary'}
                      className='text-xs'
                    >
                      {group.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <Users className='h-3 w-3' />
                      {group.memberCount} members
                    </div>
                    <div className='flex items-center gap-1'>
                      <BookOpen className='h-3 w-3' />
                      {getTopicTitle(group.topicId)}
                    </div>
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div className='text-xs text-muted-foreground'>
                      Created {group.createdAt.toLocaleDateString()}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          window.open(
                            createTopicDeepLink(group.topicId),
                            '_blank'
                          )
                        }
                        className='flex items-center gap-1'
                      >
                        <BookOpen className='h-3 w-3' />
                        Topic
                      </Button>
                      <Button
                        size='sm'
                        onClick={() => handleJoinGroup(group.id)}
                        className='flex items-center gap-1'
                      >
                        <UserPlus className='h-3 w-3' />
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {studyGroups.length === 0 && (
            <div className='col-span-full text-center py-8'>
              <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='font-semibold mb-2'>No Study Groups Yet</h3>
              <p className='text-muted-foreground mb-4'>
                Create the first study group for your topic or join existing
                ones.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Create Study Group
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Study Sessions Tab */}
      {selectedTab === 'sessions' && (
        <div className='space-y-4'>
          {upcomingSessions.map(session => (
            <Card
              key={session.id}
              className='hover:shadow-md transition-shadow'
            >
              <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h3 className='font-semibold'>{session.title}</h3>
                      {session.isRecurring && (
                        <Badge variant='outline' className='text-xs'>
                          Recurring
                        </Badge>
                      )}
                    </div>

                    <p className='text-sm text-muted-foreground mb-3'>
                      {session.description}
                    </p>

                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {session.scheduledAt.toLocaleDateString()}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {session.duration} minutes
                      </div>
                      <div className='flex items-center gap-1'>
                        <Users className='h-3 w-3' />
                        {session.currentParticipants}/{session.maxParticipants}
                      </div>
                      <div className='flex items-center gap-1'>
                        <BookOpen className='h-3 w-3' />
                        {getTopicTitle(session.topicId)}
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleJoinSession(session.id)}
                      disabled={
                        session.currentParticipants >= session.maxParticipants
                      }
                      className='flex items-center gap-1'
                    >
                      <UserPlus className='h-3 w-3' />
                      {session.currentParticipants >= session.maxParticipants
                        ? 'Full'
                        : 'Join'}
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        window.open(
                          createTopicDeepLink(session.topicId),
                          '_blank'
                        )
                      }
                      className='flex items-center gap-1'
                    >
                      <BookOpen className='h-3 w-3' />
                      Topic
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {upcomingSessions.length === 0 && (
            <div className='text-center py-8'>
              <Calendar className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='font-semibold mb-2'>No Upcoming Sessions</h3>
              <p className='text-muted-foreground'>
                Join a study group to participate in scheduled study sessions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
