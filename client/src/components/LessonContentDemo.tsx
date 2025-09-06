import { useState } from "react";
import { LessonContent } from "./LessonContent";
import { JSXGraphDemo, demoInitializers, demoConfigs } from "./JSXGraphDemo";
import { lessonContentData } from "../data/lessonContent";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function LessonContentDemo() {
  const [selectedTopic, setSelectedTopic] = useState<string>("arithmetic");
  const [completedSections, setCompletedSections] = useState<
    Record<string, string[]>
  >({});

  const availableTopics = Object.keys(lessonContentData);

  const handleSectionComplete = (topicId: string) => (sectionId: string) => {
    setCompletedSections((prev) => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), sectionId].filter(
        (id, index, arr) => arr.indexOf(id) === index
      ), // Remove duplicates
    }));
  };

  const resetProgress = () => {
    setCompletedSections({});
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Lesson Content System Demo
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This demo showcases the lesson content system with MathJax
          integration, accordion-based sections, and interactive mathematical
          demonstrations.
        </p>
      </div>

      {/* Topic Selector */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Select a Topic</h2>
            <Button variant="outline" size="sm" onClick={resetProgress}>
              Reset Progress
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableTopics.map((topicId) => {
              const lessonContent = lessonContentData[topicId];
              const completed = completedSections[topicId] || [];
              const total = lessonContent.sections.length;

              return (
                <Button
                  key={topicId}
                  variant={selectedTopic === topicId ? "default" : "outline"}
                  onClick={() => setSelectedTopic(topicId)}
                  className="flex items-center gap-2"
                >
                  <span className="capitalize">
                    {topicId.replace("-", " ")}
                  </span>
                  {completed.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {completed.length}/{total}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Lesson Content */}
      {selectedTopic && lessonContentData[selectedTopic] && (
        <LessonContent
          lessonContent={lessonContentData[selectedTopic]}
          onSectionComplete={handleSectionComplete(selectedTopic)}
          completedSections={completedSections[selectedTopic] || []}
        />
      )}

      {/* Interactive Demos */}
      {selectedTopic === "geometry" && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-foreground">
            Interactive Demonstrations
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <JSXGraphDemo
              id="demo-circle-area"
              config={demoConfigs.geometryShapes}
              onInit={demoInitializers.circleArea}
              title="Circle Area Calculator"
              description="Drag the radius point to see how the area changes"
            />

            <JSXGraphDemo
              id="demo-triangle-area"
              config={demoConfigs.geometryShapes}
              onInit={demoInitializers.triangleArea}
              title="Triangle Area Calculator"
              description="Move the vertices to explore triangle area calculation"
            />
          </div>
        </div>
      )}

      {selectedTopic === "algebra" && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-foreground">
            Interactive Function Explorer
          </h3>

          <JSXGraphDemo
            id="demo-quadratic-function"
            config={demoConfigs.functionPlotter}
            onInit={demoInitializers.quadraticFunction}
            title="Quadratic Function Explorer"
            description="Adjust the sliders to see how coefficients affect the parabola"
          />
        </div>
      )}

      {/* Progress Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Progress Summary</h3>
        <div className="space-y-2">
          {availableTopics.map((topicId) => {
            const lessonContent = lessonContentData[topicId];
            const completed = completedSections[topicId] || [];
            const total = lessonContent.sections.length;
            const percentage = total > 0 ? (completed.length / total) * 100 : 0;

            return (
              <div key={topicId} className="flex items-center justify-between">
                <span className="capitalize font-medium">
                  {topicId.replace("-", " ")}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-[3rem]">
                    {completed.length}/{total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
