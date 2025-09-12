import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Users,
  MessageSquare,
  BookOpen,
  Trophy,
  Calendar,
  Search,
  Filter,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  User,
} from "lucide-react";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  topic: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  likes: number;
  replies: number;
  timestamp: Date;
  tags: string[];
  solved?: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  members: number;
  maxMembers: number;
  nextSession: Date;
  difficulty: string;
}

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState<
    "discussions" | "study-groups" | "achievements"
  >("discussions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");

  // Mock data - in a real app, this would come from your backend
  const discussions: CommunityPost[] = [
    {
      id: "1",
      title: "Help with quadratic formula derivation",
      content:
        "I'm struggling to understand how we get from completing the square to the quadratic formula. Can someone walk me through the steps?",
      author: "MathLearner23",
      topic: "Algebra",
      difficulty: 2,
      likes: 12,
      replies: 8,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      tags: ["quadratic", "algebra", "help-needed"],
      solved: false,
    },
    {
      id: "2",
      title: "Beautiful proof of Euler's identity",
      content:
        "Just wanted to share this elegant proof I found that connects e^(iπ) + 1 = 0. The way it brings together exponentials, trigonometry, and complex numbers is amazing!",
      author: "EulerFan",
      topic: "Advanced",
      difficulty: 5,
      likes: 45,
      replies: 15,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      tags: ["euler", "complex-numbers", "proof", "beautiful-math"],
      solved: true,
    },
    {
      id: "3",
      title: "Calculus study group forming",
      content:
        "Looking for 3-4 people to form a weekly calculus study group. We'll work through derivatives, integrals, and applications together.",
      author: "StudyBuddy",
      topic: "Calculus",
      difficulty: 3,
      likes: 8,
      replies: 12,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      tags: ["study-group", "calculus", "collaboration"],
    },
  ];

  const studyGroups: StudyGroup[] = [
    {
      id: "1",
      name: "Linear Algebra Explorers",
      description:
        "Weekly sessions covering matrices, vector spaces, and eigenvalues. Perfect for beginners to intermediate learners.",
      topic: "Linear Algebra",
      members: 6,
      maxMembers: 8,
      nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      difficulty: "Intermediate",
    },
    {
      id: "2",
      name: "Calculus Problem Solvers",
      description:
        "Tackle challenging calculus problems together. We focus on real-world applications and exam preparation.",
      topic: "Calculus",
      members: 4,
      maxMembers: 6,
      nextSession: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      difficulty: "Advanced",
    },
    {
      id: "3",
      name: "Statistics & Data Science",
      description:
        "Learn statistics fundamentals and apply them to data science projects. Hands-on approach with real datasets.",
      topic: "Statistics",
      members: 8,
      maxMembers: 10,
      nextSession: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      difficulty: "Beginner to Intermediate",
    },
  ];

  const topics = [
    "all",
    "Algebra",
    "Calculus",
    "Geometry",
    "Statistics",
    "Advanced",
    "LaTeX",
    "MATLAB",
  ];

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: "difficulty1",
      2: "difficulty2",
      3: "difficulty3",
      4: "difficulty4",
      5: "difficulty5",
    };
    return colors[difficulty as keyof typeof colors];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const formatUpcoming = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) return `In ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `In ${diffInDays}d`;
  };

  const filteredDiscussions = discussions.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesTopic =
      selectedTopic === "all" || post.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4"
            data-testid="community-main-heading"
          >
            Math Farm Community
          </h1>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            data-testid="community-main-description"
          >
            Connect with fellow math enthusiasts, get help with problems, join
            study groups, and share your mathematical discoveries.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div
                className="text-2xl font-bold"
                data-testid="community-stats-members-count"
              >
                1,247
              </div>
              <div
                className="text-sm text-muted-foreground"
                data-testid="community-stats-members-label"
              >
                Active Members
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div
                className="text-2xl font-bold"
                data-testid="community-stats-discussions-count"
              >
                3,891
              </div>
              <div
                className="text-sm text-muted-foreground"
                data-testid="community-stats-discussions-label"
              >
                Discussions
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div
                className="text-2xl font-bold"
                data-testid="community-stats-groups-count"
              >
                156
              </div>
              <div
                className="text-sm text-muted-foreground"
                data-testid="community-stats-groups-label"
              >
                Study Groups
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div
                className="text-2xl font-bold"
                data-testid="community-stats-solved-count"
              >
                2,103
              </div>
              <div
                className="text-sm text-muted-foreground"
                data-testid="community-stats-solved-label"
              >
                Problems Solved
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === "discussions" ? "default" : "outline"}
            onClick={() => setActiveTab("discussions")}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Discussions
          </Button>
          <Button
            variant={activeTab === "study-groups" ? "default" : "outline"}
            onClick={() => setActiveTab("study-groups")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Study Groups
          </Button>
          <Button
            variant={activeTab === "achievements" ? "default" : "outline"}
            onClick={() => setActiveTab("achievements")}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Achievements
          </Button>
        </div>

        {/* Discussions Tab */}
        {activeTab === "discussions" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions, topics, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic === "all" ? "All Topics" : topic}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>
            </div>

            {/* Discussion Posts */}
            <div className="space-y-4">
              {filteredDiscussions.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{post.author}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(post.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{post.topic}</Badge>
                        <Badge variant={getDifficultyColor(post.difficulty)}>
                          Level {post.difficulty}
                        </Badge>
                        {post.solved && (
                          <Badge variant="default" className="bg-green-500">
                            Solved
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-muted-foreground mb-4">{post.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          {post.replies}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Study Groups Tab */}
        {activeTab === "study-groups" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Active Study Groups</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyGroups.map((group) => (
                <Card
                  key={group.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{group.name}</span>
                      <Badge variant="outline">{group.topic}</Badge>
                    </CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Members:</span>
                        <span>
                          {group.members}/{group.maxMembers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Difficulty:
                        </span>
                        <Badge variant="secondary">{group.difficulty}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Next Session:
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatUpcoming(group.nextSession)}
                        </span>
                      </div>
                      <Button
                        className="w-full"
                        variant={
                          group.members >= group.maxMembers
                            ? "outline"
                            : "default"
                        }
                      >
                        {group.members >= group.maxMembers
                          ? "Full"
                          : "Join Group"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Community Achievements
              </h2>
              <p className="text-muted-foreground">
                Celebrate learning milestones and recognize outstanding
                community contributions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Achievement categories */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="font-semibold mb-2">Problem Solver</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Help others by solving their math problems
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">Bronze: 5 solutions</Badge>
                    <Badge variant="outline">Silver: 25 solutions</Badge>
                    <Badge variant="outline">Gold: 100 solutions</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="font-semibold mb-2">Community Builder</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create and lead successful study groups
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">Bronze: 1 group</Badge>
                    <Badge variant="outline">Silver: 3 groups</Badge>
                    <Badge variant="outline">Gold: 10 groups</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-semibold mb-2">Knowledge Sharer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share helpful resources and explanations
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">Bronze: 10 posts</Badge>
                    <Badge variant="outline">Silver: 50 posts</Badge>
                    <Badge variant="outline">Gold: 200 posts</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Latest community milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <div className="font-medium">
                        MathExpert42 earned "Gold Problem Solver"
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Solved 100+ community problems
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium">
                        StudyLeader earned "Silver Community Builder"
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Successfully led 3 study groups
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <BookOpen className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="font-medium">
                        MathTeacher earned "Bronze Knowledge Sharer"
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Shared 10+ helpful explanations
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
