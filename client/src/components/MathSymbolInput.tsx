import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Calculator,
  Pi,
  Infinity,
  Square,
  // SquareRoot, // Not available in this version
  Superscript,
  Subscript,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

interface MathSymbol {
  symbol: string;
  display: string;
  category:
    | "greek"
    | "operators"
    | "constants"
    | "functions"
    | "logic"
    | "geometry";
  description: string;
}

interface MathSymbolInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: "numeric" | "text" | "expression";
}

const mathSymbols: MathSymbol[] = [
  // Greek letters
  {
    symbol: "π",
    display: "π",
    category: "greek",
    description: "Pi (3.14159...)",
  },
  { symbol: "α", display: "α", category: "greek", description: "Alpha" },
  { symbol: "β", display: "β", category: "greek", description: "Beta" },
  { symbol: "γ", display: "γ", category: "greek", description: "Gamma" },
  { symbol: "δ", display: "δ", category: "greek", description: "Delta" },
  { symbol: "θ", display: "θ", category: "greek", description: "Theta" },
  { symbol: "λ", display: "λ", category: "greek", description: "Lambda" },
  { symbol: "μ", display: "μ", category: "greek", description: "Mu" },
  { symbol: "σ", display: "σ", category: "greek", description: "Sigma" },
  { symbol: "φ", display: "φ", category: "greek", description: "Phi" },
  { symbol: "ω", display: "ω", category: "greek", description: "Omega" },

  // Mathematical operators
  {
    symbol: "±",
    display: "±",
    category: "operators",
    description: "Plus or minus",
  },
  {
    symbol: "∓",
    display: "∓",
    category: "operators",
    description: "Minus or plus",
  },
  {
    symbol: "×",
    display: "×",
    category: "operators",
    description: "Multiplication",
  },
  { symbol: "÷", display: "÷", category: "operators", description: "Division" },
  {
    symbol: "≠",
    display: "≠",
    category: "operators",
    description: "Not equal",
  },
  {
    symbol: "≤",
    display: "≤",
    category: "operators",
    description: "Less than or equal",
  },
  {
    symbol: "≥",
    display: "≥",
    category: "operators",
    description: "Greater than or equal",
  },
  {
    symbol: "≈",
    display: "≈",
    category: "operators",
    description: "Approximately equal",
  },
  {
    symbol: "∝",
    display: "∝",
    category: "operators",
    description: "Proportional to",
  },

  // Constants and special numbers
  { symbol: "∞", display: "∞", category: "constants", description: "Infinity" },
  {
    symbol: "e",
    display: "e",
    category: "constants",
    description: "Euler's number (2.718...)",
  },
  {
    symbol: "i",
    display: "i",
    category: "constants",
    description: "Imaginary unit",
  },

  // Functions and operations
  {
    symbol: "√",
    display: "√",
    category: "functions",
    description: "Square root",
  },
  {
    symbol: "∛",
    display: "∛",
    category: "functions",
    description: "Cube root",
  },
  { symbol: "²", display: "²", category: "functions", description: "Squared" },
  { symbol: "³", display: "³", category: "functions", description: "Cubed" },
  {
    symbol: "⁻¹",
    display: "⁻¹",
    category: "functions",
    description: "Inverse",
  },
  { symbol: "∑", display: "∑", category: "functions", description: "Sum" },
  { symbol: "∏", display: "∏", category: "functions", description: "Product" },
  { symbol: "∫", display: "∫", category: "functions", description: "Integral" },
  {
    symbol: "∂",
    display: "∂",
    category: "functions",
    description: "Partial derivative",
  },

  // Logic and sets
  { symbol: "∧", display: "∧", category: "logic", description: "Logical AND" },
  { symbol: "∨", display: "∨", category: "logic", description: "Logical OR" },
  { symbol: "¬", display: "¬", category: "logic", description: "Logical NOT" },
  { symbol: "∈", display: "∈", category: "logic", description: "Element of" },
  {
    symbol: "∉",
    display: "∉",
    category: "logic",
    description: "Not element of",
  },
  { symbol: "⊂", display: "⊂", category: "logic", description: "Subset of" },
  {
    symbol: "⊆",
    display: "⊆",
    category: "logic",
    description: "Subset or equal",
  },
  { symbol: "∪", display: "∪", category: "logic", description: "Union" },
  { symbol: "∩", display: "∩", category: "logic", description: "Intersection" },

  // Geometry
  { symbol: "°", display: "°", category: "geometry", description: "Degree" },
  { symbol: "∠", display: "∠", category: "geometry", description: "Angle" },
  {
    symbol: "⊥",
    display: "⊥",
    category: "geometry",
    description: "Perpendicular",
  },
  { symbol: "∥", display: "∥", category: "geometry", description: "Parallel" },
  { symbol: "△", display: "△", category: "geometry", description: "Triangle" },
  { symbol: "□", display: "□", category: "geometry", description: "Square" },
  { symbol: "○", display: "○", category: "geometry", description: "Circle" },
];

