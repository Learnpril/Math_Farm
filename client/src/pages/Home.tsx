import { PageContainer, Section } from '../components/layout/Layout';
import { HeroSection } from '../components/HeroSection';
import { MathDemo } from '../components/MathDemo';
import { TopicsGrid } from '../components/TopicsGrid';

/**
 * Home page component with placeholder sections for future implementation
 * Includes proper semantic structure and ARIA landmarks
 */
export function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Topics Section */}
      <Section id="topics" ariaLabel="Mathematics topics" className="bg-background">
        <PageContainer>
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Explore Mathematics Topics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover a comprehensive curriculum covering everything from basic arithmetic 
              to advanced mathematical concepts.
            </p>
            
            {/* Topics Grid with actual topic cards */}
            <div className="mt-12">
              <TopicsGrid 
                onTopicClick={(topicId) => {
                  // Navigate to topic page - will be implemented in future tasks
                  console.log('Navigate to topic:', topicId);
                  // For now, just show an alert
                  alert(`Topic "${topicId}" clicked! Navigation will be implemented in future tasks.`);
                }}
              />
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Tools Section */}
      <Section id="tools" ariaLabel="Interactive tools" className="bg-muted/50">
        <PageContainer>
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Interactive Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience powerful mathematical tools with real-time calculations 
              and interactive demonstrations.
            </p>
            
            {/* Placeholder for tool demos - will be implemented in future tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="p-8 bg-card border border-border rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Graphing Calculator</h3>
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Interactive graph placeholder</p>
                </div>
              </div>
              <div className="p-8 bg-card border border-border rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Equation Solver</h3>
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Calculator interface placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Practice Section */}
      <Section id="practice" ariaLabel="Practice problems" className="bg-background">
        <PageContainer>
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Practice & Learn
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Engage with interactive practice problems and track your progress 
              with gamified learning experiences.
            </p>
            
            {/* Placeholder for practice examples - will be implemented in future tasks */}
            <div className="max-w-2xl mx-auto mt-12">
              <div className="p-8 bg-card border border-border rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Sample Problem</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Interactive practice problems with step-by-step solutions will be available here.
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Progress tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* MathJax Demo Section */}
      <Section id="math-demo" ariaLabel="Mathematical expressions demo" className="bg-background">
        <MathDemo />
      </Section>

      {/* About Section */}
      <Section id="about" ariaLabel="About Math Farm" className="bg-muted/50">
        <PageContainer>
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              About Math Farm
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground">
              <p>
                Math Farm is a comprehensive, self-hosted mathematics learning platform 
                designed for independent learners of all levels.
              </p>
              <p>
                Our platform emphasizes accessibility, performance, and privacy. 
                All computations run client-side, ensuring fast responses and complete data privacy.
              </p>
              <p>
                From elementary arithmetic to advanced calculus, specialized topics like 
                LaTeX and MATLAB, Math Farm provides the tools and guidance you need 
                to master mathematics at your own pace.
              </p>
            </div>
            
            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-card border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Self-Hosted</h3>
                <p className="text-muted-foreground text-sm">
                  Complete control over your learning environment with no external dependencies.
                </p>
              </div>
              <div className="p-6 bg-card border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Privacy-Focused</h3>
                <p className="text-muted-foreground text-sm">
                  All data stays local. No tracking, no external services, complete privacy.
                </p>
              </div>
              <div className="p-6 bg-card border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Accessible</h3>
                <p className="text-muted-foreground text-sm">
                  WCAG 2.2 compliant with full keyboard navigation and screen reader support.
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>
    </>
  );
}