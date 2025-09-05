import React from "react";
import { Router, Route } from "wouter";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/layout/Layout";
import {
  Home,
  TopicPage,
  NotFound,
  ToolsPage,
  LaTeXGuidePage,
  MATLABGuidePage,
} from "./pages";
import {
  ErrorBoundaryProvider,
  ErrorBoundaryTester,
} from "./components/ErrorBoundaryProvider";

function App() {
  const handleGlobalError = (error: Error, errorId: string) => {
    // Global error handler - could send to analytics service in the future
    console.warn(`Global error caught [${errorId}]:`, error);
  };

  return (
    <ErrorBoundaryProvider
      onGlobalError={handleGlobalError}
      isDevelopment={process.env.NODE_ENV === "development"}
    >
      <ThemeProvider>
        <Router>
          <Layout>
            <Route path="/" component={Home} />
            <Route path="/topic/:id" component={TopicPage} />
            <Route path="/tools" component={ToolsPage} />
            <Route path="/latex-guide" component={LaTeXGuidePage} />
            <Route path="/matlab-guide" component={MATLABGuidePage} />
            <Route path="/community" component={PlaceholderPage} />
            <Route path="*" component={NotFound} />
          </Layout>

          {/* Development-only error testing component */}
          <ErrorBoundaryTester>
            <></>
          </ErrorBoundaryTester>
        </Router>
      </ThemeProvider>
    </ErrorBoundaryProvider>
  );
}

/**
 * Placeholder component for routes that will be implemented in future tasks
 */
function PlaceholderPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-foreground mb-4">Coming Soon</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This page will be implemented in future development phases.
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Go Back
      </button>
    </div>
  );
}

export default App;
