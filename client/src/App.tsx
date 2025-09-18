import React from 'react';
import { Router, Route, Redirect } from 'wouter';
import { ThemeProvider } from './components/ThemeProvider';
import { ToolModalProvider } from './components/ToolModalProvider';
import { Layout } from './components/layout/Layout';
import { Home, NotFound, MathSymbolsPage } from './pages';
import {
  LazyTopicPage,
  LazyToolsPage,
  LazyLaTeXGuidePage,
  LazyMATLABGuidePage,
} from './components/LazyComponents';
import { ForumHome } from './features/forum/pages/ForumHome';
import { CategoryPage } from './features/forum/pages/CategoryPage';
import { ThreadPage } from './features/forum/pages/ThreadPage';
import { AvatarSystemDemo } from './features/forum/pages/AvatarSystemDemo';
import { LazyWrapper } from './components/LazyWrapper';
import {
  ErrorBoundaryProvider,
  ErrorBoundaryTester,
} from './components/ErrorBoundaryProvider';
import { preloadMathJax } from './lib/mathJaxLoader';
// import { PerformanceDashboard } from './components/PerformanceDashboard';
import { installDOMErrorHandler } from './lib/domErrorHandler';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { ArithmeticCurriculumPage } from './features/curriculum/components/ArithmeticCurriculumPage';

function App() {
  const handleGlobalError = (error: Error, errorId: string) => {
    // Global error handler - could send to analytics service in the future
    console.warn(`Global error caught [${errorId}]:`, error);
  };

  // Install DOM error handler when app starts
  React.useEffect(() => {
    installDOMErrorHandler();
    // Disabled preloadMathJax() to avoid conflicts with direct MathJax implementation
  }, []);

  return (
    <ErrorBoundaryProvider
      onGlobalError={handleGlobalError}
      isDevelopment={process.env.NODE_ENV === 'development'}
    >
      <ThemeProvider>
        <ToolModalProvider>
          <Router>
            <Layout>
              <Route path='/' component={Home} />
              <Route
                path='/topic/:id'
                component={() => (
                  <LazyWrapper
                    fallback='skeleton'
                    skeletonVariant='topic'
                    loadingText='Loading topic...'
                  >
                    <LazyTopicPage />
                  </LazyWrapper>
                )}
              />
              {/* Individual tool routes */}
              <Route
                path='/tools/calculator'
                component={() => (
                  <LazyWrapper
                    fallback='skeleton'
                    skeletonVariant='page'
                    loadingText='Loading calculator...'
                  >
                    <LazyToolsPage initialTool='calculator' />
                  </LazyWrapper>
                )}
              />
              <Route
                path='/tools/function-grapher'
                component={() => (
                  <LazyWrapper
                    fallback='skeleton'
                    skeletonVariant='page'
                    loadingText='Loading function grapher...'
                  >
                    <LazyToolsPage initialTool='graphing' />
                  </LazyWrapper>
                )}
              />
              <Route
                path='/tools/unit-converter'
                component={() => (
                  <LazyWrapper
                    fallback='skeleton'
                    skeletonVariant='page'
                    loadingText='Loading unit converter...'
                  >
                    <LazyToolsPage initialTool='converter' />
                  </LazyWrapper>
                )}
              />
              <Route
                path='/tools/equation-solver'
                component={() => (
                  <LazyWrapper
                    fallback='skeleton'
                    skeletonVariant='page'
                    loadingText='Loading equation solver...'
                  >
                    <LazyToolsPage initialTool='solver' />
                  </LazyWrapper>
                )}
              />

              <Route
                path='/tools'
                component={() => (
                  <LazyWrapper
                    fallback='skeleton'
                    skeletonVariant='page'
                    loadingText='Loading tools...'
                  >
                    <LazyToolsPage />
                  </LazyWrapper>
                )}
              />
              <Route
                path='/latex-guide'
                component={() => (
                  <LazyWrapper
                    fallback='skeleton'
                    skeletonVariant='page'
                    loadingText='Loading LaTeX guide...'
                  >
                    <LazyLaTeXGuidePage />
                  </LazyWrapper>
                )}
              />
              <Route
                path='/matlab-guide'
                component={() => (
                  <LazyWrapper
                    fallback='skeleton'
                    skeletonVariant='page'
                    loadingText='Loading MATLAB guide...'
                  >
                    <LazyMATLABGuidePage />
                  </LazyWrapper>
                )}
              />
              <Route path='/math-symbols' component={MathSymbolsPage} />

              {/* Curriculum routes */}
              <Route
                path='/topic/arithmetic/curriculum/:chapter?'
                component={() => (
                  <LazyWrapper
                    fallback='skeleton'
                    skeletonVariant='page'
                    loadingText='Loading curriculum...'
                  >
                    <ArithmeticCurriculumPage />
                  </LazyWrapper>
                )}
              />

              {/* Forum routes - replacing community */}
              <Route path='/community' component={ForumHome} />
              <Route path='/forum' component={ForumHome} />
              <Route
                path='/forum/category/:categoryId'
                component={CategoryPage}
              />
              <Route path='/forum/thread/:threadId' component={ThreadPage} />
              <Route path='/forum/avatar-demo' component={AvatarSystemDemo} />

              {/* Temporarily disabled catch-all route for debugging */}
              {/* <Route path='*'>
              <Redirect to='/' />
            </Route> */}
            </Layout>

            {/* Development-only error testing component */}
            <ErrorBoundaryTester>
              <></>
            </ErrorBoundaryTester>
          </Router>

          {/* Performance monitoring dashboard - temporarily disabled to fix infinite loop */}
          {/* {process.env.NODE_ENV === 'development' && false && (
          <PerformanceDashboard componentName='Math Farm App' />
        )} */}

          {/* Web Worker Performance Monitor */}
          <PerformanceMonitor />
        </ToolModalProvider>
      </ThemeProvider>
    </ErrorBoundaryProvider>
  );
}

/**
 * Placeholder component for routes that will be implemented in future tasks
 */
function PlaceholderPage() {
  return (
    <div className='container mx-auto px-4 py-16 text-center'>
      <h1 className='text-3xl font-bold text-foreground mb-4'>
        Coming Soon - TEST CHANGE
      </h1>
      <p className='text-lg text-muted-foreground mb-8'>
        This page will be implemented in future development phases.
      </p>
      <button
        onClick={() => window.history.back()}
        className='px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      >
        Go Back
      </button>
    </div>
  );
}

export default App;
