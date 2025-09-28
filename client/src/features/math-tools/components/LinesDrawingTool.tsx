import React, { useState, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2 } from 'lucide-react';

interface LineType {
  id: string;
  name: string;
  symbol: string;
  description: string;
}

// Letters for ASCII art
const LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

// Numbers for ASCII art
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const LINE_TYPES: LineType[] = [
  // Single lines
  {
    id: 'horizontal',
    name: 'Horizontal',
    symbol: '─',
    description: 'Horizontal line',
  },
  {
    id: 'vertical',
    name: 'Vertical',
    symbol: '│',
    description: 'Vertical line',
  },
  {
    id: 'diagonal-right',
    name: 'Diagonal /',
    symbol: '╱',
    description: 'Diagonal line (right)',
  },
  {
    id: 'diagonal-left',
    name: 'Diagonal \\',
    symbol: '╲',
    description: 'Diagonal line (left)',
  },
  {
    id: 'cross',
    name: 'Cross',
    symbol: '┼',
    description: 'Cross intersection',
  },
  { id: 'tee-up', name: 'T Up', symbol: '┴', description: 'T junction up' },
  {
    id: 'tee-down',
    name: 'T Down',
    symbol: '┬',
    description: 'T junction down',
  },
  {
    id: 'tee-left',
    name: 'T Left',
    symbol: '┤',
    description: 'T junction left',
  },
  {
    id: 'tee-right',
    name: 'T Right',
    symbol: '├',
    description: 'T junction right',
  },
  {
    id: 'corner-tl',
    name: 'Corner ┌',
    symbol: '┌',
    description: 'Top-left corner',
  },
  {
    id: 'corner-tr',
    name: 'Corner ┐',
    symbol: '┐',
    description: 'Top-right corner',
  },
  {
    id: 'corner-bl',
    name: 'Corner └',
    symbol: '└',
    description: 'Bottom-left corner',
  },
  {
    id: 'corner-br',
    name: 'Corner ┘',
    symbol: '┘',
    description: 'Bottom-right corner',
  },

  // Double lines
  {
    id: 'horizontal-double',
    name: 'Horizontal Double',
    symbol: '═',
    description: 'Double horizontal line',
  },
  {
    id: 'vertical-double',
    name: 'Vertical Double',
    symbol: '║',
    description: 'Double vertical line',
  },
  {
    id: 'cross-double',
    name: 'Cross Double',
    symbol: '╬',
    description: 'Double cross intersection',
  },
  {
    id: 'tee-up-double',
    name: 'T Up Double',
    symbol: '╩',
    description: 'Double T junction up',
  },
  {
    id: 'tee-down-double',
    name: 'T Down Double',
    symbol: '╦',
    description: 'Double T junction down',
  },
  {
    id: 'tee-left-double',
    name: 'T Left Double',
    symbol: '╣',
    description: 'Double T junction left',
  },
  {
    id: 'tee-right-double',
    name: 'T Right Double',
    symbol: '╠',
    description: 'Double T junction right',
  },
  {
    id: 'corner-tl-double',
    name: 'Corner ╔',
    symbol: '╔',
    description: 'Double top-left corner',
  },
  {
    id: 'corner-tr-double',
    name: 'Corner ╗',
    symbol: '╗',
    description: 'Double top-right corner',
  },
  {
    id: 'corner-bl-double',
    name: 'Corner ╚',
    symbol: '╚',
    description: 'Double bottom-left corner',
  },
  {
    id: 'corner-br-double',
    name: 'Corner ╝',
    symbol: '╝',
    description: 'Double bottom-right corner',
  },

  // Mixed single/double lines
  {
    id: 'cross-mixed-h',
    name: 'Cross Mixed H',
    symbol: '╪',
    description: 'Cross with double horizontal',
  },
  {
    id: 'cross-mixed-v',
    name: 'Cross Mixed V',
    symbol: '╫',
    description: 'Cross with double vertical',
  },
  {
    id: 'tee-up-mixed',
    name: 'T Up Mixed',
    symbol: '╨',
    description: 'T up with double horizontal',
  },
  {
    id: 'tee-down-mixed',
    name: 'T Down Mixed',
    symbol: '╥',
    description: 'T down with double horizontal',
  },
  {
    id: 'tee-left-mixed',
    name: 'T Left Mixed',
    symbol: '╡',
    description: 'T left with double vertical',
  },
  {
    id: 'tee-right-mixed',
    name: 'T Right Mixed',
    symbol: '╞',
    description: 'T right with double vertical',
  },
];

