import { renderHook, act } from '@testing-library/react';
import { useProgressTracker } from '../useProgressTracker';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('useProgressTracker', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('should initialize with empty progress', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProgressTracker());
    
    expect(result.current.userProgress.completedTopics).toEqual([]);
    expect(result.current.userProgress.topicProgress).toEqual({});
  });

  it('should mark lesson section as completed', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProgressTracker());
    
    act(() => {
      result.current.markLessonSectionCompleted('algebra', 'section-1');
    });
    
    const topicProgress = result.current.getTopicProgress('algebra');
    expect(topicProgress.lessonSectionsCompleted).toContain('section-1');
  });

  it('should mark practice problem as completed', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProgressTracker());
    
    act(() => {
      result.current.markPracticeCompleted('algebra', 'problem-1');
    });
    
    const topicProgress = result.current.getTopicProgress('algebra');
    expect(topicProgress.practiceProblemsCompleted).toContain('problem-1');
  });

  it('should calculate completion percentage correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProgressTracker());
    
    act(() => {
      result.current.markLessonSectionCompleted('algebra', 'section-1');
      result.current.markPracticeCompleted('algebra', 'problem-1');
    });
    
    const percentage = result.current.getTopicCompletionPercentage('algebra', 2, 2);
    expect(percentage).toBe(50); // 1/2 lessons + 1/2 problems = 50%
  });

  it('should mark topic as completed', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProgressTracker());
    
    act(() => {
      result.current.markTopicCompleted('algebra');
    });
    
    expect(result.current.isTopicCompleted('algebra')).toBe(true);
  });

  it('should calculate progress stats correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProgressTracker());
    
    act(() => {
      result.current.markTopicCompleted('algebra');
      result.current.markLessonSectionCompleted('geometry', 'section-1');
    });
    
    const stats = result.current.getProgressStats();
    expect(stats.totalTopicsStarted).toBe(2);
    expect(stats.totalTopicsCompleted).toBe(1);
    expect(stats.completionRate).toBe(50);
  });
});