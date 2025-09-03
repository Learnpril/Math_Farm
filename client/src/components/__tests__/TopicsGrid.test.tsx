import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicsGrid } from '../TopicsGrid';

// Mock the TopicCard component
vi.mock('../TopicCard', () => ({
  TopicCard: ({ topic, onClick }: { topic: any; onClick: (id: string) => void }) => (
    <div 
      data-testid={`topic-card-${topic.id}`}
      onClick={() => onClick(topic.id)}
      role="button"
    >
      {topic.title}
    </div>
  ),
}));

// Mock the topics data
vi.mock('../data/topicsData.json', () => ({
  default: [
    {
      id: 'algebra',
      title: 'Algebra',
      description: 'Test description',
      level: 'middle',
      icon: 'Variable',
      mathExpression: 'x + y = z',
      prerequisites: [],
      estimatedTime: 60,
      difficulty: 2,
    },
    {
      id: 'geometry',
      title: 'Geometry',
      description: 'Test description',
      level: 'middle',
      icon: 'Triangle',
      mathExpression: 'A = πr²',
      prerequisites: [],
      estimatedTime: 55,
      difficulty: 2,
    },
  ],
}));

const mockOnTopicClick = vi.fn();

describe('TopicsGrid', () => {
  beforeEach(() => {
    mockOnTopicClick.mockClear();
  });

  it('renders all topic cards', () => {
    render(<TopicsGrid onTopicClick={mockOnTopicClick} />);

    expect(screen.getByTestId('topic-card-algebra')).toBeInTheDocument();
    expect(screen.getByTestId('topic-card-geometry')).toBeInTheDocument();
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('Geometry')).toBeInTheDocument();
  });

  it('handles topic clicks correctly', () => {
    render(<TopicsGrid onTopicClick={mockOnTopicClick} />);

    const algebraCard = screen.getByTestId('topic-card-algebra');
    fireEvent.click(algebraCard);

    expect(mockOnTopicClick).toHaveBeenCalledWith('algebra');
  });

  it('applies custom className', () => {
    const { container } = render(
      <TopicsGrid onTopicClick={mockOnTopicClick} className="custom-grid-class" />
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('custom-grid-class');
  });

  it('uses responsive grid layout classes', () => {
    const { container } = render(<TopicsGrid onTopicClick={mockOnTopicClick} />);

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid', 'gap-6', 'md:grid-cols-2', 'lg:grid-cols-3');
  });
});