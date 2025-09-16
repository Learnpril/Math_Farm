import { useLocation } from 'wouter';
import { PageContainer, Section } from '../components/layout/Layout';
import { HeroSection } from '../components/HeroSection';

import { TopicsGrid } from '../components/TopicsGrid';
import { ToolsSection } from '../features/math-tools/components';

import { FeaturesSection } from '../components/FeaturesSection';
import { ServiceHours } from '../components/ServiceHours';
import { HomePageErrorBoundary } from '../components/HomePageErrorBoundary';

/**
 * Home page component with comprehensive error boundaries
 * Includes proper semantic structure and ARIA landmarks
 */
export function Home() {
  const [location, setLocation] = useLocation();
  return (
    <HomePageErrorBoundary
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      {/* Hero Section */}
      <HeroSection />

      {/* Topics and Tools sections are now in sidebars, so we hide them on home page */}

      {/* Features Section */}
      <FeaturesSection className='bg-muted/50' />

      {/* About Section */}
      <Section id='about' ariaLabel='About Math Farm' className='bg-background'>
        <PageContainer>
          <div className='text-center space-y-6'>
            <h2
              className='text-3xl md:text-4xl font-bold text-foreground'
              data-testid='home-about-heading'
            >
              About Math Farm
            </h2>
            <div className='max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground'>
              <p data-testid='home-about-description-1'>
                Math Farm is a comprehensive, self-hosted mathematics learning
                platform designed for independent learners of all levels.
              </p>
              <p data-testid='home-about-description-2'>
                Our platform emphasizes accessibility, performance, and privacy.
                All computations run client-side, ensuring fast responses and
                complete data privacy.
              </p>
              <p data-testid='home-about-description-3'>
                From elementary arithmetic to advanced calculus, specialized
                topics like LaTeX and MATLAB, Math Farm provides the tools and
                guidance you need to master mathematics at your own pace.
              </p>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Service Hours Section */}
      <Section id='hours' ariaLabel='Service hours' className='bg-background'>
        <PageContainer>
          <div className='max-w-2xl mx-auto'>
            <div className='text-center mb-8'>
              <h2
                className='text-3xl md:text-4xl font-bold text-foreground mb-4'
                data-testid='home-hours-heading'
              >
                Service Hours
              </h2>
              <p
                className='text-lg text-muted-foreground'
                data-testid='home-hours-description'
              >
                Platform maintenance and update schedule
              </p>
            </div>
            <ServiceHours />
          </div>
        </PageContainer>
      </Section>
    </HomePageErrorBoundary>
  );
}
