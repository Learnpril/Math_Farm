// Shared symbol sets for topic-specific toolbars
export interface SymbolData {
  symbol: string;
  name: string;
}

export const getTopicSymbols = (topic: string): SymbolData[] => {
  const symbolSets: Record<string, SymbolData[]> = {
    arithmetic: [
      { symbol: "%", name: "Percent" },
      { symbol: "×", name: "Times" },
      { symbol: "÷", name: "Divide" },
      { symbol: "/", name: "Fraction" },
      { symbol: ".", name: "Decimal" },
    ],
    algebra: [
      { symbol: "²", name: "Squared" },
      { symbol: "³", name: "Cubed" },
      { symbol: "(", name: "Left Parenthesis" },
      { symbol: ")", name: "Right Parenthesis" },
      { symbol: "x", name: "Variable x" },
      { symbol: "y", name: "Variable y" },
      { symbol: "=", name: "Equals" },
      { symbol: "+", name: "Plus" },
      { symbol: "-", name: "Minus" },
    ],
    geometry: [
      { symbol: "π", name: "Pi" },
      { symbol: "°", name: "Degree" },
      { symbol: "√", name: "Square Root" },
      { symbol: "²", name: "Squared" },
      { symbol: "³", name: "Cubed" },
    ],
    trigonometry: [
      { symbol: "π", name: "Pi" },
      { symbol: "/", name: "Fraction" },
      { symbol: "°", name: "Degree" },
      { symbol: "θ", name: "Theta" },
      { symbol: "²", name: "Squared" },
      { symbol: "1/2", name: "One Half" },
      { symbol: "2π", name: "Two Pi" },
      { symbol: "π/4", name: "Pi over 4" },
    ],
    calculus: [
      { symbol: "∫", name: "Integral" },
      { symbol: "²", name: "Squared" },
      { symbol: "³", name: "Cubed" },
      { symbol: "x²", name: "x squared" },
      { symbol: "3x²", name: "3x squared" },
      { symbol: "+ C", name: "Plus constant" },
      { symbol: "→", name: "Approaches" },
      { symbol: "lim", name: "Limit" },
    ],
    statistics: [
      { symbol: "σ", name: "Sigma (std dev)" },
      { symbol: "μ", name: "Mu (mean)" },
      { symbol: "√", name: "Square Root" },
      { symbol: "²", name: "Squared" },
      { symbol: "∪", name: "Union" },
      { symbol: "∩", name: "Intersection" },
      { symbol: "≤", name: "Less/Equal" },
      { symbol: "%", name: "Percent" },
      { symbol: "0.68", name: "68%" },
    ],
    "linear-algebra": [
      { symbol: "[", name: "Left Bracket" },
      { symbol: "]", name: "Right Bracket" },
      { symbol: ",", name: "Comma" },
      { symbol: "·", name: "Dot Product" },
      { symbol: "×", name: "Times" },
      { symbol: "-", name: "Minus" },
      { symbol: "True", name: "True" },
      { symbol: "False", name: "False" },
    ],
    "differential-equations": [
      { symbol: "y", name: "y variable" },
      { symbol: "x", name: "x variable" },
      { symbol: "C", name: "Constant" },
      { symbol: "e^", name: "e to the power" },
      { symbol: "²", name: "Squared" },
      { symbol: "dy/dx", name: "dy over dx" },
      { symbol: "d²y/dx²", name: "Second derivative" },
      { symbol: "e^(2x)", name: "e to 2x" },
      { symbol: "True", name: "True" },
      { symbol: "False", name: "False" },
    ],
    "game-design-math": [
      { symbol: "[", name: "Left Bracket" },
      { symbol: "]", name: "Right Bracket" },
      { symbol: ",", name: "Comma" },
      { symbol: "·", name: "Dot Product" },
      { symbol: "×", name: "Times" },
      { symbol: "√", name: "Square Root" },
      { symbol: "²", name: "Squared" },
      { symbol: "°", name: "Degree" },
      { symbol: "(", name: "Left Parenthesis" },
      { symbol: ")", name: "Right Parenthesis" },
    ],
  };

  return symbolSets[topic] || [];
};
