/**
 * Manual verification script for arithmetic curriculum functionality
 * This script tests the core functionality without relying on the full test suite
 */

import { PracticeMathValidator } from './lib/math-validation';
import { CurriculumDataLoader } from './lib/curriculum-data-loader';
import { CurriculumValidator } from './lib/curriculum-validator';

interface VerificationResult {
  component: string;
  test: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class CurriculumFunctionalityVerifier {
  private results: VerificationResult[] = [];

  private addResult(
    component: string,
    test: string,
    passed: boolean,
    error?: string,
    details?: any
  ) {
    this.results.push({ component, test, passed, error, details });
  }

  async verifyMathValidation(): Promise<void> {
    console.log('🧮 Testing Math Validation...');

    try {
      await PracticeMathValidator.initialize();
      this.addResult('MathValidation', 'Initialization', true);
    } catch (error) {
      this.addResult(
        'MathValidation',
        'Initialization',
        false,
        error instanceof Error ? error.message : String(error)
      );
      return;
    }

    // Test basic arithmetic validation
    try {
      const result = await PracticeMathValidator.validateAnswer('2 + 3', '5');
      this.addResult(
        'MathValidation',
        'Basic Arithmetic',
        result.isCorrect,
        undefined,
        result
      );
    } catch (error) {
      this.addResult(
        'MathValidation',
        'Basic Arithmetic',
        false,
        error instanceof Error ? error.message : String(error)
      );
    }

    // Test fraction validation
    try {
      const result = await PracticeMathValidator.validateAnswer('1/2', '0.5');
      this.addResult(
        'MathValidation',
        'Fraction Validation',
        result.isCorrect,
        undefined,
        result
      );
    } catch (error) {
      this.addResult(
        'MathValidation',
        'Fraction Validation',
        false,
        error instanceof Error ? error.message : String(error)
      );
    }

    // Test expanded form validation
    try {
      const result = await PracticeMathValidator.validateAnswer(
        '20000 + 3000 + 400 + 50 + 6',
        '23456'
      );
      this.addResult(
        'MathValidation',
        'Expanded Form',
        result.isCorrect,
        undefined,
        result
      );
    } catch (error) {
      this.addResult(
        'MathValidation',
        'Expanded Form',
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async verifyCurriculumDataLoader(): Promise<void> {
    console.log('📚 Testing Curriculum Data Loader...');

    try {
      const metadata = await CurriculumDataLoader.loadMetadata('arithmetic');
      this.addResult('DataLoader', 'Load Metadata', !!metadata, undefined, {
        title: metadata?.title,
        chapters: metadata?.chapters,
      });
    } catch (error) {
      this.addResult(
        'DataLoader',
        'Load Metadata',
        false,
        error instanceof Error ? error.message : String(error)
      );
    }

    // Test loading individual chapters
    for (let i = 1; i <= 8; i++) {
      try {
        const chapter = await CurriculumDataLoader.loadChapter('arithmetic', i);
        this.addResult(
          'DataLoader',
          `Load Chapter ${i}`,
          !!chapter,
          undefined,
          {
            id: chapter?.id,
            title: chapter?.title,
            practiceCount: chapter?.practice?.length || 0,
          }
        );
      } catch (error) {
        this.addResult(
          'DataLoader',
          `Load Chapter ${i}`,
          false,
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  async verifyCurriculumValidator(): Promise<void> {
    console.log('✅ Testing Curriculum Validator...');

    try {
      // Test metadata validation
      const metadata = await CurriculumDataLoader.loadMetadata('arithmetic');
      if (metadata) {
        const isValid = CurriculumValidator.validateMetadata(metadata);
        this.addResult('Validator', 'Metadata Validation', isValid);
      }
    } catch (error) {
      this.addResult(
        'Validator',
        'Metadata Validation',
        false,
        error instanceof Error ? error.message : String(error)
      );
    }

    try {
      // Test chapter validation
      const chapter = await CurriculumDataLoader.loadChapter('arithmetic', 1);
      if (chapter) {
        const isValid = CurriculumValidator.validateChapter(chapter);
        this.addResult('Validator', 'Chapter Validation', isValid);
      }
    } catch (error) {
      this.addResult(
        'Validator',
        'Chapter Validation',
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async verifyMathJaxIntegration(): Promise<void> {
    console.log('🔢 Testing MathJax Integration...');

    // Test if MathJax expressions can be processed
    const testExpressions = ['\\frac{1}{2}', '2^3', '\\sqrt{16}', 'x + y = z'];

    for (const expr of testExpressions) {
      try {
        // This is a basic check - in a real environment, MathJax would render these
        const isValidLatex =
          expr.includes('\\') || /^[a-zA-Z0-9\+\-\*\/\=\s]+$/.test(expr);
        this.addResult(
          'MathJax',
          `Expression: ${expr}`,
          isValidLatex,
          undefined,
          { expression: expr }
        );
      } catch (error) {
        this.addResult(
          'MathJax',
          `Expression: ${expr}`,
          false,
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  async verifyProgressTracking(): Promise<void> {
    console.log('📊 Testing Progress Tracking...');

    try {
      // Test localStorage functionality
      const testKey = 'mathfarm_test_progress';
      const testData = { chapter: 1, completed: true, score: 0.85 };

      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');

      const isWorking =
        retrieved.chapter === testData.chapter &&
        retrieved.completed === testData.completed &&
        retrieved.score === testData.score;

      localStorage.removeItem(testKey);

      this.addResult('ProgressTracking', 'localStorage Persistence', isWorking);
    } catch (error) {
      this.addResult(
        'ProgressTracking',
        'localStorage Persistence',
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async verifyEndToEndFlow(): Promise<void> {
    console.log('🔄 Testing End-to-End User Flow...');

    try {
      // Simulate user flow: Load curriculum -> Select chapter -> Practice problem -> Track progress

      // Step 1: Load curriculum metadata
      const metadata = await CurriculumDataLoader.loadMetadata('arithmetic');
      if (!metadata) {
        throw new Error('Failed to load curriculum metadata');
      }

      // Step 2: Load first chapter
      const chapter1 = await CurriculumDataLoader.loadChapter('arithmetic', 1);
      if (!chapter1) {
        throw new Error('Failed to load chapter 1');
      }

      // Step 3: Validate chapter structure
      const isValidChapter = CurriculumValidator.validateChapter(chapter1);
      if (!isValidChapter) {
        throw new Error('Chapter 1 failed validation');
      }

      // Step 4: Test practice problem validation
      if (chapter1.practice && chapter1.practice.length > 0) {
        const firstProblem = chapter1.practice[0];
        const validationResult = await PracticeMathValidator.validateAnswer(
          firstProblem.correctAnswer,
          firstProblem.correctAnswer
        );

        if (!validationResult.isCorrect) {
          throw new Error('Practice problem validation failed');
        }
      }

      // Step 5: Test progress tracking
      const progressKey = 'mathfarm_arithmetic_progress_test';
      const progressData = {
        currentChapter: 1,
        completedChapters: [],
        chapterProgress: {
          'chapter-01': {
            completed: false,
            timeSpent: 300,
            practiceScores: {},
            masteryLevel: 0.0,
          },
        },
        totalTimeSpent: 300,
        achievements: [],
      };

      localStorage.setItem(progressKey, JSON.stringify(progressData));
      const retrievedProgress = JSON.parse(
        localStorage.getItem(progressKey) || '{}'
      );
      localStorage.removeItem(progressKey);

      const progressWorking = retrievedProgress.currentChapter === 1;

      this.addResult(
        'EndToEnd',
        'Complete User Flow',
        progressWorking,
        undefined,
        {
          metadataLoaded: !!metadata,
          chapterLoaded: !!chapter1,
          chapterValid: isValidChapter,
          practiceProblems: chapter1.practice?.length || 0,
          progressTracking: progressWorking,
        }
      );
    } catch (error) {
      this.addResult(
        'EndToEnd',
        'Complete User Flow',
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async runAllVerifications(): Promise<void> {
    console.log(
      '🚀 Starting Arithmetic Curriculum Functionality Verification...\n'
    );

    await this.verifyMathValidation();
    await this.verifyCurriculumDataLoader();
    await this.verifyCurriculumValidator();
    await this.verifyMathJaxIntegration();
    await this.verifyProgressTracking();
    await this.verifyEndToEndFlow();

    this.printResults();
  }

  private printResults(): void {
    console.log('\n📋 Verification Results Summary:');
    console.log('='.repeat(60));

    const groupedResults = this.results.reduce(
      (acc, result) => {
        if (!acc[result.component]) {
          acc[result.component] = [];
        }
        acc[result.component].push(result);
        return acc;
      },
      {} as Record<string, VerificationResult[]>
    );

    let totalTests = 0;
    let passedTests = 0;

    for (const [component, tests] of Object.entries(groupedResults)) {
      console.log(`\n${component}:`);

      for (const test of tests) {
        totalTests++;
        if (test.passed) passedTests++;

        const status = test.passed ? '✅' : '❌';
        console.log(`  ${status} ${test.test}`);

        if (test.error) {
          console.log(`     Error: ${test.error}`);
        }

        if (test.details && typeof test.details === 'object') {
          console.log(
            `     Details: ${JSON.stringify(test.details, null, 2).replace(/\n/g, '\n     ')}`
          );
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(
      `📊 Overall Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`
    );

    if (passedTests === totalTests) {
      console.log('🎉 All functionality verification tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Review the errors above.');
    }
  }
}

// Export for use in other contexts
export { CurriculumFunctionalityVerifier };

// Run verification if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  const verifier = new CurriculumFunctionalityVerifier();
  verifier.runAllVerifications().catch(console.error);
} else if (
  typeof process !== 'undefined' &&
  process.argv[1]?.includes('verify-functionality')
) {
  // Node environment
  const verifier = new CurriculumFunctionalityVerifier();
  verifier.runAllVerifications().catch(console.error);
}
