import React, { useState } from 'react';
import { Check, X, HelpCircle, RotateCcw } from 'lucide-react';
import { PracticeProblem, ChapterProgress } from '../types';
import { useCurriculumProgress } from '../hooks/useCurriculumProgress';
import { MathExpression } from '../../../components/MathExpression';

interface PracticeProblemsProps {
  problems: PracticeProblem[];
  chapterId: string;
  progress?: ChapterProgress;
}

export function PracticeProblems({
  problems,
  chapterId,
  progress,
}: PracticeProblemsProps) {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(
    null
  );
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);

  const { recordPracticeAttempt } = useCurriculumProgress();

  const problem = problems[currentProblem];

  // Helper function to normalize answers for flexible matching
  const normalizeAnswer = (answer: string | number): string => {
    if (typeof answer === 'number') return answer.toString();

    return answer
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/,/g, '') // Remove commas
      .trim();
  };

  // Check if answers match with flexible formatting
  const answersMatch = (
    userAnswer: string | number,
    correctAnswer: string | number
  ): boolean => {
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);

    // Direct match
    if (normalizedUser === normalizedCorrect) return true;

    // For expanded form problems, also check if they evaluate to the same mathematical expression
    if (problem.type === 'fill-in' && typeof correctAnswer === 'string') {
      // Check if both contain + signs (likely expanded form)
      if (normalizedUser.includes('+') && normalizedCorrect.includes('+')) {
        try {
          // Split by + and sort the parts to handle different orders
          const userParts = normalizedUser
            .split('+')
            .map(p => p.trim())
            .sort();
          const correctParts = normalizedCorrect
            .split('+')
            .map(p => p.trim())
            .sort();

          if (userParts.length === correctParts.length) {
            return userParts.every(
              (part, index) => part === correctParts[index]
            );
          }
        } catch (e) {
          // If parsing fails, fall back to direct comparison
        }
      }
    }

    return false;
  };

  const handleAnswer = () => {
    if (selectedAnswer === null || answered) return;

    let isCorrect = false;

    if (problem.type === 'multiple-choice') {
      isCorrect = selectedAnswer === problem.correct;
    } else if (problem.type === 'fill-in') {
      isCorrect = answersMatch(selectedAnswer, problem.correct);
    }

    const score = isCorrect ? 1 : 0;
    const hintsUsed = showHint ? hintLevel + 1 : 0;

    recordPracticeAttempt(chapterId, problem.id, score, hintsUsed);
    setAnswered(true);
    setShowExplanation(true);
  };

  const nextProblem = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
      resetProblemState();
    }
  };

  const previousProblem = () => {
    if (currentProblem > 0) {
      setCurrentProblem(currentProblem - 1);
      resetProblemState();
    }
  };

  const resetProblemState = () => {
    setSelectedAnswer(null);
    setShowHint(false);
    setHintLevel(0);
    setShowExplanation(false);
    setAnswered(false);
  };

  const showNextHint = () => {
    if (hintLevel < problem.hints.length - 1) {
      setHintLevel(hintLevel + 1);
    }
    setShowHint(true);
  };

  const isCorrect =
    answered &&
    (problem.type === 'multiple-choice'
      ? selectedAnswer === problem.correct
      : answersMatch(selectedAnswer || '', problem.correct));
  const isIncorrect = answered && !isCorrect;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold'>Practice Problems</h3>
        <div className='text-sm text-gray-600 dark:text-gray-400'>
          Problem {currentProblem + 1} of {problems.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
        <div
          className='bg-purple-500 h-2 rounded-full transition-all duration-300'
          style={{
            width: `${((currentProblem + 1) / problems.length) * 100}%`,
          }}
        />
      </div>

      {/* Problem Card */}
      <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-lg font-medium'>
              Problem {currentProblem + 1}
            </h4>
            <div className='flex items-center space-x-2'>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  problem.difficulty <= 2
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : problem.difficulty <= 4
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                Difficulty: {problem.difficulty}/5
              </span>
            </div>
          </div>

          <p className='text-gray-900 dark:text-white text-lg mb-4'>
            {problem.problem}
          </p>

          {problem.latex && (
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded border text-center mb-4'>
              <MathExpression expression={problem.latex} />
            </div>
          )}
        </div>

        {/* Answer Options */}
        {problem.type === 'multiple-choice' && problem.options && (
          <div className='space-y-3 mb-6'>
            {problem.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !answered && setSelectedAnswer(index)}
                disabled={answered}
                className={`
                  w-full p-4 text-left rounded-lg border-2 transition-all
                  ${
                    selectedAnswer === index
                      ? answered
                        ? isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                  ${answered ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className='flex items-center justify-between'>
                  <span>{option}</span>
                  {answered &&
                    selectedAnswer === index &&
                    (isCorrect ? (
                      <Check className='w-5 h-5 text-green-500' />
                    ) : (
                      <X className='w-5 h-5 text-red-500' />
                    ))}
                  {answered &&
                    index === problem.correct &&
                    selectedAnswer !== index && (
                      <Check className='w-5 h-5 text-green-500' />
                    )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Fill-in Answer */}
        {problem.type === 'fill-in' && (
          <div className='mb-6'>
            <input
              type='text'
              value={selectedAnswer || ''}
              onChange={e => !answered && setSelectedAnswer(e.target.value)}
              disabled={answered}
              placeholder='Enter your answer...'
              className={`
                w-full p-3 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                ${
                  answered
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }
                ${answered ? 'cursor-not-allowed' : ''}
              `}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            {!answered && (
              <>
                <button
                  onClick={showNextHint}
                  disabled={hintLevel >= problem.hints.length - 1 && showHint}
                  className='flex items-center space-x-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50'
                >
                  <HelpCircle className='w-4 h-4' />
                  <span>Hint</span>
                </button>

                <button
                  onClick={handleAnswer}
                  disabled={selectedAnswer === null}
                  className='px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  Submit Answer
                </button>
              </>
            )}

            {answered && (
              <button
                onClick={resetProblemState}
                className='flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors'
              >
                <RotateCcw className='w-4 h-4' />
                <span>Try Again</span>
              </button>
            )}
          </div>

          <div className='flex items-center space-x-3'>
            <button
              onClick={previousProblem}
              disabled={currentProblem === 0}
              className='px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors'
            >
              Previous
            </button>

            <button
              onClick={nextProblem}
              disabled={currentProblem === problems.length - 1}
              className='px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 transition-colors'
            >
              Next
            </button>
          </div>
        </div>

        {/* Hint Display */}
        {showHint && (
          <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
            <h5 className='font-medium text-blue-800 dark:text-blue-200 mb-2'>
              💡 Hint {hintLevel + 1}:
            </h5>
            <p className='text-blue-700 dark:text-blue-300'>
              {problem.hints[hintLevel]}
            </p>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div
            className={`mt-4 p-4 rounded-lg border ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <h5
              className={`font-medium mb-2 ${
                isCorrect
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}
            >
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </h5>
            <p
              className={`${
                isCorrect
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              {problem.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
