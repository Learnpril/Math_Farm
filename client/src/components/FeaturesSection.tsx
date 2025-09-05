import {
  Shield,
  Zap,
  Users,
  BookOpen,
  Calculator,
  Accessibility,
  Globe,
  Heart,
  Smartphone,
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { PageContainer } from "./layout/Layout";

interface FeaturesSectionProps {
  className?: string;
}

/**
 * Features section highlighting Math Farm's key benefits and capabilities
 * Showcases platform advantages with visual icons and clear descriptions
 */
export function FeaturesSection({ className = "" }: FeaturesSectionProps) {
  const features = [
    {
      icon: Shield,
      title: "Privacy-Focused",
      description:
        "All data stays local. No tracking, no external services, complete privacy. Your learning journey remains completely private.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Client-side computations ensure instant responses. No server delays, no waiting - just immediate mathematical solutions.",
    },
    {
      icon: Globe,
      title: "Self-Hosted",
      description:
        "Complete control over your learning environment. Host on your own server with no external dependencies or subscriptions.",
    },
    {
      icon: Accessibility,
      title: "Fully Accessible",
      description:
        "WCAG 2.2 compliant with full keyboard navigation, screen reader support, and high contrast themes for all users.",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Curriculum",
      description:
        "From elementary arithmetic to advanced calculus, plus specialized topics like LaTeX and MATLAB programming.",
    },
    {
      icon: Calculator,
      title: "Interactive Tools",
      description:
        "Built-in graphing calculator, equation solver, and mathematical expression renderer with step-by-step solutions.",
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description:
        "Optimized for all devices - desktop, tablet, and mobile. Learn mathematics anywhere, anytime, on any device.",
    },
    {
      icon: Users,
      title: "Open Source",
      description:
        "Free and open-source software. Contribute to the project, customize features, and help build the future of math education.",
    },
    {
      icon: Heart,
      title: "Gamified Learning",
      description:
        "Progress tracking, achievement badges, and streak counters make learning engaging and motivating.",
    },
  ];

  return (
    <section
      className={`py-16 ${className}`}
      aria-labelledby="features-heading"
      role="region"
    >
      <PageContainer>
        <div className="text-center space-y-6 mb-12">
          <h2
            id="features-heading"
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            Why Choose Math Farm?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the features that make Math Farm the ideal platform for
            independent mathematics learning. Built with privacy, performance,
            and accessibility at its core.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className="h-full"
              aria-label={`Feature ${index + 1}: ${feature.title}`}
            />
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                const element = document.getElementById("topics");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Navigate to topics section"
            >
              Explore Topics
            </button>
            <button
              onClick={() => {
                const element = document.getElementById("practice");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 bg-secondary text-secondary-foreground border border-border rounded-lg font-medium hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Navigate to practice section"
            >
              Try Practice Problems
            </button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
