import { useState } from 'react';
import { TheoryConcept } from '../types/curriculum';
import { MathExpression } from './MathExpression';
import {
  PlaceValueChart,
  NumberLine,
  Base10Blocks,
  ExpandedFormDiagram,
  ComparisonChart,
} from './visual-aids';

interface TheorySectionProps {
  concepts: TheoryConcept[];
  chapterNumber?: number;
}

export function TheorySection({
  concepts,
  chapterNumber = 1,
}: TheorySectionProps) {
  const [expandedVisuals, setExpandedVisuals] = useState<Set<string>>(
    new Set()
  );

  const toggleVisual = (visualId: string) => {
    const newExpanded = new Set(expandedVisuals);
    if (newExpanded.has(visualId)) {
      newExpanded.delete(visualId);
    } else {
      newExpanded.add(visualId);
    }
    setExpandedVisuals(newExpanded);
  };

  const renderVisualAid = (
    visualType: string,
    conceptIndex: number,
    visualIndex: number
  ) => {
    const visualId = `${conceptIndex}-${visualIndex}`;
    const isExpanded = expandedVisuals.has(visualId);

    // Sample numbers based on chapter context
    const getSampleNumber = () => {
      switch (chapterNumber) {
        case 1:
          return 45678; // Place value chapter
        case 2:
          return 1234; // Addition/subtraction
        case 3:
          return 567; // Multiplication
        default:
          return 1234;
      }
    };

    const renderVisualComponent = () => {
      switch (visualType) {
        case 'place-value-chart':
          return (
            <PlaceValueChart
              number={getSampleNumber().toString()}
              interactive={true}
              className='mt-4'
            />
          );

        case 'number-line':
          return (
            <NumberLine
              min={0}
              max={100}
              step={10}
              highlightNumbers={[getSampleNumber() % 100]}
              interactive={true}
              className='mt-4'
            />
          );

        case 'base-10-blocks':
          return (
            <Base10Blocks
              number={getSampleNumber()}
              interactive={true}
              className='mt-4'
            />
          );

        case 'expanded-form-diagram':
          return (
            <ExpandedFormDiagram
              number={getSampleNumber()}
              interactive={true}
              className='mt-4'
            />
          );

        case 'comparison-chart':
          return (
            <ComparisonChart
              numbers={[getSampleNumber(), getSampleNumber() + 111]}
              interactive={true}
              className='mt-4'
            />
          );

        default:
          return (
            <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <p className='text-sm text-blue-800 dark:text-blue-200'>
                📊 Interactive visual aid: <strong>{visualType}</strong>
              </p>
              <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                This visual aid helps illustrate the concept with interactive
                elements.
              </p>
            </div>
          );
      }
    };

    return (
      <div key={visualIndex} className='mt-4'>
        <button
          onClick={() => toggleVisual(visualId)}
          className='flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors'
        >
          <span
            className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          >
            ▶
          </span>
          <span className='font-medium'>
            {visualType
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </span>
          <span className='text-xs bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded'>
            Interactive
          </span>
        </button>

        {isExpanded && (
          <div className='mt-3 border-l-4 border-purple-300 dark:border-purple-600 pl-4'>
            {renderVisualComponent()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-8'>
      <div className='prose prose-purple max-w-none dark:prose-invert'>
        <h3 className='text-xl font-semibold mb-6 flex items-center gap-2'>
          <span className='w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center justify-center text-sm font-bold'>
            📚
          </span>
          Core Concepts
        </h3>

        {concepts.map((concept, index) => (
          <div
            key={index}
            className='mb-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600'
          >
            <h4 className='text-lg font-medium mb-4 text-purple-700 dark:text-purple-300 flex items-center gap-2'>
              <span className='w-6 h-6 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full flex items-center justify-center text-xs font-bold'>
                {index + 1}
              </span>
              {concept.title}
            </h4>

            <div className='text-gray-700 dark:text-gray-300 mb-4 leading-relaxed'>
              {concept.content}
            </div>

            {concept.latex && (
              <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500 mb-4 shadow-sm'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded'>
                    FORMULA
                  </span>
                </div>
                <MathExpression inline={false} className='text-xl'>
                  {concept.latex}
                </MathExpression>
              </div>
            )}

            {concept.visuals && concept.visuals.length > 0 && (
              <div className='mt-6'>
                <h5 className='font-medium mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2'>
                  <span className='text-sm'>🎯</span>
                  Visual Learning Tools:
                </h5>
                <div className='space-y-2'>
                  {concept.visuals.map((visual, vIndex) =>
                    renderVisualAid(visual, index, vIndex)
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6'>
        <div className='flex items-start gap-3'>
          <span className='text-2xl'>💡</span>
          <div>
            <h4 className='font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
              Learning Tips
            </h4>
            <div className='space-y-2 text-yellow-700 dark:text-yellow-300 text-sm'>
              <p>
                • <strong>Take your time:</strong> Don't rush through the
                theory. Make sure you understand each concept before moving on.
              </p>
              <p>
                • <strong>Use the visuals:</strong> Click on the interactive
                visual aids to explore and experiment with the ideas.
              </p>
              <p>
                • <strong>Practice as you go:</strong> Try to work through
                examples in your head or on paper as you read.
              </p>
              <p>
                • <strong>Ask questions:</strong> If something doesn't make
                sense, review the concept or seek additional help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
