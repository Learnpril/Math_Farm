import { PageContainer, Section } from "../components/layout/Layout";
import { HeroSection } from "../components/HeroSection";
import { MathDemo } from "../components/MathDemo";
import { TopicsGrid } from "../components/TopicsGrid";
import { ToolsSection } from "../components/ToolsSection";
import { PracticeSection } from "../components/PracticeSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { ServiceHours } from "../components/ServiceHours";

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
      <Section
        id="topics"
        ariaLabel="Mathematics topics"
        className="bg-background"
      >
        <PageContainer>
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Explore Mathematics Topics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover a comprehensive curriculum covering everything from basic
              arithmetic to advanced mathematical concepts.
            </p>

            {/* Topics Grid with actual topic cards */}
            <div className="mt-12">
              <TopicsGrid
                onTopicClick={(topicId) => {
                  // Navigate to topic page - will be implemented in future tasks
                  console.log("Navigate to topic:", topicId);
                  // For now, just show an alert
                  alert(
                    `Topic "${topicId}" clicked! Navigation will be implemented in future tasks.`
                  );
                }}
              />
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Tools Section */}
      <ToolsSection className="bg-muted/50" />

      {/* Practice Section */}
      <Section
        id="practice"
        ariaLabel="Practice problems"
        className="bg-background"
      >
        <PageContainer>
          <PracticeSection />
        </PageContainer>
      </Section>

      {/* MathJax Demo Section */}
      <Section
        id="math-demo"
        ariaLabel="Mathematical expressions demo"
        className="bg-background"
      >
        <MathDemo />
      </Section>

      {/* Features Section */}
      <FeaturesSection className="bg-muted/50" />

      {/* About Section */}
      <Section id="about" ariaLabel="About Math Farm" className="bg-background">
        <PageContainer>
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              About Math Farm
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground">
              <p>
                Math Farm is a comprehensive, self-hosted mathematics learning
                platform designed for independent learners of all levels.
              </p>
              <p>
                Our platform emphasizes accessibility, performance, and privacy.
                All computations run client-side, ensuring fast responses and
                complete data privacy.
              </p>
              <p>
                From elementary arithmetic to advanced calculus, specialized
                topics like LaTeX and MATLAB, Math Farm provides the tools and
                guidance you need to master mathematics at your own pace.
              </p>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Service Hours Section */}
      <Section id="hours" ariaLabel="Service hours" className="bg-background">
        <PageContainer>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Service Hours
              </h2>
              <p className="text-lg text-muted-foreground">
                Platform maintenance and update schedule
              </p>
            </div>
            <ServiceHours />
          </div>
        </PageContainer>
      </Section>
    </>
  );
}
