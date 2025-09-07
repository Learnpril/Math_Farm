import { useState } from "react";
import { evaluate } from "mathjs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { SaveShareButtons } from "./SaveShareButtons";
import { ToolResult } from "../../lib/toolUtils";

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<ToolResult | null>(
    null
  );

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = previousValue || "0";
      try {
        const result = evaluate(`${currentValue} ${operation} ${display}`);
        setDisplay(String(result));
        setPreviousValue(String(result));
      } catch (error) {
        setDisplay("Error");
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
        return;
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (previousValue !== null && operation) {
      try {
        const expression = `${previousValue} ${operation} ${display}`;
        const result = evaluate(expression);
        const resultStr = String(result);

        // Create tool result for saving/sharing
        const toolResult: ToolResult = {
          toolId: "calculator",
          toolName: "Advanced Calculator",
          input: { expression },
          output: { result: resultStr },
          timestamp: new Date(),
        };

        setLastCalculation(toolResult);
        setDisplay(resultStr);
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
      } catch (error) {
        setDisplay("Error");
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
        setLastCalculation(null);
      }
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay("0");
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const evaluateExpression = () => {
    try {
      const result = evaluate(display);
      const resultStr = String(result);

      // Create tool result for saving/sharing
      const toolResult: ToolResult = {
        toolId: "calculator",
        toolName: "Advanced Calculator",
        input: { expression: display },
        output: { result: resultStr },
        timestamp: new Date(),
      };

      setLastCalculation(toolResult);
      setDisplay(resultStr);
      setWaitingForOperand(true);
    } catch (error) {
      setDisplay("Error");
      setWaitingForOperand(true);
      setLastCalculation(null);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        {/* Display */}
        <div className="bg-muted p-4 rounded-lg">
          <Input
            value={display}
            onChange={(e) => setDisplay(e.target.value)}
            className="text-right text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                evaluateExpression();
              } else if (e.key === "Escape") {
                clear();
              }
            }}
          />
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <Button variant="outline" onClick={clear} className="col-span-2">
            Clear
          </Button>
          <Button variant="outline" onClick={clearEntry}>
            CE
          </Button>
          <Button variant="outline" onClick={() => inputOperation("/")}>
            ÷
          </Button>

          {/* Row 2 */}
          <Button variant="outline" onClick={() => inputNumber("7")}>
            7
          </Button>
          <Button variant="outline" onClick={() => inputNumber("8")}>
            8
          </Button>
          <Button variant="outline" onClick={() => inputNumber("9")}>
            9
          </Button>
          <Button variant="outline" onClick={() => inputOperation("*")}>
            ×
          </Button>

          {/* Row 3 */}
          <Button variant="outline" onClick={() => inputNumber("4")}>
            4
          </Button>
          <Button variant="outline" onClick={() => inputNumber("5")}>
            5
          </Button>
          <Button variant="outline" onClick={() => inputNumber("6")}>
            6
          </Button>
          <Button variant="outline" onClick={() => inputOperation("-")}>
            −
          </Button>

          {/* Row 4 */}
          <Button variant="outline" onClick={() => inputNumber("1")}>
            1
          </Button>
          <Button variant="outline" onClick={() => inputNumber("2")}>
            2
          </Button>
          <Button variant="outline" onClick={() => inputNumber("3")}>
            3
          </Button>
          <Button
            variant="outline"
            onClick={() => inputOperation("+")}
            className="row-span-2"
          >
            +
          </Button>

          {/* Row 5 */}
          <Button
            variant="outline"
            onClick={() => inputNumber("0")}
            className="col-span-2"
          >
            0
          </Button>
          <Button variant="outline" onClick={inputDecimal}>
            .
          </Button>

          {/* Equals button */}
          <Button
            onClick={calculate}
            className="col-span-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            =
          </Button>
        </div>

        {/* Advanced Functions */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputOperation("^")}
          >
            x^y
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                const input = parseFloat(display);
                const result = Math.sqrt(input);
                const resultStr = String(result);

                const toolResult: ToolResult = {
                  toolId: "calculator",
                  toolName: "Advanced Calculator",
                  input: { operation: "sqrt", value: input },
                  output: { result: resultStr },
                  timestamp: new Date(),
                };

                setLastCalculation(toolResult);
                setDisplay(resultStr);
                setWaitingForOperand(true);
              } catch (error) {
                setDisplay("Error");
                setLastCalculation(null);
              }
            }}
          >
            √
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                const input = parseFloat(display);
                const result = 1 / input;
                const resultStr = String(result);

                const toolResult: ToolResult = {
                  toolId: "calculator",
                  toolName: "Advanced Calculator",
                  input: { operation: "reciprocal", value: input },
                  output: { result: resultStr },
                  timestamp: new Date(),
                };

                setLastCalculation(toolResult);
                setDisplay(resultStr);
                setWaitingForOperand(true);
              } catch (error) {
                setDisplay("Error");
                setLastCalculation(null);
              }
            }}
          >
            1/x
          </Button>
        </div>

        {/* Save/Share Section */}
        {lastCalculation && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Last calculation
              </span>
              <SaveShareButtons result={lastCalculation} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