export default function LinesDrawingTool() {
  const [selectedLine, setSelectedLine] = useState<LineType>(LINE_TYPES[0]!);
  const [canvas, setCanvas] = useState<string[][]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 20, height: 10 });
  const [useCustomText, setUseCustomText] = useState(false);
  const [customText, setCustomText] = useState('*');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const initializeCanvas = useCallback(() => {
    const newCanvas = Array(canvasSize.height)
      .fill(null)
      .map(() => Array(canvasSize.width).fill(' '));
    setCanvas(newCanvas);
  }, [canvasSize]);

  React.useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  const handleCellClick = (row: number, col: number) => {
    const newCanvas = [...canvas];
    if (newCanvas[row]) {
      const currentCell = newCanvas[row][col];
      const characterToPlace = useCustomText ? customText : selectedLine.symbol;

      // If the cell already contains the character we're trying to place, clear it
      // Otherwise, place the new character
      if (currentCell === characterToPlace) {
        newCanvas[row][col] = ' '; // Clear the cell
      } else {
        newCanvas[row][col] = characterToPlace; // Place the character
      }

      setCanvas(newCanvas);
    }
  };

  const clearCanvas = () => {
    initializeCanvas();
  };

  const exportAsText = () => {
    return canvas
      .map(row => row.map(cell => (cell === '\u00A0' ? ' ' : cell)).join(''))
      .join('\n');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportAsText());
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadAsText = () => {
    const text = exportAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lines-drawing.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            Lines Drawing Tool - WITH SPACE BUTTON ADDED
          </CardTitle>
          <CardDescription>
            Create ASCII diagrams by clicking on the canvas. Click a square
            again to clear it.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* SPACE CHARACTER TOOL - SHOULD BE VISIBLE */}
          <div className='border-4 border-red-500 rounded-lg p-4 bg-yellow-100'>
            <h2 className='text-lg font-bold mb-3 text-red-600'>
              🔲 SPACE CHARACTER TOOL
            </h2>
            <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2'>
              <Button
                variant={
                  selectedLine.id === 'space' && !useCustomText
                    ? 'default'
                    : 'outline'
                }
                size='lg'
                className='h-16 w-16 p-0 text-lg font-bold border-4 border-red-400 bg-yellow-200'
                onClick={() => {
                  setSelectedLine({
                    id: 'space',
                    name: 'Space',
                    symbol: '\u00A0',
                    description: 'Space character',
                  });
                  setUseCustomText(false);
                }}
                title='Click to select space character tool'
              >
                SPACE
              </Button>
            </div>
            <p className='text-sm font-bold text-red-600 mt-2'>
              ⬆️ CLICK THIS BUTTON TO SELECT SPACE TOOL ⬆️
            </p>
          </div>

          {/* Letters */}
          <div>
            <h3 className='text-sm font-medium mb-3'>
              Letters (SPACE BUTTON SHOULD BE IN NUMBERS)
            </h3>
            <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2'>
              {LETTERS.map((letter, index) => (
                <Button
                  key={index}
                  variant={
                    useCustomText && customText === letter
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  className='h-10 w-10 p-0 text-lg'
                  onClick={() => {
                    setCustomText(letter);
                    setUseCustomText(true);
                  }}
                  title={letter}
                >
                  {letter}
                </Button>
              ))}
            </div>
          </div>

          {/* Numbers */}
          <div>
            <h3 className='text-sm font-medium mb-3'>Numbers</h3>
            <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2'>
              {NUMBERS.map((number, index) => (
                <Button
                  key={index}
                  variant={
                    useCustomText && customText === number
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  className='h-10 w-10 p-0 text-lg'
                  onClick={() => {
                    setCustomText(number);
                    setUseCustomText(true);
                  }}
                  title={number}
                >
                  {number}
                </Button>
              ))}
              {/* Space Button */}
              <Button
                variant={
                  selectedLine.id === 'space' && !useCustomText
                    ? 'default'
                    : 'outline'
                }
                size='sm'
                className='h-10 w-16 p-0 text-xs font-bold bg-blue-100 border-blue-300'
                onClick={() => {
                  setSelectedLine({
                    id: 'space',
                    name: 'Space',
                    symbol: '\u00A0',
                    description: 'Space character',
                  });
                  setUseCustomText(false);
                }}
                title='Space character - creates visible spacing'
              >
                SPACE
              </Button>
            </div>
          </div>

          {/* Space */}
          <div>
            <h3 className='text-sm font-medium mb-3'>Space</h3>
            <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2'>
              <Button
                variant={
                  selectedLine.id === 'space' && !useCustomText
                    ? 'default'
                    : 'outline'
                }
                size='sm'
                className='h-10 w-16 p-0 text-sm font-medium'
                onClick={() => {
                  setSelectedLine({
                    id: 'space',
                    name: 'Space',
                    symbol: '\u00A0',
                    description: 'Space character',
                  });
                  setUseCustomText(false);
                }}
                title='Space character - creates visible spacing'
              >
                SPACE
              </Button>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Creates visible space characters on the canvas
            </p>
          </div>

          {/* Space Character - VISIBLE SPACE TOOL */}
          <div className='border-2 border-primary/20 rounded-lg p-3 bg-primary/5'>
            <h3 className='text-sm font-medium mb-3 text-primary'>
              🔲 Space Character
            </h3>
            <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2'>
              <Button
                variant={
                  selectedLine.id === 'space' && !useCustomText
                    ? 'default'
                    : 'outline'
                }
                size='sm'
                className='h-12 w-12 p-0 text-sm font-bold border-2'
                onClick={() => {
                  setSelectedLine({
                    id: 'space',
                    name: 'Space',
                    symbol: '\u00A0',
                    description: 'Space character',
                  });
                  setUseCustomText(false);
                }}
                title='Click to select space character tool'
              >
                SPACE
              </Button>
            </div>
            <p className='text-xs text-muted-foreground mt-2'>
              Select this to place visible space characters on the canvas
            </p>
          </div>

          {/* Line Type Selector */}
          <div>
            <h3 className='text-sm font-medium mb-3'>Select Line Type</h3>
            <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2'>
              {LINE_TYPES.map(lineType => (
                <Button
                  key={lineType.id}
                  variant={
                    selectedLine.id === lineType.id && !useCustomText
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  className='h-10 w-10 p-0 font-mono text-lg'
                  onClick={() => {
                    setSelectedLine(lineType);
                    setUseCustomText(false);
                  }}
                  title={lineType.description}
                >
                  {lineType.symbol}
                </Button>
              ))}
            </div>

            {/* Custom Text/Emoji Option */}
            <div className='mt-4 space-y-3'>
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='useCustomText'
                  checked={useCustomText}
                  onChange={e => setUseCustomText(e.target.checked)}
                  className='rounded'
                />
                <label htmlFor='useCustomText' className='text-sm font-medium'>
                  Use Custom Text/Emoji
                </label>
              </div>

              {useCustomText && (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='text'
                      value={customText}
                      onChange={e => setCustomText(e.target.value.slice(0, 2))}
                      placeholder='Type any character or emoji'
                      className='flex-1 px-3 py-2 border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground'
                      maxLength={2}
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className='px-3'
                    >
                      😀
                    </Button>
                  </div>

                  {showEmojiPicker && (
                    <div className='border rounded-lg p-3 bg-background max-h-32 overflow-y-auto'>
                      <div className='grid grid-cols-10 gap-1'>
                        {[...LETTERS, ...NUMBERS].map((char, index) => (
                          <button
                            key={index}
                            className='w-8 h-8 hover:bg-muted rounded text-lg flex items-center justify-center'
                            onClick={() => {
                              setCustomText(char);
                              setShowEmojiPicker(false);
                            }}
                            title={char}
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className='text-xs text-muted-foreground'>
                    💡 Try Letters (A, B, C), Numbers (1, 2, 3), Symbols (★, ●,
                    ♦), or Emojis (🌟, 🔥, 🎯)
                  </p>
                </div>
              )}
            </div>

            <p className='text-sm text-muted-foreground mt-2'>
              Selected:{' '}
              {useCustomText
                ? `Custom: ${customText}`
                : `${selectedLine.name} (${selectedLine.symbol})`}
            </p>
          </div>

          {/* Canvas Size Controls */}
          <div className='flex gap-4 items-center'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>Width:</label>
              <input
                type='number'
                min='5'
                max='50'
                value={canvasSize.width}
                onChange={e =>
                  setCanvasSize(prev => ({
                    ...prev,
                    width: parseInt(e.target.value) || 20,
                  }))
                }
                className='w-16 px-2 py-1 border rounded text-sm'
              />
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>Height:</label>
              <input
                type='number'
                min='5'
                max='30'
                value={canvasSize.height}
                onChange={e =>
                  setCanvasSize(prev => ({
                    ...prev,
                    height: parseInt(e.target.value) || 10,
                  }))
                }
                className='w-16 px-2 py-1 border rounded text-sm'
              />
            </div>
          </div>

          {/* Drawing Canvas */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <h4 className='text-sm font-medium'>Drawing Canvas</h4>
              <p className='text-xs text-muted-foreground'>
                💡 Click to place • Click again to clear
              </p>
            </div>
            <div className='border rounded-lg p-4 bg-muted/20'>
              <div
                ref={canvasRef}
                className='text-sm leading-none select-none'
                style={{
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                  display: 'grid',
                  gridTemplateColumns: `repeat(${canvasSize.width}, 1fr)`,
                  gap: '1px',
                }}
              >
                {canvas.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSpace = cell === '\u00A0'; // Non-breaking space
                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-4 h-4 hover:bg-primary/20 border border-transparent hover:border-primary/30 rounded-sm flex items-center justify-center text-xs ${
                          isSpace ? 'bg-primary/10 border-primary/30' : ''
                        }`}
                        style={{
                          fontFamily:
                            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                        }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        title={isSpace ? 'Space character' : undefined}
                      >
                        {cell === '\u00A0' ? ' ' : cell}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2 flex-wrap'>
            <Button onClick={clearCanvas} variant='outline' size='sm'>
              <Trash2 className='w-4 h-4 mr-2' />
              Clear
            </Button>
            <Button onClick={copyToClipboard} variant='outline' size='sm'>
              <Copy className='w-4 h-4 mr-2' />
              Copy
            </Button>
            <Button onClick={downloadAsText} variant='outline' size='sm'>
              <Download className='w-4 h-4 mr-2' />
              Download
            </Button>
          </div>

          {/* Preview */}
          <div className='border rounded-lg p-4 bg-background'>
            <h4 className='text-sm font-medium mb-2'>
              Preview (Accurate Canvas Spacing):
            </h4>
            <div className='border rounded-lg p-4 bg-muted/20 mb-4'>
              <div
                className='text-sm leading-none select-none'
                style={{
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                  display: 'grid',
                  gridTemplateColumns: `repeat(${canvasSize.width}, 1fr)`,
                  gap: '1px',
                }}
              >
                {canvas.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSpace = cell === '\u00A0'; // Non-breaking space
                    const hasContent = cell !== ' ' && cell !== '\u00A0';
                    return (
                      <div
                        key={`preview-${rowIndex}-${colIndex}`}
                        className={`w-4 h-4 flex items-center justify-center text-xs border border-transparent ${
                          isSpace ? 'bg-primary/10 border-primary/30' : ''
                        }`}
                        style={{
                          fontFamily:
                            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                          backgroundColor: hasContent
                            ? 'rgba(var(--primary), 0.1)'
                            : isSpace
                              ? 'rgba(var(--primary), 0.1)'
                              : 'transparent',
                        }}
                        title={isSpace ? 'Space character' : undefined}
                      >
                        {cell === '\u00A0' ? ' ' : cell}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <h4 className='text-sm font-medium mb-2'>
              Text Output (Copy/Paste):
            </h4>
            <pre
              className='text-xs whitespace-pre overflow-x-auto bg-muted/10 p-3 rounded border'
              style={{
                fontFamily:
                  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
              }}
            >
              {exportAsText()}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
