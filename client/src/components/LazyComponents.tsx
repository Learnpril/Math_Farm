import { lazy } from 'react';

// Lazy load heavy components that use JSXGraph or complex math libraries
export const LazyGraphPlotter = lazy(() =>
  import('../features/math-tools/components/GraphPlotter').then(module => ({
    default: module.GraphPlotter,
  }))
);

export const LazyEquationSolver = lazy(() =>
  import('../features/math-tools/components/EquationSolver').then(module => ({
    default: module.EquationSolver,
  }))
);

export const LazyCalculator = lazy(() =>
  import('../features/math-tools/components/Calculator').then(module => ({
    default: module.Calculator,
  }))
);

export const LazyUnitConverter = lazy(() =>
  import('../features/math-tools/components/UnitConverter').then(module => ({
    default: module.UnitConverter,
  }))
);

// Lazy load pages that contain heavy components
export const LazyTopicPage = lazy(() =>
  import('../pages/OptimizedTopicPage').then(module => ({
    default: module.TopicPage,
  }))
);

export const LazyToolsPage = lazy(() =>
  import('../pages/ToolsPage').then(module => ({
    default: module.ToolsPage,
  }))
);

export const LazyLaTeXGuidePage = lazy(() =>
  import('../features/guides/components/LaTeXGuidePage').then(module => ({
    default: module.LaTeXGuidePage,
  }))
);

export const LazyMATLABGuidePage = lazy(() =>
  import('../features/guides/components/MATLABGuidePage').then(module => ({
    default: module.MATLABGuidePage,
  }))
);

// Lazy load MathJax-heavy components
export const LazyMathExpression = lazy(() =>
  import('./MathExpression').then(module => ({
    default: module.MathExpression,
  }))
);

export const LazyLessonContent = lazy(() =>
  import('./LessonContent').then(module => ({
    default: module.LessonContent,
  }))
);

export const LazyTopicPracticeSection = lazy(() =>
  import('../features/practice/components/TopicPracticeSection').then(
    module => ({
      default: module.TopicPracticeSection,
    })
  )
);
