export interface ContentModerationResult {
  flagged: boolean;
  action: 'none' | 'flag' | 'hide' | 'delete';
  matchedFilters: string[];
  severity: 'low' | 'medium' | 'high' | null;
  warnings: string[];
  suggestions: string[];
}

export interface ContentModerationOptions {
  checkSpelling?: boolean;
  checkProfanity?: boolean;
  checkSpam?: boolean;
  mathContentOnly?: boolean;
}

/**
 * Client-side content moderation utilities
 * Provides immediate feedback during content creation
 */
export class ContentModerationService {
  private static instance: ContentModerationService;
  private keywordFilters: Map<string, { action: string; severity: string }> =
    new Map();
  private lastFilterUpdate = 0;
  private readonly FILTER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ContentModerationService {
    if (!ContentModerationService.instance) {
      ContentModerationService.instance = new ContentModerationService();
    }
    return ContentModerationService.instance;
  }

  /**
   * Moderate content and provide immediate feedback
   */
  async moderateContent(
    content: string,
    options: ContentModerationOptions = {}
  ): Promise<ContentModerationResult> {
    const result: ContentModerationResult = {
      flagged: false,
      action: 'none',
      matchedFilters: [],
      severity: null,
      warnings: [],
      suggestions: [],
    };

    if (!content.trim()) {
      return result;
    }

    // Update filters if needed
    await this.updateFiltersIfNeeded();

    // Check against keyword filters
    await this.checkKeywordFilters(content, result);

    // Check for spam patterns
    if (options.checkSpam !== false) {
      this.checkSpamPatterns(content, result);
    }

    // Check for profanity (basic client-side check)
    if (options.checkProfanity !== false) {
      this.checkProfanity(content, result);
    }

    // Math content specific checks
    if (options.mathContentOnly) {
      this.checkMathContent(content, result);
    }

    // Provide constructive suggestions
    this.generateSuggestions(content, result);

    return result;
  }

  /**
   * Get real-time content warnings as user types
   */
  async getTypingWarnings(content: string): Promise<string[]> {
    const warnings: string[] = [];

    if (content.length > 5000) {
      warnings.push(
        'Post is getting quite long. Consider breaking it into smaller parts.'
      );
    }

    if (content.includes('http://') || content.includes('https://')) {
      const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
      if (linkCount > 3) {
        warnings.push(
          'Multiple links detected. This might be flagged as spam.'
        );
      }
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.3 && content.length > 50) {
      warnings.push(
        'Excessive capital letters detected. Consider using normal case.'
      );
    }

    // Check for repeated characters
    if (/(.)\1{4,}/.test(content)) {
      warnings.push('Repeated characters detected. This might appear as spam.');
    }

    return warnings;
  }

  /**
   * Check if content needs manual review
   */
  needsManualReview(result: ContentModerationResult): boolean {
    return (
      result.flagged &&
      (result.severity === 'high' || result.matchedFilters.length > 2)
    );
  }

  /**
   * Get user-friendly explanation of moderation result
   */
  getExplanation(result: ContentModerationResult): string {
    if (!result.flagged) {
      return 'Content looks good!';
    }

    const explanations: string[] = [];

    if (result.matchedFilters.length > 0) {
      explanations.push(
        `Matched ${result.matchedFilters.length} content filter(s)`
      );
    }

    switch (result.action) {
      case 'flag':
        explanations.push('Content will be flagged for moderator review');
        break;
      case 'hide':
        explanations.push('Content may be automatically hidden');
        break;
      case 'delete':
        explanations.push('Content may be automatically deleted');
        break;
    }

    return explanations.join('. ') + '.';
  }

  // Private methods

