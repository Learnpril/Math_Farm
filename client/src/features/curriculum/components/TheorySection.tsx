import { TheoryConcept } from '../types';
import { MathExpression } from './MathExpression';
import { renderVisualComponent } from './visual-aids/VisualComponentRegistry';
import { getVisualDescription } from '../lib/visual-descriptions';

interface TheorySectionProps {
  concepts: TheoryConcept[];
  chapterNumber?: number;
}

export function TheorySection({
  concepts,
  chapterNumber = 1,
}: TheorySectionProps) {
  // Track used visuals to prevent reuse
  const usedVisuals = new Set<string>();
  let globalVisualCounter = 0;

  const renderVisualAid = (visualType: string, visualIndex: number) => {
    // Check if this visual type has already been used
    if (usedVisuals.has(visualType)) {
      return null;
    }

    // Mark this visual type as used and increment global counter
    usedVisuals.add(visualType);
    globalVisualCounter++;

    return (
      <div key={visualIndex} className='mt-6'>
        <div className='mb-3'>
          <h4 className='text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2'>
            <span className='text-2xl'>📊</span>
            Visual {chapterNumber}-{globalVisualCounter}
          </h4>
          <p className='text-sm text-purple-600 dark:text-purple-400 mt-1'>
            {getVisualDescription(visualType)}
          </p>
        </div>
        <div className='border-l-4 border-purple-300 dark:border-purple-600 pl-4'>
          {renderVisualComponent(visualType, { className: 'mt-4' })}
        </div>
      </div>
    );
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='prose prose-lg max-w-none dark:prose-invert'>
        {concepts.map((concept, index) => (
          <div key={index} className='mb-8'>
            <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
              {concept.title}
            </h3>

            <div className='text-gray-700 dark:text-gray-300 leading-relaxed mb-6'>
              {concept.content.split('\n\n').map((paragraph, pIndex) => (
                <p key={pIndex} className='mb-4'>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* LaTeX expressions */}
            {concept.latex && (
              <div className='my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                <MathExpression>{concept.latex}</MathExpression>
              </div>
            )}

            {/* Visual aids */}
            {concept.visuals && concept.visuals.length > 0 && (
              <div className='my-6'>
                {concept.visuals.map((visual, visualIndex) =>
                  renderVisualAid(visual, visualIndex)
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
