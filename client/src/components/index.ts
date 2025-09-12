/**
 * Component exports
 */

export { TopicCard } from './TopicCard';
export { TopicsSection } from './TopicsSection';
export { TopicsGrid } from './TopicsGrid';
export { MathExpression } from './MathExpression';
export { MathRenderingErrorBoundary } from './MathRenderingErrorBoundary';
export { HomePageErrorBoundary } from './HomePageErrorBoundary';
export {
  ErrorBoundaryProvider,
  useErrorBoundary,
  useThrowError,
} from './ErrorBoundaryProvider';
export { HeroSection } from './HeroSection';
export { CallToActionButtons } from './CallToActionButtons';
export { ThemeProvider } from './ThemeProvider';

// Math tools components moved to features/math-tools
export { CalculatorDemo } from '../features/math-tools/components/CalculatorDemo';
export { EquationSolverDemo } from '../features/math-tools/components/EquationSolverDemo';
export { FunctionGrapherDemo } from '../features/math-tools/components/FunctionGrapherDemo';
export { UnitConverterDemo } from '../features/math-tools/components/UnitConverterDemo';
export { FeatureCard } from './FeatureCard';
export { FeaturesSection } from './FeaturesSection';
