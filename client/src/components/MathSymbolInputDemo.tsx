import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MathSymbolInput } from "./MathSymbolInput";
import { Badge } from "./ui/badge";
import { MathExpression } from "./MathExpression";

export function MathSymbolInputDemo() {
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");

  const examples = [
    {
      question: "What is the area of a circle with radius 5?",
      mathExpression: "A = \\pi r^2, \\text{ where } r = 5",
      answer: answer1,
      setAnswer: setAnswer1,
      correctAnswer: "25π",
      hint: "Use the π button to insert the pi symbol",
    },
    {
      question: "Express the square root of 25",
      mathExpression: "\\sqrt{25} = ?",
      answer: answer2,
      setAnswer: setAnswer2,
      correctAnswer: "√25",
      hint: "Use the √ button to insert the square root symbol",
    },
    {
      question: "What is 90 degrees in mathematical notation?",
      mathExpression: "90° = ?",
      answer: answer3,
      setAnswer: setAnswer3,
      correctAnswer: "90°",
      hint: "Use the ° button to insert the degree symbol",
    },
  ];

  const checkAnswer = (userAnswer: string, correctAnswer: string) => {
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, "");
    return normalize(userAnswer) === normalize(correctAnswer);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Mathematical Symbol Input Demo
        </h2>
        <p className="text-muted-foreground">
          Try typing mathematical symbols using the symbol buttons below each
          input field
        </p>
      </div>

      <div className="grid gap-6">
        {examples.map((example, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">Example {index + 1}</Badge>
                {example.question}
              </CardTitle>
              {example.mathExpression && (
                <div className="p-3 bg-muted rounded-lg">
                  <MathExpression expression={example.mathExpression} />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <MathSymbolInput
                  value={example.answer}
                  onChange={example.setAnswer}
                  placeholder="Click the dropdown arrow to see symbol buttons..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 {example.hint}
                </p>
              </div>

              {example.answer && (
                <div
                  className={`p-3 rounded-lg border ${
                    checkAnswer(example.answer, example.correctAnswer)
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}
                >
                  {checkAnswer(example.answer, example.correctAnswer) ? (
                    <div>
                      <strong>✅ Correct!</strong> You entered:{" "}
                      <code>{example.answer}</code>
                    </div>
                  ) : (
                    <div>
                      <strong>📝 Your answer:</strong>{" "}
                      <code>{example.answer}</code>
                      <br />
                      <small>
                        Expected: <code>{example.correctAnswer}</code>
                      </small>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">
            Available Symbol Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Greek Letters</h4>
              <p className="text-muted-foreground">
                π, α, β, γ, δ, θ, λ, μ, σ, φ, ω
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Mathematical Operators</h4>
              <p className="text-muted-foreground">±, ∓, ×, ÷, ≠, ≤, ≥, ≈, ∝</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Constants & Functions</h4>
              <p className="text-muted-foreground">
                ∞, e, i, √, ∛, ², ³, ⁻¹, ∑, ∏, ∫, ∂
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Geometry & Logic</h4>
              <p className="text-muted-foreground">
                °, ∠, ⊥, ∥, △, □, ○, ∧, ∨, ¬, ∈, ∉
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-background rounded border">
            <h4 className="font-medium mb-2">Quick Answer Buttons</h4>
            <p className="text-muted-foreground text-sm">
              Common answers like True, False, Yes, No, Undefined, Does Not
              Exist, All Real Numbers, and No Solution are available as quick
              buttons.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
