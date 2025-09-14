import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Flag, AlertCircle, Send } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface ReportSubmission {
  postId: number;
  reason: string;
  category: ReportCategory;
  details?: string;
}

export type ReportCategory =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'misinformation'
  | 'copyright'
  | 'other';

export interface PostReportDialogProps {
  postId: number;
  onSubmitReport: (report: ReportSubmission) => Promise<void>;
  trigger?: React.ReactNode;
  className?: string;
}

const REPORT_CATEGORIES = [
  {
    value: 'spam' as ReportCategory,
    label: 'Spam or Advertising',
    description: 'Unwanted promotional content or repetitive posts',
  },
  {
    value: 'harassment' as ReportCategory,
    label: 'Harassment or Abuse',
    description: 'Personal attacks, bullying, or threatening behavior',
  },
  {
    value: 'inappropriate_content' as ReportCategory,
    label: 'Inappropriate Content',
    description: 'Content that violates community guidelines',
  },
  {
    value: 'misinformation' as ReportCategory,
    label: 'Misinformation',
    description: 'False or misleading mathematical information',
  },
  {
    value: 'copyright' as ReportCategory,
    label: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
  },
  {
    value: 'other' as ReportCategory,
    label: 'Other',
    description: 'Other violations not covered above',
  },
];

/**
 * Dialog component for reporting posts with secure submission
 * Provides categorized reporting with detailed explanations
 */
export function PostReportDialog({
  postId,
  onSubmitReport,
  trigger,
  className,
}: PostReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory>('spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedCategory) {
      setError('Please select a report category');
      return;
    }

    if (selectedCategory === 'other' && !details.trim()) {
      setError('Please provide details for "Other" category');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedCategoryData = REPORT_CATEGORIES.find(
        cat => cat.value === selectedCategory
      );

      const report: ReportSubmission = {
        postId,
        reason: selectedCategoryData?.label || 'Other',
        category: selectedCategory,
        details: details.trim() || undefined,
      };

      await onSubmitReport(report);

      // Reset form and close dialog
      setSelectedCategory('spam');
      setDetails('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setError(null);
    }
  };

  const defaultTrigger = (
    <Button
      variant='ghost'
      size='sm'
      className='text-muted-foreground hover:text-destructive'
    >
      <Flag className='w-4 h-4 mr-1' />
      Report
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className={className}>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Flag className='w-5 h-5 text-red-500' />
            Report Post
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Report Category Selection */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>
              Why are you reporting this post? *
            </Label>

            <RadioGroup
              value={selectedCategory}
              onValueChange={value =>
                setSelectedCategory(value as ReportCategory)
              }
              className='space-y-2'
            >
              {REPORT_CATEGORIES.map(category => (
                <div
                  key={category.value}
                  className='flex items-start space-x-2'
                >
                  <RadioGroupItem
                    value={category.value}
                    id={category.value}
                    className='mt-1'
                  />
                  <div className='flex-1 space-y-1'>
                    <Label
                      htmlFor={category.value}
                      className='text-sm font-medium cursor-pointer'
                    >
                      {category.label}
                    </Label>
                    <p className='text-xs text-muted-foreground'>
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Details */}
          <div className='space-y-2'>
            <Label htmlFor='report-details' className='text-sm font-medium'>
              Additional Details {selectedCategory === 'other' && '*'}
            </Label>
            <Textarea
              id='report-details'
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder='Provide any additional context that would help moderators understand the issue...'
              className='min-h-[80px] text-sm'
              disabled={isSubmitting}
            />
            <p className='text-xs text-muted-foreground'>
              {selectedCategory === 'other'
                ? 'Please describe the issue in detail'
                : 'Optional: Provide additional context'}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className='flex items-center gap-2 text-sm text-destructive'>
              <AlertCircle className='w-4 h-4' />
              {error}
            </div>
          )}

          {/* Disclaimer */}
          <div className='p-3 bg-muted/50 rounded-md'>
            <p className='text-xs text-muted-foreground'>
              <strong>Note:</strong> False reports may result in action against
              your account. Reports are reviewed by moderators and handled
              according to community guidelines.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-2 pt-2'>
            <Button
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (selectedCategory === 'other' && !details.trim())
              }
              className='min-w-[100px]'
            >
              {isSubmitting ? (
                <>
                  <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className='w-4 h-4 mr-2' />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
