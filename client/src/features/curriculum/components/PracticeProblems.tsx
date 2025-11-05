import { useState, useEffect } from 'react';
import { Check, X, HelpCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { PracticeProblem, ChapterProgress } from '../types';
import { MathExpression } from './MathExpression';
import { useCurriculumProgress } from '../hooks/useCurriculumProgress';
import {
  PracticeMathValidator,
  MathValidationResult,
} from '../lib/math-validation';

interface PracticeProblemsProps {
  problems: PracticeProblem[];
  chapterId: string;
  progress?: ChapterProgress | undefined;
}

export function PracticeProblems({
  problems,
  chapterId,
  progress,
}: PracticeProblemsProps) {
  const { recordPracticeAttempt, progress: fullProgress } =
    useCurriculumProgress();

  // Get current chapter progress to check completed problems
  const chapterProgress = fullProgress.chapterProgress[chapterId];
  const practiceScores = chapterProgress?.practiceScores || {};

  // Check if all problems are completed, but don't filter the array
  const allProblemsCompleted = problems.every(
    problem => practiceScores[problem.id] === 1
  );

  // Find the first unsolved problem index
  const findFirstUnsolvedProblem = () => {
    const firstUnsolved = problems.findIndex(
      problem => practiceScores[problem.id] !== 1
    );
    return firstUnsolved === -1 ? 0 : firstUnsolved; // Default to 0 if all are solved
  };

  const [currentProblem, setCurrentProblem] = useState(
    findFirstUnsolvedProblem()
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(
    null
  );
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [validationResult, setValidationResult] =
    useState<MathValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [mathValidatorReady, setMathValidatorReady] = useState(false);
  const [achievedFullMastery, setAchievedFullMastery] = useState(false);

  // Initialize math validator on component mount
  useEffect(() => {
    const initValidator = async () => {
      const ready = await PracticeMathValidator.initialize();
      setMathValidatorReady(ready);
    };
    initValidator();
  }, []);

  // Auto-skip to first unsolved problem when progress updates
  useEffect(() => {
    const firstUnsolved = findFirstUnsolvedProblem();
    if (firstUnsolved !== currentProblem && !answered) {
      setCurrentProblem(firstUnsolved);
      resetProblemState();
    }
  }, [practiceScores]);

  // Show completion message if all problems are done - check this FIRST
  if (allProblemsCompleted) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-semibold'>Practice Problems</h3>
          <div className='text-sm text-green-600 dark:text-green-400'>
            All Complete! 🎉
          </div>
        </div>

        <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center'>
          <div className='flex items-center justify-center mb-4'>
            <Check className='w-16 h-16 text-green-500' />
          </div>
          <h4 className='text-xl font-semibold text-green-800 dark:text-green-200 mb-2'>
            Congratulations! 🎉
          </h4>
          <p className='text-green-700 dark:text-green-300 mb-4'>
            You've successfully completed all practice problems for this
            chapter!
          </p>
          <p className='text-sm text-green-600 dark:text-green-400'>
            Use the Reset button above to practice again, or continue to the
            next chapter.
          </p>
        </div>
      </div>
    );
  }

  // Use all problems, but show completion status
  const problem = problems[currentProblem];
  const isProblemCompleted = practiceScores[problem?.id] === 1;

  // Enhanced answer validation using math.js
  const validateAnswer = async (
    userAnswer: string | number,
    correctAnswer: string | number
  ): Promise<boolean> => {
    if (!mathValidatorReady) {
      // Fallback to basic string comparison if math.js isn't ready
      return (
        normalizeAnswerBasic(userAnswer) === normalizeAnswerBasic(correctAnswer)
      );
    }

    try {
      setIsValidating(true);
      const result = await PracticeMathValidator.validateAnswer(
        userAnswer,
        correctAnswer,
        {
          tolerance: 0.0001,
          allowEquivalentForms: true,
          caseSensitive: false,
          normalizeSpaces: true,
        }
      );

      setValidationResult(result);
      return result.isCorrect;
    } catch (error) {
      console.error('Validation error:', error);
      // Fallback to basic comparison
      return (
        normalizeAnswerBasic(userAnswer) === normalizeAnswerBasic(correctAnswer)
      );
    } finally {
      setIsValidating(false);
    }
  };

  // Basic fallback normalization
  const normalizeAnswerBasic = (answer: string | number): string => {
    if (typeof answer === 'number') return answer.toString();

    return answer
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/,/g, '') // Remove commas
      .trim();
  };

  const handleAnswer = async () => {
    if (
      selectedAnswer === null ||
      answered ||
      isValidating ||
      isProblemCompleted
    )
      return;

    let isCorrect = false;

    if (problem.type === 'multiple-choice') {
      isCorrect = selectedAnswer === problem.correct;
    } else if (problem.type === 'fill-in' || problem.type === 'step-by-step') {
      isCorrect = await validateAnswer(selectedAnswer, problem.correct);
    }

    const score = isCorrect ? 1 : 0;
    const hintsUsed = showHint ? hintLevel + 1 : 0;

    recordPracticeAttempt(
      chapterId,
      problem.id,
      score,
      hintsUsed,
      problems.length
    );

    // Check if this correct answer achieves 100% mastery
    if (isCorrect && progress) {
      const currentScores = progress.practiceScores || {};
      const updatedScores = { ...currentScores, [problem.id]: 1 };
      const correctCount = Object.values(updatedScores).filter(
        s => s === 1
      ).length;

      if (correctCount === problems.length) {
        setAchievedFullMastery(true);
        // Add a small delay to show the celebration after the explanation appears
        setTimeout(() => {
          console.log('🎉 100% MASTERY ACHIEVED! 🎉');
        }, 500);
      }
    }

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

  const jumpToNextUnsolved = () => {
    const nextUnsolved = problems.findIndex(
      (problem, index) =>
        index > currentProblem && practiceScores[problem.id] !== 1
    );

    if (nextUnsolved !== -1) {
      setCurrentProblem(nextUnsolved);
      resetProblemState();
    } else {
      // If no unsolved problems after current, jump to first unsolved overall
      const firstUnsolved = findFirstUnsolvedProblem();
      if (firstUnsolved !== currentProblem) {
        setCurrentProblem(firstUnsolved);
        resetProblemState();
      }
    }
  };

  const resetProblemState = () => {
    setSelectedAnswer(null);
    setShowHint(false);
    setHintLevel(0);
    setShowExplanation(false);
    setAnswered(false);
    setValidationResult(null);
    setIsValidating(false);
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
      : validationResult?.isCorrect || false);
  const isIncorrect = answered && !isCorrect;

  // Show completion message if all problems are done
  if (allProblemsCompleted) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-semibold'>Practice Problems</h3>
          <div className='text-sm text-green-600 dark:text-green-400'>
            All Complete! 🎉
          </div>
        </div>

        <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center'>
          <div className='flex items-center justify-center mb-4'>
            <Check className='w-16 h-16 text-green-500' />
          </div>
          <h4 className='text-xl font-semibold text-green-800 dark:text-green-200 mb-2'>
            Congratulations! 🎉
          </h4>
          <p className='text-green-700 dark:text-green-300 mb-4'>
            You've successfully completed all practice problems for this
            chapter!
          </p>
          <p className='text-sm text-green-600 dark:text-green-400'>
            Use the Reset button above to practice again, or continue to the
            next chapter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold'>Practice Problems</h3>
        <div className='text-sm text-gray-600 dark:text-gray-400'>
          Problem {currentProblem + 1} of {problems.length}
          {isProblemCompleted && (
            <span className='ml-2 text-green-600 dark:text-green-400'>
              ✓ Completed
            </span>
          )}
          {!allProblemsCompleted && (
            <span className='ml-2 text-blue-600 dark:text-blue-400'>
              (
              {Object.values(practiceScores).filter(score => score !== 1)
                .length +
                (problems.length - Object.keys(practiceScores).length)}{' '}
              unsolved)
            </span>
          )}
        </div>
      </div>

      {/* Study Tip */}
      <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
        <div className='flex items-start space-x-3'>
          <div className='text-amber-600 dark:text-amber-400 text-xl'>📝</div>
          <div>
            <h4 className='font-medium text-amber-800 dark:text-amber-200 mb-1'>
              Study Tip
            </h4>
            <p className='text-sm text-amber-700 dark:text-amber-300'>
              Don't be afraid to grab a pen and paper! Working through these
              problems by hand helps build deeper understanding and strengthens
              your problem-solving skills. The screen is great for checking your
              work, but the real learning happens when you work it out yourself.
            </p>
          </div>
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
      <div
        className={`bg-white dark:bg-gray-800 border rounded-lg p-6 ${
          isProblemCompleted
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-lg font-medium'>
              Problem {currentProblem + 1}
              {isProblemCompleted && (
                <span className='ml-2 text-green-600 dark:text-green-400'>
                  ✓
                </span>
              )}
            </h4>
          </div>

          <p className='text-gray-900 dark:text-white text-lg mb-4'>
            {problem.problem}
          </p>

          {problem.latex && (
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded border mb-4'>
              <MathExpression inline={false} className='text-lg'>
                {problem.latex}
              </MathExpression>
            </div>
          )}
        </div>

        {/* Answer Options */}
        {problem.type === 'multiple-choice' && problem.options && (
          <div className='space-y-3 mb-6'>
            {problem.options.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  !answered && !isProblemCompleted && setSelectedAnswer(index)
                }
                disabled={answered || isProblemCompleted}
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
        {(problem.type === 'fill-in' || problem.type === 'step-by-step') && (
          <div className='mb-6'>
            <input
              type='text'
              value={selectedAnswer || ''}
              onChange={e =>
                !answered &&
                !isProblemCompleted &&
                setSelectedAnswer(e.target.value)
              }
              disabled={answered || isProblemCompleted}
              placeholder={
                isProblemCompleted
                  ? 'Already completed ✓'
                  : 'Enter your answer...'
              }
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

        {/* Completed Problem Message */}
        {isProblemCompleted && !answered && (
          <div className='mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
            <div className='flex items-center space-x-2'>
              <Check className='w-4 h-4 text-green-600 dark:text-green-400' />
              <p className='text-sm text-green-700 dark:text-green-300'>
                You've already completed this problem correctly! Use navigation
                to move to other problems.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            {!answered && !isProblemCompleted && (
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
                  disabled={selectedAnswer === null || isValidating}
                  className='px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2'
                >
                  {isValidating ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      <span>Validating...</span>
                    </>
                  ) : (
                    <span>Submit Answer</span>
                  )}
                </button>
              </>
            )}

            {answered && (
              <>
                {isCorrect ? (
                  <button
                    onClick={() => {
                      // Try to jump to next unsolved, otherwise just go to next problem
                      const nextUnsolved = problems.findIndex(
                        (problem, index) =>
                          index > currentProblem &&
                          practiceScores[problem.id] !== 1
                      );

                      if (nextUnsolved !== -1) {
                        setCurrentProblem(nextUnsolved);
                        resetProblemState();
                      } else {
                        nextProblem();
                      }
                    }}
                    disabled={currentProblem === problems.length - 1}
                    className='flex items-center space-x-2 px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <Check className='w-4 h-4' />
                    <span>
                      {currentProblem === problems.length - 1
                        ? 'Complete'
                        : 'Next Problem'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={resetProblemState}
                    className='flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors'
                  >
                    <RotateCcw className='w-4 h-4' />
                    <span>Try Again</span>
                  </button>
                )}
              </>
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

            {/* Jump to Next Unsolved button - only show if there are unsolved problems */}
            {!allProblemsCompleted && (
              <button
                onClick={jumpToNextUnsolved}
                className='px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center space-x-1'
              >
                <span>Skip to Unsolved</span>
                <span className='text-xs'>⚡</span>
              </button>
            )}

            {/* Show navigation Next button for completed problems or unanswered problems */}
            {(isProblemCompleted || !answered || !isCorrect) && (
              <button
                onClick={nextProblem}
                disabled={currentProblem === problems.length - 1}
                className='px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 transition-colors'
              >
                {isProblemCompleted ? 'Next' : 'Skip'}
              </button>
            )}
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

        {/* Math Validator Status */}
        {!mathValidatorReady && (
          <div className='mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
            <div className='flex items-center space-x-2'>
              <AlertCircle className='w-4 h-4 text-yellow-600 dark:text-yellow-400' />
              <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                Advanced math validation is loading. Basic validation is active.
              </p>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {validationResult?.error && (
          <div className='mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg'>
            <div className='flex items-center space-x-2'>
              <AlertCircle className='w-4 h-4 text-orange-600 dark:text-orange-400' />
              <p className='text-sm text-orange-700 dark:text-orange-300'>
                Validation note: {validationResult.error}
              </p>
            </div>
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
              className={`mb-3 ${
                isCorrect
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              {problem.explanation}
            </p>

            {/* Validation Details */}
            {validationResult && (
              <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
                {validationResult.normalizedAnswer && (
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                    Your answer:{' '}
                    <code className='bg-gray-100 dark:bg-gray-700 px-1 rounded'>
                      {validationResult.normalizedAnswer}
                    </code>
                  </p>
                )}

                {validationResult.evaluatedAnswer !== undefined && (
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                    Evaluated as:{' '}
                    <code className='bg-gray-100 dark:bg-gray-700 px-1 rounded'>
                      {String(validationResult.evaluatedAnswer)}
                    </code>
                  </p>
                )}

                {/* Suggestions for incorrect answers */}
                {!isCorrect &&
                  validationResult.suggestions &&
                  validationResult.suggestions.length > 0 && (
                    <div className='mt-2'>
                      <p className='text-sm font-medium text-blue-700 dark:text-blue-300 mb-1'>
                        💡 Helpful hints:
                      </p>
                      <ul className='text-sm text-blue-600 dark:text-blue-400 space-y-1'>
                        {validationResult.suggestions.map(
                          (suggestion, index) => (
                            <li
                              key={index}
                              className='flex items-start space-x-1'
                            >
                              <span>•</span>
                              <span>{suggestion}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* 100% Mastery Achievement Celebration */}
        {achievedFullMastery && isCorrect && (
          <div className='mt-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg'>
            <div className='text-center'>
              <div className='text-4xl mb-2'>🎉</div>
              <h3 className='text-xl font-bold text-purple-800 dark:text-purple-200 mb-2'>
                Congratulations!
              </h3>
              <p className='text-purple-700 dark:text-purple-300 mb-3'>
                You've achieved <strong>100% Mastery</strong> of this chapter!
              </p>
              <div className='flex items-center justify-center space-x-2 text-sm text-purple-600 dark:text-purple-400'>
                <span>🏆</span>
                <span>All {problems.length} problems completed correctly</span>
                <span>🏆</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