const commonAnswers = [
  { value: "true", display: "True", category: "boolean" },
  { value: "false", display: "False", category: "boolean" },
  { value: "yes", display: "Yes", category: "boolean" },
  { value: "no", display: "No", category: "boolean" },
  { value: "undefined", display: "Undefined", category: "special" },
  { value: "DNE", display: "Does Not Exist", category: "special" },
  {
    value: "all real numbers",
    display: "All Real Numbers",
    category: "special",
  },
  { value: "no solution", display: "No Solution", category: "special" },
];

export function MathSymbolInput({
  value,
  onChange,
  placeholder = "Enter your answer...",
  disabled = false,
  className = "",
  type = "text",
}: MathSymbolInputProps) {
  const [showSymbols, setShowSymbols] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Update cursor position when input changes
  useEffect(() => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  }, [value]);

  const insertSymbol = (symbol: string) => {
    const newValue =
      value.slice(0, cursorPosition) + symbol + value.slice(cursorPosition);
    onChange(newValue);

    // Set focus back to input and position cursor after inserted symbol
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPosition = cursorPosition + symbol.length;
        inputRef.current.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }
    }, 0);
  };

  const insertCommonAnswer = (answer: string) => {
    onChange(answer);
    setShowSymbols(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setCursorPosition(target.selectionStart || 0);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setCursorPosition(target.selectionStart || 0);
  };

  const categories = [
    { key: "all", label: "All", icon: Calculator },
    { key: "greek", label: "Greek", icon: Pi },
    { key: "operators", label: "Operators", icon: Calculator },
    { key: "constants", label: "Constants", icon: Infinity },
    { key: "functions", label: "Functions", icon: SquareRoot },
    { key: "logic", label: "Logic", icon: Square },
    { key: "geometry", label: "Geometry", icon: Square },
  ];

  const filteredSymbols =
    selectedCategory === "all"
      ? mathSymbols
      : mathSymbols.filter((s) => s.category === selectedCategory);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyUp={handleKeyUp}
          placeholder={
            placeholder || "MathSymbolInput is working! Click the π button →"
          }
          disabled={disabled}
          className="pr-16 border-2 border-primary/30"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-800 font-bold z-10"
          onClick={() => setShowSymbols(!showSymbols)}
          disabled={disabled}
          title="Click to show mathematical symbols"
        >
          {showSymbols ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />π
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />π
            </>
          )}
        </Button>
      </div>

      {showSymbols && (
        <Card className="p-4 border shadow-lg">
          <div className="space-y-4">
            {/* Quick Common Answers */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                Quick Answers
              </h4>
              <div className="flex flex-wrap gap-1">
                {commonAnswers.map((answer) => (
                  <Button
                    key={answer.value}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => insertCommonAnswer(answer.value)}
                  >
                    {answer.display}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                Mathematical Symbols
              </h4>
              <div className="flex flex-wrap gap-1 mb-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.key}
                      variant={
                        selectedCategory === category.key
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => setSelectedCategory(category.key)}
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>

              {/* Symbol Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                {filteredSymbols.map((symbol) => (
                  <Button
                    key={symbol.symbol}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 text-lg hover:bg-primary hover:text-primary-foreground"
                    onClick={() => insertSymbol(symbol.symbol)}
                    title={symbol.description}
                  >
                    {symbol.display}
                  </Button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSymbols(false)}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Close
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
