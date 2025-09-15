import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Shield,
  Flag,
  AlertTriangle,
  Clock,
  User,
  FileText,
  Filter,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useModeration } from '../hooks/useModeration';
import { ForumReport } from '../types';

export interface KeywordFilter {
  id?: number;
  keywords: string[];
  action: 'flag' | 'auto_hide' | 'auto_delete';
  severity: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  targetType: 'post' | 'thread' | 'user' | 'report' | 'system';
  targetId: number;
  moderatorId: number;
  moderatorUsername?: string;
  reason: string;
  duration?: number;
  metadata?: any;
  createdAt: Date;
}

export interface ModerationDashboardProps {
  userRole: 'member' | 'moderator' | 'admin';
  className?: string;
}

/**
 * Comprehensive moderation dashboard for content management
 * Provides tools for reports, audit logs, and keyword filtering
 */
export function ModerationDashboard({
  userRole,
  className,
}: ModerationDashboardProps) {
  const [reports, setReports] = useState<ForumReport[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [keywordFilters, setKeywordFilters] = useState<KeywordFilter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  const { resolveReport, clearError } = useModeration();

  // Check if user has moderation permissions
  const canModerate = userRole === 'moderator' || userRole === 'admin';
  const canAdmin = userRole === 'admin';

  if (!canModerate) {
    return (
      <Card className={cn('border-red-200 bg-red-50/50', className)}>
        <CardContent className='p-6 text-center'>
          <Shield className='w-12 h-12 text-red-400 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-red-800 mb-2'>
            Access Denied
          </h3>
          <p className='text-red-600'>
            You don't have permission to access moderation tools.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Load data on component mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab, filterStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'reports':
          await loadReports();
          break;
        case 'audit':
          await loadAuditLog();
          break;
        case 'filters':
          await loadKeywordFilters();
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch(
        `/api/forum/moderation/reports?status=${filterStatus}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.data.reports || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const loadAuditLog = async () => {
    try {
      const response = await fetch(
        '/api/forum/moderation/audit-log?limit=100',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAuditLog(data.data.actions || []);
      }
    } catch (error) {
      console.error('Failed to load audit log:', error);
    }
  };

  const loadKeywordFilters = async () => {
    try {
      const response = await fetch('/api/forum/moderation/keyword-filters', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKeywordFilters(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load keyword filters:', error);
    }
  };

  const handleResolveReport = async (
    reportId: number,
    action: 'resolved' | 'dismissed'
  ) => {
    try {
      await resolveReport(reportId, action);
      await loadReports(); // Refresh reports
    } catch (error) {
      console.error('Failed to resolve report:', error);
    }
  };

  const filteredReports = reports.filter(
    report =>
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuditLog = auditLog.filter(
    entry =>
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.moderatorUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className={cn('border-orange-200 bg-orange-50/50', className)}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Shield className='w-6 h-6 text-orange-600' />
            <CardTitle className='text-xl text-orange-800'>
              Moderation Dashboard
            </CardTitle>
            <Badge variant='outline' className='text-xs'>
              {userRole}
            </Badge>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='reports'>
              Reports
              {reports.filter(r => r.status === 'pending').length > 0 && (
                <Badge variant='destructive' className='ml-2 text-xs'>
                  {reports.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='audit'>Audit Log</TabsTrigger>
            <TabsTrigger value='filters'>Keyword Filters</TabsTrigger>
          </TabsList>

          {/* Search and Filter Controls */}
          <div className='flex gap-4 my-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  placeholder='Search...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            {activeTab === 'reports' && (
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='resolved'>Resolved</SelectItem>
                  <SelectItem value='dismissed'>Dismissed</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Reports Tab */}
          <TabsContent value='reports' className='space-y-4'>
            {isLoading ? (
              <div className='text-center py-8'>
                <RefreshCw className='w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground' />
                <p className='text-muted-foreground'>Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className='text-center py-8'>
                <Flag className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-muted-foreground'>
                  No {filterStatus} reports found
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {filteredReports.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onResolve={handleResolveReport}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value='audit' className='space-y-4'>
            {isLoading ? (
              <div className='text-center py-8'>
                <RefreshCw className='w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground' />
                <p className='text-muted-foreground'>Loading audit log...</p>
              </div>
            ) : filteredAuditLog.length === 0 ? (
              <div className='text-center py-8'>
                <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-muted-foreground'>No audit entries found</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {filteredAuditLog.map(entry => (
                  <AuditLogCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Keyword Filters Tab */}
          <TabsContent value='filters' className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Content Filters</h3>
              <KeywordFilterDialog onSave={loadKeywordFilters} />
            </div>

            {isLoading ? (
              <div className='text-center py-8'>
                <RefreshCw className='w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground' />
                <p className='text-muted-foreground'>Loading filters...</p>
              </div>
            ) : keywordFilters.length === 0 ? (
              <div className='text-center py-8'>
                <Filter className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-muted-foreground'>
                  No keyword filters configured
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {keywordFilters.map(filter => (
                  <KeywordFilterCard
                    key={filter.id}
                    filter={filter}
                    onUpdate={loadKeywordFilters}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Report Card Component
interface ReportCardProps {
  report: ForumReport;
  onResolve: (
    reportId: number,
    action: 'resolved' | 'dismissed'
  ) => Promise<void>;
}

function ReportCard({ report, onResolve }: ReportCardProps) {
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async (action: 'resolved' | 'dismissed') => {
    setIsResolving(true);
    try {
      await onResolve(report.id!, action);
    } finally {
      setIsResolving(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'spam':
        return 'bg-yellow-100 text-yellow-800';
      case 'harassment':
        return 'bg-red-100 text-red-800';
      case 'inappropriate_content':
        return 'bg-orange-100 text-orange-800';
      case 'misinformation':
        return 'bg-purple-100 text-purple-800';
      case 'copyright':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className='border-l-4 border-l-red-400'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2 flex-1'>
            <div className='flex items-center gap-2'>
              <Flag className='w-4 h-4 text-red-500' />
              <span className='font-medium text-sm'>Report #{report.id}</span>
              <Badge
                className={cn('text-xs', getCategoryColor(report.category))}
              >
                {report.category.replace('_', ' ')}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {report.status}
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground'>{report.reason}</p>
            {report.details && (
              <p className='text-xs text-muted-foreground italic'>
                Details: {report.details}
              </p>
            )}
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <span>Post #{report.postId}</span>
              <span>Reporter #{report.reporterId}</span>
              <span>{new Date(report.createdAt!).toLocaleString()}</span>
            </div>
          </div>

          {report.status === 'pending' && (
            <div className='flex gap-2 ml-4'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleResolve('resolved')}
                disabled={isResolving}
              >
                Resolve
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => handleResolve('dismissed')}
                disabled={isResolving}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Audit Log Card Component
interface AuditLogCardProps {
  entry: AuditLogEntry;
}

function AuditLogCard({ entry }: AuditLogCardProps) {
  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('ban')) {
      return 'bg-red-100 text-red-800';
    } else if (action.includes('lock') || action.includes('hide')) {
      return 'bg-orange-100 text-orange-800';
    } else if (action.includes('resolve')) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2 flex-1'>
            <div className='flex items-center gap-2'>
              <Clock className='w-4 h-4 text-muted-foreground' />
              <Badge className={cn('text-xs', getActionColor(entry.action))}>
                {entry.action.replace('_', ' ')}
              </Badge>
              <span className='text-sm font-medium'>
                {entry.targetType} #{entry.targetId}
              </span>
            </div>
            <p className='text-sm text-muted-foreground'>{entry.reason}</p>
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <span>
                By: {entry.moderatorUsername || `User #${entry.moderatorId}`}
              </span>
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
              {entry.duration && <span>Duration: {entry.duration}h</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Keyword Filter Card Component
interface KeywordFilterCardProps {
  filter: KeywordFilter;
  onUpdate: () => void;
}

function KeywordFilterCard({ filter, onUpdate }: KeywordFilterCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'auto_delete':
        return 'bg-red-100 text-red-800';
      case 'auto_hide':
        return 'bg-orange-100 text-orange-800';
      case 'flag':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2 flex-1'>
            <div className='flex items-center gap-2'>
              <Filter className='w-4 h-4 text-muted-foreground' />
              <Badge
                className={cn('text-xs', getSeverityColor(filter.severity))}
              >
                {filter.severity}
              </Badge>
              <Badge className={cn('text-xs', getActionColor(filter.action))}>
                {filter.action.replace('_', ' ')}
              </Badge>
              {filter.isActive ? (
                <Badge variant='outline' className='text-xs text-green-600'>
                  Active
                </Badge>
              ) : (
                <Badge variant='outline' className='text-xs text-gray-600'>
                  Inactive
                </Badge>
              )}
            </div>
            <div className='flex flex-wrap gap-1'>
              {filter.keywords.map((keyword, index) => (
                <Badge key={index} variant='secondary' className='text-xs'>
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className='text-xs text-muted-foreground'>
              Created:{' '}
              {filter.createdAt
                ? new Date(filter.createdAt).toLocaleString()
                : 'Unknown'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Keyword Filter Dialog Component
interface KeywordFilterDialogProps {
  onSave: () => void;
}

function KeywordFilterDialog({ onSave }: KeywordFilterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [action, setAction] = useState<'flag' | 'auto_hide' | 'auto_delete'>(
    'flag'
  );
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!keywords.trim()) return;

    setIsSubmitting(true);
    try {
      const keywordList = keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const response = await fetch('/api/forum/moderation/keyword-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          keywords: keywordList,
          action,
          severity,
        }),
      });

      if (response.ok) {
        setKeywords('');
        setAction('flag');
        setSeverity('medium');
        setIsOpen(false);
        onSave();
      }
    } catch (error) {
      console.error('Failed to save keyword filter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='w-4 h-4 mr-2' />
          Add Filter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Keyword Filter</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='keywords'>Keywords (comma-separated)</Label>
            <Textarea
              id='keywords'
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder='spam, inappropriate, offensive'
              className='min-h-[80px]'
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Action</Label>
              <Select value={action} onValueChange={setAction as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='flag'>Flag for Review</SelectItem>
                  <SelectItem value='auto_hide'>Auto Hide</SelectItem>
                  <SelectItem value='auto_delete'>Auto Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low'>Low</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !keywords.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Filter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