  private async updateFiltersIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFilterUpdate < this.FILTER_CACHE_DURATION) {
      return;
    }

    try {
      const response = await fetch('/api/forum/moderation/keyword-filters', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const filters = data.data || [];

        this.keywordFilters.clear();
        filters.forEach((filter: any) => {
          if (filter.isActive) {
            filter.keywords.forEach((keyword: string) => {
              this.keywordFilters.set(keyword.toLowerCase(), {
                action: filter.action,
                severity: filter.severity,
              });
            });
          }
        });

        this.lastFilterUpdate = now;
      }
    } catch (error) {
      console.error('Failed to update content filters:', error);
    }
  }

  private async checkKeywordFilters(
    content: string,
    result: ContentModerationResult
  ): Promise<void> {
    const contentLower = content.toLowerCase();
    const matchedFilters: string[] = [];
    let highestSeverity: 'low' | 'medium' | 'high' | null = null;
    let strongestAction: 'none' | 'flag' | 'hide' | 'delete' = 'none';

    for (const [keyword, filter] of this.keywordFilters) {
      if (contentLower.includes(keyword)) {
        matchedFilters.push(keyword);

        // Determine highest severity
        if (
          !highestSeverity ||
          this.compareSeverity(filter.severity, highestSeverity) > 0
        ) {
          highestSeverity = filter.severity as 'low' | 'medium' | 'high';
        }

        // Determine strongest action
        if (this.compareAction(filter.action, strongestAction) > 0) {
          strongestAction = filter.action as 'flag' | 'hide' | 'delete';
        }
      }
    }

    if (matchedFilters.length > 0) {
      result.flagged = true;
      result.matchedFilters = matchedFilters;
      result.severity = highestSeverity;
      result.action = strongestAction;
    }
  }

  private checkSpamPatterns(
    content: string,
    result: ContentModerationResult
  ): void {
    const spamIndicators: string[] = [];

    // Check for excessive repetition
    const words = content.toLowerCase().split(/\s+/);
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 3) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    for (const [word, count] of wordCount) {
      if (count > 5) {
        spamIndicators.push(`Repeated word: "${word}"`);
      }
    }

    // Check for excessive links
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 5) {
      spamIndicators.push('Too many links');
    }

    // Check for promotional language
    const promoWords = [
      'buy now',
      'click here',
      'limited time',
      'act now',
      'free money',
    ];
    const foundPromo = promoWords.filter(word =>
      content.toLowerCase().includes(word)
    );
    if (foundPromo.length > 0) {
      spamIndicators.push('Promotional language detected');
    }

    if (spamIndicators.length > 0) {
      result.flagged = true;
      result.warnings.push(...spamIndicators);
      if (!result.severity || result.severity === 'low') {
        result.severity = 'medium';
      }
    }
  }

  private checkProfanity(
    content: string,
    result: ContentModerationResult
  ): void {
    // Basic profanity check - in production, use a proper library
    const basicProfanity = ['damn', 'hell', 'crap']; // Very basic list
    const contentLower = content.toLowerCase();

    const foundProfanity = basicProfanity.filter(word =>
      contentLower.includes(word)
    );

    if (foundProfanity.length > 0) {
      result.warnings.push('Potentially inappropriate language detected');
    }
  }

  private checkMathContent(
    content: string,
    result: ContentModerationResult
  ): void {
    // Check if content contains math expressions
    const hasMath = /\\\(.*?\\\)|\\\[.*?\\\]|\$.*?\$/.test(content);
    const hasText =
      content.replace(/\\\(.*?\\\)|\\\[.*?\\\]|\$.*?\$/g, '').trim().length > 0;

    if (!hasMath && hasText) {
      result.suggestions.push(
        'Consider adding mathematical expressions using LaTeX syntax (\\(...\\) for inline, \\[...\\] for display)'
      );
    }

    // Check for common LaTeX errors
    const commonErrors = [
      {
        pattern: /\$\$.*?\$\$/,
        suggestion: 'Use \\[...\\] instead of $$...$$ for display math',
      },
      {
        pattern: /\$[^$]*\$/,
        suggestion: 'Use \\(...\\) instead of $...$ for inline math',
      },
    ];

    commonErrors.forEach(({ pattern, suggestion }) => {
      if (pattern.test(content)) {
        result.suggestions.push(suggestion);
      }
    });
  }

  private generateSuggestions(
    content: string,
    result: ContentModerationResult
  ): void {
    // Length suggestions
    if (content.length < 20) {
      result.suggestions.push('Consider adding more detail to your post');
    }

    // Math formatting suggestions
    if (content.includes('sqrt') || content.includes('integral')) {
      result.suggestions.push(
        'Consider using LaTeX for mathematical expressions (e.g., \\sqrt{x}, \\int)'
      );
    }

    // Readability suggestions
    if (content.length > 1000 && !content.includes('\n\n')) {
      result.suggestions.push(
        'Consider breaking long text into paragraphs for better readability'
      );
    }
  }

  private compareSeverity(a: string, b: string): number {
    const severityOrder = { low: 1, medium: 2, high: 3 };
    return (
      (severityOrder[a as keyof typeof severityOrder] || 0) -
      (severityOrder[b as keyof typeof severityOrder] || 0)
    );
  }

  private compareAction(a: string, b: string): number {
    const actionOrder = { none: 0, flag: 1, hide: 2, delete: 3 };
    return (
      (actionOrder[a as keyof typeof actionOrder] || 0) -
      (actionOrder[b as keyof typeof actionOrder] || 0)
    );
  }
}

// Export singleton instance
export const contentModerationService = ContentModerationService.getInstance();
