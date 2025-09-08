import { useState, useEffect } from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  BookOpen,
  Lightbulb,
  CheckCircle,
  Eye,
  EyeOff,
  Play,
} from "lucide-react";
import { cn } from "../lib/utils";
import type {
  TopicLessonContent,
  ContentSection,
  MathExample,
} from "../data/lessonContent";

interface LessonContentProps {
  lessonContent: TopicLessonContent;
  onSectionComplete?: (sectionId: string) => void;
  completedSections?: string[];
}

interface ExampleCardProps {
  example: MathExample;
  isExpanded: boolean;
  onToggle: () => void;
}

function ExampleCard({ example, isExpanded, onToggle }: ExampleCardProps) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground">{example.title}</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {isExpanded ? "Hide Details" : "Show Details"}
        </Button>
      </div>

      <div className="mb-3">
        <p className="text-sm text-muted-foreground mb-2">
          {example.concept ? "Concept:" : "Problem:"}
        </p>
        <p className="font-medium">
          {example.concept || (example as any).problem}
        </p>
      </div>

      {example.demonstration && (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground mb-2">Demonstration:</p>
          <p className="text-foreground">{example.demonstration}</p>
        </div>
      )}

      <div className="mb-3">
        <p className="text-sm text-muted-foreground mb-2">
          Mathematical Expression:
        </p>
        <div className="bg-muted p-3 rounded-lg">
          <MathJax>{`$$${example.mathExpression}$$`}</MathJax>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 border-t pt-3">
          {(example as any).solution && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Solution:</p>
              <p className="font-semibold text-primary">
                {(example as any).solution}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Step-by-step explanation:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              {example.steps.map((step, index) => (
                <li key={index} className="text-sm leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {example.keyTakeaway && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Key Takeaway:
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {example.keyTakeaway}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

interface ContentSectionComponentProps {
  section: ContentSection;
  isCompleted: boolean;
  onComplete: () => void;
}

function ContentSectionComponent({
  section,
  isCompleted,
  onComplete,
}: ContentSectionComponentProps) {
  const [expandedExamples, setExpandedExamples] = useState<Set<string>>(
    new Set()
  );
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleExample = (exampleId: string) => {
    setExpandedExamples((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exampleId)) {
        newSet.delete(exampleId);
      } else {
        newSet.add(exampleId);
      }
      return newSet;
    });
    setHasInteracted(true);
  };

  const getSectionIcon = (type: ContentSection["type"]) => {
    switch (type) {
      case "explanation":
        return <BookOpen className="w-4 h-4" />;
      case "example":
        return <Lightbulb className="w-4 h-4" />;
      case "interactive":
        return <Play className="w-4 h-4" />;

      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getSectionBadgeVariant = (type: ContentSection["type"]) => {
    switch (type) {
      case "explanation":
        return "secondary";
      case "example":
        return "default";
      case "interactive":
        return "outline";

      default:
        return "secondary";
    }
  };

  useEffect(() => {
    // Auto-mark as complete if user has interacted with examples or it's an explanation they've viewed
    if (hasInteracted && !isCompleted) {
      onComplete();
    }
  }, [hasInteracted, isCompleted, onComplete]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getSectionIcon(section.type)}
            <Badge variant={getSectionBadgeVariant(section.type) as any}>
              {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
            </Badge>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground">{section.content}</p>
      </div>

      {section.mathExpressions && section.mathExpressions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Key Expressions:
          </p>
          <div className="grid gap-2">
            {section.mathExpressions.map((expression, index) => (
              <div key={index} className="bg-muted p-3 rounded-lg">
                <MathJax>{`$$${expression}$$`}</MathJax>
              </div>
            ))}
          </div>
        </div>
      )}

      {section.examples && section.examples.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Examples:</p>
          {section.examples.map((example) => (
            <ExampleCard
              key={example.id}
              example={example}
              isExpanded={expandedExamples.has(example.id)}
              onToggle={() => toggleExample(example.id)}
            />
          ))}
        </div>
      )}

      {section.interactiveDemo && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Interactive Demo:
          </p>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Play className="w-4 h-4" />
              <span className="font-medium">Interactive Demonstration</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {section.interactiveDemo.description}
            </p>
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Interactive demo will be implemented with JSXGraph integration
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setHasInteracted(true)}
              >
                Launch Demo
              </Button>
            </div>
          </Card>
        </div>
      )}

      {!isCompleted && section.type === "explanation" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setHasInteracted(true);
            onComplete();
          }}
          className="mt-4"
        >
          Mark as Complete
        </Button>
      )}
    </div>
  );
}

export function LessonContent({
  lessonContent,
  onSectionComplete,
  completedSections = [],
}: LessonContentProps) {
  const mathJaxConfig = {
    loader: { load: ["[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
    },
    options: {
      menuOptions: {
        settings: {
          assistiveMml: true,
        },
      },
    },
  };

  const handleSectionComplete = (sectionId: string) => {
    if (onSectionComplete && !completedSections.includes(sectionId)) {
      onSectionComplete(sectionId);
    }
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            Lesson Content
          </h2>
          <div className="text-sm text-muted-foreground">
            {completedSections.length} of {lessonContent.sections.length}{" "}
            sections completed
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={[lessonContent.sections[0]?.id]}
          className="space-y-2"
        >
          {lessonContent.sections.map((section) => {
            const isCompleted = completedSections.includes(section.id);

            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className={cn(
                  "border rounded-lg px-4",
                  isCompleted &&
                    "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                )}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span className="font-medium">{section.title}</span>
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ContentSectionComponent
                    section={section}
                    isCompleted={isCompleted}
                    onComplete={() => handleSectionComplete(section.id)}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {completedSections.length === lessonContent.sections.length && (
          <Card className="p-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Lesson Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You've completed all sections of this lesson. Great work!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MathJaxContext>
  );
}
