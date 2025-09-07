interface SimpleMathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
}

export function SimpleMathKeyboard({ onSymbolClick }: SimpleMathKeyboardProps) {
  const symbols = [
    { symbol: "π", label: "Pi" },
    { symbol: "°", label: "Degree" },
    { symbol: "√", label: "Square Root" },
    { symbol: "²", label: "Squared" },
    { symbol: "³", label: "Cubed" },
    { symbol: "∞", label: "Infinity" },
    { symbol: "±", label: "Plus/Minus" },
    { symbol: "×", label: "Multiply" },
    { symbol: "÷", label: "Divide" },
    { symbol: "≠", label: "Not Equal" },
    { symbol: "≤", label: "Less/Equal" },
    { symbol: "≥", label: "Greater/Equal" },
    { symbol: "α", label: "Alpha" },
    { symbol: "β", label: "Beta" },
    { symbol: "θ", label: "Theta" },
    { symbol: "∑", label: "Sum" },
    { symbol: "∫", label: "Integral" },
    { symbol: "∂", label: "Partial" },
  ];

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        border: "2px solid #6366f1",
        borderRadius: "8px",
        padding: "16px",
        margin: "16px 0",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: "#4338ca",
          marginBottom: "12px",
        }}
      >
        📱 Math Symbol Keyboard - Click to insert:
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "8px",
        }}
      >
        {symbols.map((item) => (
          <button
            key={item.symbol}
            onClick={() => onSymbolClick(item.symbol)}
            style={{
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              minHeight: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={item.label}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#4f46e5";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#6366f1";
            }}
          >
            {item.symbol}
          </button>
        ))}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginTop: "8px",
          textAlign: "center",
        }}
      >
        💡 Tip: You can also type "pi" for π, "deg" for °, "sqrt" for √
      </div>
    </div>
  );
}
