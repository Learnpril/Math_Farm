import { PageContainer, Section } from './layout/Layout';
import { CallToActionButtons } from './CallToActionButtons';

interface HeroSectionProps {
  className?: string;
}

/**
 * Hero section component with gradient background and call-to-action buttons
 * Features responsive design, accessibility compliance, and smooth scrolling navigation
 */
export function HeroSection({ className = '' }: HeroSectionProps) {
  const handleStartLearning = () => {
    const topicsElement = document.getElementById('topics');
    if (topicsElement) {
      topicsElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleExploreTools = () => {
    // Navigate to tools page - will be implemented when tools page is created
    // For now, we'll use Wouter's navigation when available
    window.location.href = '/tools';
  };

  return (
    <Section 
      id="hero" 
      ariaLabel="Welcome and introduction" 
      className={`bg-gradient-to-br from-primary/10 to-accent/10 ${className}`}
    >
      <PageContainer>
        <div className="text-center space-y-8">
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Welcome to{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Math Farm
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your comprehensive mathematics learning platform. 
              From elementary arithmetic to advanced calculus, 
              learn at your own pace with interactive tools and step-by-step guidance.
            </p>
          </div>

          {/* Call to action buttons */}
          <CallToActionButtons
            onStartLearning={handleStartLearning}
            onExploreTools={handleExploreTools}
          />

          {/* Additional hero content */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h2 className="sr-only">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-primary/20 rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Interactive Learning</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Engage with dynamic problems and real-time feedback
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-accent/20 rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Self-Paced</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Learn at your own speed with personalized progress tracking
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-primary/20 rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Privacy-Focused</h3>
                <p className="text-sm text-muted-foreground text-center">
                  All data stays local with complete privacy protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}