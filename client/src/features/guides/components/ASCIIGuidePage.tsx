import React, { useState, useCallback } from 'react';
import {
  Copy,
  Check,
  Download,
  Palette,
  Grid,
  Layout,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

interface LineType {
  id: string;
  name: string;
  symbol: string;
  description: string;
}

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
];

// AI Communication emojis from the Emoji Dictionary
const ALPHABET_LETTERS = [
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

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface InteractiveDrawingToolProps {
  copyToClipboard: (text: string, id: string) => void;
  copiedText: string | null;
}

function InteractiveDrawingTool({
  copyToClipboard,
  copiedText,
}: InteractiveDrawingToolProps) {
  const [selectedLine, setSelectedLine] = useState<LineType>(LINE_TYPES[0]);
  const [canvas, setCanvas] = useState<string[][]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 20, height: 8 });
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);

  const initializeCanvas = useCallback(() => {
    const newCanvas = Array(canvasSize.height)
      .fill(null)
      .map(() => Array(canvasSize.width).fill('\u200B')); // Zero-width space for empty cells
    setCanvas(newCanvas);
  }, [canvasSize]);

  React.useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  const handleCellClick = (row: number, col: number) => {
    const newCanvas = [...canvas];
    const currentCell = newCanvas[row][col];
    const characterToPlace =
      useCustomText && customText
        ? customText.charAt(0) || ' '
        : selectedLine.symbol;

    // If the cell already contains the character we're trying to place, clear it
    // Otherwise, place the new character
    if (currentCell === characterToPlace) {
      newCanvas[row][col] = '\u200B'; // Clear the cell (zero-width space)
    } else {
      newCanvas[row][col] = characterToPlace; // Place the character
    }

    setCanvas(newCanvas);
  };

  const clearCanvas = () => {
    initializeCanvas();
  };

  const exportAsText = () => {
    const result = canvas
      .map(row =>
        row
          .map(cell => {
            if (cell === '\u00A0') return ' '; // Non-breaking space becomes regular space
            if (cell === '\u200B') return ' '; // Zero-width space (empty) becomes regular space
            return cell;
          })
          .join('')
      )
      .join('\n');

    // Debug: Log what we're actually generating
    console.log('Canvas raw:', canvas);
    console.log('Export result:', JSON.stringify(result));
    return result;
  };

  const downloadAsText = () => {
    const text = exportAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-drawing.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className='mb-8'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Grid className='w-5 h-5 text-purple-600' />
          Interactive ASCII Drawing Tool
        </CardTitle>
        <CardDescription>
          Create your own ASCII diagrams by clicking on the canvas below. Click
          a square again to clear it.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Alphabet Letters */}
        <div>
          <h4 className='text-sm font-medium mb-3'>Letters:</h4>
          <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-13 gap-2'>
            {ALPHABET_LETTERS.map((letter, index) => (
              <Button
                key={index}
                variant={
                  useCustomText && customText === letter ? 'default' : 'outline'
                }
                size='sm'
                className='h-10 w-10 p-0 text-lg font-mono'
                onClick={() => {
                  setCustomText(letter);
                  setUseCustomText(true);
                  // Clear line selection when selecting a letter
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
          <h4 className='text-sm font-medium mb-3'>Numbers:</h4>
          <div className='grid grid-cols-5 sm:grid-cols-10 gap-2'>
            {NUMBERS.map((number, index) => (
              <Button
                key={index}
                variant={
                  useCustomText && customText === number ? 'default' : 'outline'
                }
                size='sm'
                className='h-10 w-10 p-0 text-lg font-mono'
                onClick={() => {
                  setCustomText(number);
                  setUseCustomText(true);
                  // Clear line selection when selecting a number
                }}
                title={number}
              >
                {number}
              </Button>
            ))}
          </div>
        </div>

        {/* Space Character */}
        <div>
          <h4 className='text-sm font-medium mb-3'>Space:</h4>
          <div className='grid grid-cols-5 sm:grid-cols-10 gap-2'>
            <Button
              variant={
                selectedLine.id === 'space' && !useCustomText
                  ? 'default'
                  : 'outline'
              }
              size='sm'
              className='h-10 w-16 p-0 text-sm font-bold'
              onClick={() => {
                setSelectedLine({
                  id: 'space',
                  name: 'Space',
                  symbol: '\u00A0',
                  description: 'Space character',
                });
                setUseCustomText(false);
                setCustomText('');
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

        {/* Line Type Selector */}
        <div>
          <h4 className='text-sm font-medium mb-3'>Select Line Type:</h4>
          <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-2'>
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
                  setCustomText('');
                }}
                title={lineType.description}
              >
                {lineType.symbol}
              </Button>
            ))}
          </div>
          <p className='text-sm text-muted-foreground mt-2'>
            Selected:{' '}
            {useCustomText
              ? `Custom: "${customText || ' '}"`
              : `${selectedLine.name} (${selectedLine.symbol})`}
          </p>
        </div>

        {/* Custom Text/Emoji Input */}
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={useCustomText}
                onChange={e => setUseCustomText(e.target.checked)}
                className='rounded'
              />
              <span className='text-sm font-medium'>
                Use custom text/emoji:
              </span>
            </label>
            <input
              type='text'
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder='Type any character or emoji...'
              disabled={!useCustomText}
              className='flex-1 px-3 py-1 border rounded text-sm bg-white text-black placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'
              maxLength={10}
            />
          </div>
          <div className='text-xs text-muted-foreground'>
            💡 Try: Letters (A, B, C), Numbers (1, 2, 3), Symbols (★, ●, ◆), or
            Emojis (🏠, 📊, ✅)
          </div>
        </div>

        {/* Canvas Size Controls */}
        <div className='flex gap-4 items-center'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Width:</label>
            <input
              type='number'
              min='10'
              max='40'
              value={canvasSize.width}
              onChange={e =>
                setCanvasSize(prev => ({
                  ...prev,
                  width: parseInt(e.target.value) || 20,
                }))
              }
              className='w-16 px-2 py-1 border rounded text-sm bg-white text-black'
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Height:</label>
            <input
              type='number'
              min='5'
              max='20'
              value={canvasSize.height}
              onChange={e =>
                setCanvasSize(prev => ({
                  ...prev,
                  height: parseInt(e.target.value) || 8,
                }))
              }
              className='w-16 px-2 py-1 border rounded text-sm bg-white text-black'
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
                  const isEmpty = cell === '\u200B'; // Zero-width space (empty cell)
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-4 h-4 hover:bg-primary/20 border hover:border-primary/50 rounded-sm flex items-center justify-center text-xs transition-colors ${
                        isSpace
                          ? 'bg-foreground/10 border-foreground/20'
                          : 'bg-muted/30 border-muted-foreground/20'
                      }`}
                      style={{
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                      }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      title={
                        isSpace
                          ? 'Space character'
                          : isEmpty
                            ? 'Empty cell'
                            : undefined
                      }
                    >
                      {cell === '\u00A0' ? ' ' : isEmpty ? '' : cell}
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
          <Button
            onClick={() => copyToClipboard(exportAsText(), 'drawing-canvas')}
            variant='outline'
            size='sm'
          >
            {copiedText === 'drawing-canvas' ? (
              <Check className='h-4 w-4 text-green-500 mr-2' />
            ) : (
              <Copy className='h-4 w-4 mr-2' />
            )}
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
            Preview (Visual Spacing):
          </h4>
          <div
            className='text-xs leading-none select-none mb-4'
            style={{
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
              display: 'grid',
              gridTemplateColumns: `repeat(${canvasSize.width}, 1fr)`,
              gap: '1px',
            }}
          >
            {canvas.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`preview-${rowIndex}-${colIndex}`}
                  className='w-4 h-4 flex items-center justify-center text-xs bg-muted/10'
                  style={{
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                  }}
                >
                  {cell}
                </div>
              ))
            )}
          </div>
          <h4 className='text-sm font-medium mb-2'>
            Text Output (Copy/Paste):
          </h4>
          <pre
            className='text-xs whitespace-pre overflow-x-auto'
            style={{
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
            }}
            dangerouslySetInnerHTML={{
              __html: exportAsText()
                .split('\n')
                .map(line => line.replace(/ /g, '&nbsp;'))
                .join('<br>'),
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ASCII Art Guide Page - Comprehensive guide to creating ASCII diagrams
 * Perfect for communicating layouts, structures, and visual concepts
 */
export function ASCIIGuidePage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      variant='outline'
      size='sm'
      onClick={() => copyToClipboard(text, id)}
      className='ml-2'
    >
      {copiedText === id ? (
        <Check className='h-4 w-4 text-green-500' />
      ) : (
        <Copy className='h-4 w-4' />
      )}
    </Button>
  );

  const asciiExamples = {
    basicBox: `┌─────────────────┐
│     Content     │
└─────────────────┘`,

    layoutGrid: `┌─────┬─────┬─────┐
│  A  │  B  │  C  │
├─────┼─────┼─────┤
│  D  │  E  │  F  │
└─────┴─────┴─────┘`,

    mobileDesktop: `Mobile:              Desktop:
┌─────────────┐     ┌─────┬─────────┐
│   Header    │     │Side │ Content │
├─────────────┤     │bar  │         │
│   Content   │     │     │         │
│             │     └─────┴─────────┘
└─────────────┘`,

    flowChart: `Start → Process → Decision
  ↓        ↓         ↓
Input → Validate → Output
  ↓        ↓         ↓
[Form] → [Check] → [Save]`,

    hierarchy: `App
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Main
│   ├── Sidebar
│   └── Content
└── Footer`,

    stateFlow: `Loading:     Success:      Error:
┌─────────┐  ┌─────────┐   ┌─────────┐
│ ⏳ Wait │  │ ✅ Done │   │ ❌ Fail │
└─────────┘  └─────────┘   └─────────┘`,

    formLayout: `┌─────────────────────┐
│ [Name Input]        │
│ [Email Input]       │
│ [Message Textarea]  │
│                     │
│     [Submit Btn]    │
└─────────────────────┘`,

    navigation: `┌─────────────────────────────────────┐
│ Logo  [Home] [About] [Contact] [👤] │
└─────────────────────────────────────┘`,
  };

  const characters = {
    corners: '┌ ┐ └ ┘',
    lines: '─ │ ├ ┤ ┬ ┴ ┼ ═ ║ ╠ ╣ ╦ ╩ ╬',
    arrows: '→ ← ↑ ↓ ↗ ↘ ↙ ↖',
    symbols: '• ○ ● ◦ ★ ☆ ♦ ♠ ♣ ♥',
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4'>
            <Grid className='w-8 h-8 text-purple-600 dark:text-purple-400' />
          </div>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
            ASCII Art Guide
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
            Master the art of visual communication with ASCII diagrams. Perfect
            for explaining layouts, structures, and concepts to developers and
            AI assistants.
          </p>
        </div>

        {/* Quick Start */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Palette className='w-5 h-5 text-purple-600' />
              Quick Start: Your First ASCII Diagram
            </CardTitle>
            <CardDescription>
              Let's create a simple layout diagram step by step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-2'>
                  1. Start with a basic box:
                </h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.basicBox}</pre>
                </div>
                <CopyButton text={asciiExamples.basicBox} id='basic-box' />
              </div>
              <div>
                <h4 className='font-semibold mb-2'>
                  2. Add content and structure:
                </h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.formLayout}</pre>
                </div>
                <CopyButton text={asciiExamples.formLayout} id='form-layout' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Essential Characters */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Essential ASCII Characters</CardTitle>
            <CardDescription>
              The building blocks of ASCII art - copy and paste these characters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Object.entries(characters).map(([category, chars]) => (
                <div key={category} className='space-y-2'>
                  <h4 className='font-semibold capitalize'>
                    {category.replace(/([A-Z])/g, ' $1')}
                  </h4>
                  <div className='bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-lg'>
                    {chars}
                    <CopyButton text={chars} id={category} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive ASCII Drawing Tool */}
        <InteractiveDrawingTool
          copyToClipboard={copyToClipboard}
          copiedText={copiedText}
        />

        {/* Layout Examples */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Layout className='w-5 h-5 text-purple-600' />
              Layout Diagrams
            </CardTitle>
            <CardDescription>
              Common layout patterns for web and mobile interfaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-8'>
              {/* Grid Layout */}
              <div>
                <h4 className='font-semibold mb-3'>Grid Layout</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.layoutGrid}</pre>
                </div>
                <CopyButton text={asciiExamples.layoutGrid} id='layout-grid' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Perfect for showing card grids, image galleries, or dashboard
                  layouts
                </p>
              </div>

              {/* Responsive Design */}
              <div>
                <h4 className='font-semibold mb-3'>Responsive Design</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.mobileDesktop}</pre>
                </div>
                <CopyButton
                  text={asciiExamples.mobileDesktop}
                  id='mobile-desktop'
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Show how layouts adapt across different screen sizes
                </p>
              </div>

              {/* Navigation */}
              <div>
                <h4 className='font-semibold mb-3'>Navigation Bar</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.navigation}</pre>
                </div>
                <CopyButton text={asciiExamples.navigation} id='navigation' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Header layouts with logo, menu items, and user controls
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow Diagrams */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Flow Diagrams & Processes</CardTitle>
            <CardDescription>
              Show data flow, user journeys, and system processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-8'>
              {/* Process Flow */}
              <div>
                <h4 className='font-semibold mb-3'>Process Flow</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.flowChart}</pre>
                </div>
                <CopyButton text={asciiExamples.flowChart} id='flow-chart' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Great for showing user workflows or data processing steps
                </p>
              </div>

              {/* State Changes */}
              <div>
                <h4 className='font-semibold mb-3'>State Changes</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.stateFlow}</pre>
                </div>
                <CopyButton text={asciiExamples.stateFlow} id='state-flow' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Perfect for showing loading states, success/error conditions
                </p>
              </div>

              {/* Hierarchy */}
              <div>
                <h4 className='font-semibold mb-3'>Component Hierarchy</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.hierarchy}</pre>
                </div>
                <CopyButton text={asciiExamples.hierarchy} id='hierarchy' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Show component structure, file organization, or menu
                  hierarchies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pro Tips */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Pro Tips & Best Practices</CardTitle>
            <CardDescription>
              Level up your ASCII art with these expert techniques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <h4 className='font-semibold'>✨ Enhancement Tips</h4>
                <ul className='space-y-2 text-sm'>
                  <li>
                    • Use emojis for instant recognition (see Emoji Dictionary
                    below)
                  </li>
                  <li>• Add arrows to show interactions: [Click] → [Result]</li>
                  <li>
                    • Use brackets for interactive elements: [Button], [Input]
                  </li>
                  <li>• Show scroll areas with: ↕️ Scrollable Content</li>
                  <li>• Mark important items: ⭐ Primary Action</li>
                  <li>
                    • Combine emojis with ASCII: 🏠 ┌─────┐ for Home section
                  </li>
                </ul>
              </div>
              <div className='space-y-4'>
                <h4 className='font-semibold'>🎯 Communication Tips</h4>
                <ul className='space-y-2 text-sm'>
                  <li>• Keep diagrams simple and focused</li>
                  <li>• Use consistent spacing and alignment</li>
                  <li>• Add brief explanations below diagrams</li>
                  <li>• Show before/after states for changes</li>
                  <li>• Use colors in descriptions: "Purple header"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Examples */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Interactive Examples</CardTitle>
            <CardDescription>
              Try these examples and modify them for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              <div className='bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>
                  Example: Mobile App Layout
                </h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`┌─────────────────┐
│ ← Math Farm  ⚙️ │ ← Header
├─────────────────┤
│ 📊 Dashboard    │
│ 📚 Topics       │ ← Navigation
│ 🧮 Tools        │
│ 👤 Profile      │
├─────────────────┤
│                 │
│   Main Content  │ ← Content Area
│                 │
└─────────────────┘`}</pre>
                </div>
                <CopyButton
                  text={`┌─────────────────┐
│ ← Math Farm  ⚙️ │
├─────────────────┤
│ 📊 Dashboard    │
│ 📚 Topics       │
│ 🧮 Tools        │
│ 👤 Profile      │
├─────────────────┤
│                 │
│   Main Content  │
│                 │
└─────────────────┘`}
                  id='mobile-app'
                />
              </div>

              <div className='bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>Example: Data Flow</h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`User Input → Validation → Database → Response
    ↓            ↓           ↓         ↓
  [Form]    [Check Rules] [SQLite] [Success]
    ↓            ↓           ↓         ↓
  📝 Type    ✅ Verify    💾 Save   🎉 Done`}</pre>
                </div>
                <CopyButton
                  text={`User Input → Validation → Database → Response
    ↓            ↓           ↓         ↓
  [Form]    [Check Rules] [SQLite] [Success]
    ↓            ↓           ↓         ↓
  📝 Type    ✅ Verify    💾 Save   🎉 Done`}
                  id='data-flow'
                />
              </div>

              <div className='bg-green-50 dark:bg-green-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>
                  Example: Dashboard with Emojis
                </h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`┌─────────────────────────────────────┐
│ 🏠 Dashboard    👤 Profile  ⚙️ Settings │
├─────────────────────────────────────┤
│ 📊 Analytics    📈 Growth: +15%     │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ 👥 Users    │ │ 💰 Revenue      │ │
│ │ 1,234       │ │ $12,345         │ │
│ └─────────────┘ └─────────────────┘ │
│                                     │
│ 🔔 Recent Activity:                 │
│ • ✅ New user registered            │
│ • 💾 Data backup completed          │
│ • ⚠️ Server load high               │
└─────────────────────────────────────┘`}</pre>
                </div>
                <CopyButton
                  text={`┌─────────────────────────────────────┐
│ 🏠 Dashboard    👤 Profile  ⚙️ Settings │
├─────────────────────────────────────┤
│ 📊 Analytics    📈 Growth: +15%     │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ 👥 Users    │ │ 💰 Revenue      │ │
│ │ 1,234       │ │ $12,345         │ │
│ └─────────────┘ └─────────────────┘ │
│                                     │
│ 🔔 Recent Activity:                 │
│ • ✅ New user registered            │
│ • 💾 Data backup completed          │
│ • ⚠️ Server load high               │
└─────────────────────────────────────┘`}
                  id='emoji-dashboard'
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Perfect example of how emojis make complex interfaces
                  instantly understandable to AI
                </p>
              </div>

              <div className='bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>
                  Example: E-commerce Shopping Cart
                </h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`┌─────────────────────────────────────┐
│ 🛒 Shopping Cart (3 items)          │
├─────────────────────────────────────┤
│ 📱 iPhone 15 Pro    $999.00  [❌]   │
│ 🎧 AirPods Pro      $249.00  [❌]   │
│ 📦 Phone Case       $29.99   [❌]   │
├─────────────────────────────────────┤
│ 🏷️ Promo Code: [SAVE20]    [-$255] │
│ 🚚 Shipping: FREE                   │
│ 💰 Tax: $82.40                      │
├─────────────────────────────────────┤
│ 🎯 Total: $1,105.39                 │
│                                     │
│ [💳 Checkout] [🔄 Update] [🗑️ Clear] │
└─────────────────────────────────────┘`}</pre>
                </div>
                <CopyButton
                  text={`┌─────────────────────────────────────┐
│ 🛒 Shopping Cart (3 items)          │
├─────────────────────────────────────┤
│ 📱 iPhone 15 Pro    $999.00  [❌]   │
│ 🎧 AirPods Pro      $249.00  [❌]   │
│ 📦 Phone Case       $29.99   [❌]   │
├─────────────────────────────────────┤
│ 🏷️ Promo Code: [SAVE20]    [-$255] │
│ 🚚 Shipping: FREE                   │
│ 💰 Tax: $82.40                      │
├─────────────────────────────────────┤
│ 🎯 Total: $1,105.39                 │
│                                     │
│ [💳 Checkout] [🔄 Update] [🗑️ Clear] │
└─────────────────────────────────────┘`}
                  id='shopping-cart'
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  E-commerce interface with product emojis, pricing, and action
                  buttons
                </p>
              </div>

              <div className='bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>
                  Example: Social Media Feed
                </h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`┌─────────────────────────────────────┐
│ 📱 Social Feed    🔍 Search  👤 Me   │
├─────────────────────────────────────┤
│ 👤 @john_dev • 2h ago               │
│ 🚀 Just deployed my new React app!  │
│ 🖼️ [Screenshot of app]              │
│ ❤️ 42  💬 8  🔄 12  📤 Share        │
├─────────────────────────────────────┤
│ 👤 @sarah_design • 4h ago           │
│ 🎨 New UI design for mobile app     │
│ 🖼️ [Design mockup]                  │
│ ❤️ 128 💬 23 🔄 45  📤 Share        │
├─────────────────────────────────────┤
│ 👤 @tech_news • 6h ago              │
│ 📢 Breaking: New JavaScript features │
│ 🔗 Read more: techblog.com/js2024   │
│ ❤️ 89  💬 15 🔄 67  📤 Share        │
└─────────────────────────────────────┘`}</pre>
                </div>
                <CopyButton
                  text={`┌─────────────────────────────────────┐
│ 📱 Social Feed    🔍 Search  👤 Me   │
├─────────────────────────────────────┤
│ 👤 @john_dev • 2h ago               │
│ 🚀 Just deployed my new React app!  │
│ 🖼️ [Screenshot of app]              │
│ ❤️ 42  💬 8  🔄 12  📤 Share        │
├─────────────────────────────────────┤
│ 👤 @sarah_design • 4h ago           │
│ 🎨 New UI design for mobile app     │
│ 🖼️ [Design mockup]                  │
│ ❤️ 128 💬 23 🔄 45  📤 Share        │
├─────────────────────────────────────┤
│ 👤 @tech_news • 6h ago              │
│ 📢 Breaking: New JavaScript features │
│ 🔗 Read more: techblog.com/js2024   │
│ ❤️ 89  💬 15 🔄 67  📤 Share        │
└─────────────────────────────────────┘`}
                  id='social-feed'
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Social media interface showing posts, interactions, and
                  engagement metrics
                </p>
              </div>

              <div className='bg-red-50 dark:bg-red-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>
                  Example: API Error Handling Flow
                </h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`📤 API Request → 🌐 Server → 🗄️ Database
     ↓              ↓           ↓
   [POST]        [Process]   [Query]
     ↓              ↓           ↓
     
🔍 Validation Check:
├─ ✅ Valid Data → 💾 Save → 🎉 Success (200)
├─ ❌ Invalid → ⚠️ Error → 🚫 Bad Request (400)
├─ 🔐 No Auth → 🛡️ Block → 🚨 Unauthorized (401)
└─ 💥 Server Error → 📝 Log → ⚡ Internal Error (500)

📊 Response Format:
┌─────────────────────┐
│ Status: ✅ 200 OK   │
│ Data: {...}         │
│ Message: "Success"  │
│ Timestamp: 🕐 Now   │
└─────────────────────┘`}</pre>
                </div>
                <CopyButton
                  text={`📤 API Request → 🌐 Server → 🗄️ Database
     ↓              ↓           ↓
   [POST]        [Process]   [Query]
     ↓              ↓           ↓
     
🔍 Validation Check:
├─ ✅ Valid Data → 💾 Save → 🎉 Success (200)
├─ ❌ Invalid → ⚠️ Error → 🚫 Bad Request (400)
├─ 🔐 No Auth → 🛡️ Block → 🚨 Unauthorized (401)
└─ 💥 Server Error → 📝 Log → ⚡ Internal Error (500)

📊 Response Format:
┌─────────────────────┐
│ Status: ✅ 200 OK   │
│ Data: {...}         │
│ Message: "Success"  │
│ Timestamp: 🕐 Now   │
└─────────────────────┘`}
                  id='api-flow'
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  API request flow with error handling, status codes, and
                  response structure
                </p>
              </div>

              <div className='bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>
                  Example: DevOps CI/CD Pipeline
                </h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`🔄 CI/CD Pipeline Status:

📝 Code Push → 🔍 Tests → 🏗️ Build → 🚀 Deploy
     ↓           ↓         ↓         ↓
   [Git]      [Jest]    [Docker]  [AWS]
     ↓           ↓         ↓         ↓
   ✅ Done    ✅ Pass   ✅ Built   🟡 Running

📊 Pipeline Stages:
┌─────────────────────────────────────┐
│ Stage 1: 🧪 Unit Tests      ✅ 2m   │
│ Stage 2: 🔒 Security Scan   ✅ 1m   │
│ Stage 3: 📦 Build Image     ✅ 3m   │
│ Stage 4: 🚀 Deploy Staging  🟡 1m   │
│ Stage 5: 🧪 E2E Tests       ⏳ ...  │
│ Stage 6: 🌐 Deploy Prod     ⏸️ Wait │
└─────────────────────────────────────┘

🔔 Notifications: 📧 Email, 💬 Slack, 📱 SMS`}</pre>
                </div>
                <CopyButton
                  text={`🔄 CI/CD Pipeline Status:

📝 Code Push → 🔍 Tests → 🏗️ Build → 🚀 Deploy
     ↓           ↓         ↓         ↓
   [Git]      [Jest]    [Docker]  [AWS]
     ↓           ↓         ↓         ↓
   ✅ Done    ✅ Pass   ✅ Built   🟡 Running

📊 Pipeline Stages:
┌─────────────────────────────────────┐
│ Stage 1: 🧪 Unit Tests      ✅ 2m   │
│ Stage 2: 🔒 Security Scan   ✅ 1m   │
│ Stage 3: 📦 Build Image     ✅ 3m   │
│ Stage 4: 🚀 Deploy Staging  🟡 1m   │
│ Stage 5: 🧪 E2E Tests       ⏳ ...  │
│ Stage 6: 🌐 Deploy Prod     ⏸️ Wait │
└─────────────────────────────────────┘

🔔 Notifications: 📧 Email, 💬 Slack, 📱 SMS`}
                  id='cicd-pipeline'
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  DevOps pipeline with stages, status indicators, and deployment
                  flow
                </p>
              </div>

              <div className='bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>
                  Example: Learning Management System
                </h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`┌─────────────────────────────────────┐
│ 🎓 Math Farm LMS  👤 Student Portal │
├─────────────────────────────────────┤
│ 📚 Current Course: Advanced Calculus│
│ 📈 Progress: ████████░░ 80%         │
│                                     │
│ 📋 Today's Tasks:                   │
│ ✅ 📖 Read Chapter 5                │
│ 🟡 🧮 Practice Problems (3/10)      │
│ ⏳ 📝 Submit Assignment             │
│ 📅 🎯 Quiz Tomorrow at 2 PM         │
│                                     │
│ 🏆 Achievements:                    │
│ • 🥇 Perfect Score Streak (5 days)  │
│ • 🔥 Study Streak (12 days)         │
│ • 💡 Problem Solver (50 solved)     │
│                                     │
│ 📊 Grade: A- (92%)  🎯 Target: A+   │
└─────────────────────────────────────┘`}</pre>
                </div>
                <CopyButton
                  text={`┌─────────────────────────────────────┐
│ 🎓 Math Farm LMS  👤 Student Portal │
├─────────────────────────────────────┤
│ 📚 Current Course: Advanced Calculus│
│ 📈 Progress: ████████░░ 80%         │
│                                     │
│ 📋 Today's Tasks:                   │
│ ✅ 📖 Read Chapter 5                │
│ 🟡 🧮 Practice Problems (3/10)      │
│ ⏳ 📝 Submit Assignment             │
│ 📅 🎯 Quiz Tomorrow at 2 PM         │
│                                     │
│ 🏆 Achievements:                    │
│ • 🥇 Perfect Score Streak (5 days)  │
│ • 🔥 Study Streak (12 days)         │
│ • 💡 Problem Solver (50 solved)     │
│                                     │
│ 📊 Grade: A- (92%)  🎯 Target: A+   │
└─────────────────────────────────────┘`}
                  id='lms-dashboard'
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Educational platform with progress tracking, tasks, and
                  gamification elements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emoji Dictionary for AI Communication */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              🤖 Emoji Dictionary for AI Communication
            </CardTitle>
            <CardDescription>
              Essential emojis that instantly communicate meaning to AI
              assistants when explaining structures and interfaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Navigation & UI Elements */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-purple-600 dark:text-purple-400'>
                  Navigation & UI
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>🏠 Home/Dashboard</span>
                    <CopyButton text='🏠' id='emoji-home' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>⚙️ Settings/Config</span>
                    <CopyButton text='⚙️' id='emoji-settings' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>👤 User/Profile</span>
                    <CopyButton text='👤' id='emoji-user' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔍 Search</span>
                    <CopyButton text='🔍' id='emoji-search' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📱 Mobile View</span>
                    <CopyButton text='📱' id='emoji-mobile' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>💻 Desktop View</span>
                    <CopyButton text='💻' id='emoji-desktop' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🍔 Menu/Hamburger</span>
                    <CopyButton text='🍔' id='emoji-menu' />
                  </div>
                </div>
              </div>

              {/* Actions & States */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-blue-600 dark:text-blue-400'>
                  Actions & States
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>✅ Success/Complete</span>
                    <CopyButton text='✅' id='emoji-success' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>❌ Error/Failed</span>
                    <CopyButton text='❌' id='emoji-error' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>⏳ Loading/Processing</span>
                    <CopyButton text='⏳' id='emoji-loading' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔄 Refresh/Reload</span>
                    <CopyButton text='🔄' id='emoji-refresh' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>💾 Save/Store</span>
                    <CopyButton text='💾' id='emoji-save' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📤 Upload/Send</span>
                    <CopyButton text='📤' id='emoji-upload' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📥 Download/Receive</span>
                    <CopyButton text='📥' id='emoji-download' />
                  </div>
                </div>
              </div>

              {/* Content Types */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-green-600 dark:text-green-400'>
                  Content Types
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>📝 Text/Form Input</span>
                    <CopyButton text='📝' id='emoji-text' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🖼️ Image/Media</span>
                    <CopyButton text='🖼️' id='emoji-image' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📊 Chart/Data</span>
                    <CopyButton text='📊' id='emoji-chart' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📋 List/Table</span>
                    <CopyButton text='📋' id='emoji-list' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🗂️ Folder/Category</span>
                    <CopyButton text='🗂️' id='emoji-folder' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📄 Document/Page</span>
                    <CopyButton text='📄' id='emoji-document' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🎯 Target/Goal</span>
                    <CopyButton text='🎯' id='emoji-target' />
                  </div>
                </div>
              </div>

              {/* System & Technical */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-orange-600 dark:text-orange-400'>
                  System & Technical
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>🔧 Tools/Utilities</span>
                    <CopyButton text='🔧' id='emoji-tools' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🗄️ Database/Storage</span>
                    <CopyButton text='🗄️' id='emoji-database' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🌐 API/Network</span>
                    <CopyButton text='🌐' id='emoji-api' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔐 Security/Auth</span>
                    <CopyButton text='🔐' id='emoji-security' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>⚡ Performance/Fast</span>
                    <CopyButton text='⚡' id='emoji-performance' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🚀 Deploy/Launch</span>
                    <CopyButton text='🚀' id='emoji-deploy' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔔 Notification/Alert</span>
                    <CopyButton text='🔔' id='emoji-notification' />
                  </div>
                </div>
              </div>

              {/* Math & Education */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-purple-600 dark:text-purple-400'>
                  Math & Education
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>🧮 Calculator/Math</span>
                    <CopyButton text='🧮' id='emoji-calculator' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📚 Learning/Books</span>
                    <CopyButton text='📚' id='emoji-books' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🎓 Education/Course</span>
                    <CopyButton text='🎓' id='emoji-education' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📐 Geometry/Design</span>
                    <CopyButton text='📐' id='emoji-geometry' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔬 Science/Research</span>
                    <CopyButton text='🔬' id='emoji-science' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>💡 Idea/Concept</span>
                    <CopyButton text='💡' id='emoji-idea' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🏆 Achievement/Success</span>
                    <CopyButton text='🏆' id='emoji-achievement' />
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-pink-600 dark:text-pink-400'>
                  Communication
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>💬 Chat/Message</span>
                    <CopyButton text='💬' id='emoji-chat' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📢 Announcement</span>
                    <CopyButton text='📢' id='emoji-announcement' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>❓ Help/Question</span>
                    <CopyButton text='❓' id='emoji-help' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>ℹ️ Information/Details</span>
                    <CopyButton text='ℹ️' id='emoji-info' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>⚠️ Warning/Caution</span>
                    <CopyButton text='⚠️' id='emoji-warning' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🎉 Celebration/Success</span>
                    <CopyButton text='🎉' id='emoji-celebration' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>👥 Team/Community</span>
                    <CopyButton text='👥' id='emoji-team' />
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Examples */}
            <div className='mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg'>
              <h4 className='font-semibold mb-4'>
                💡 AI Communication Examples
              </h4>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <h5 className='font-medium mb-2'>Instead of saying:</h5>
                  <div className='bg-white dark:bg-gray-800 p-3 rounded text-sm font-mono'>
                    "The header has a home link, settings, and user profile"
                  </div>
                </div>
                <div>
                  <h5 className='font-medium mb-2'>Say this:</h5>
                  <div className='bg-white dark:bg-gray-800 p-3 rounded text-sm font-mono'>
                    "Header: 🏠 Home | ⚙️ Settings | 👤 Profile"
                  </div>
                </div>
              </div>
              <div className='mt-4 text-sm text-gray-600 dark:text-gray-400'>
                <strong>Why it works:</strong> AI assistants instantly
                understand the visual hierarchy and purpose of each element,
                leading to more accurate implementations.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools & Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Tools & Resources</CardTitle>
            <CardDescription>
              Helpful tools and references for creating ASCII art
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-3'>Online ASCII Tools</h4>
                <ul className='space-y-2 text-sm'>
                  <li>• ASCII Table Generator (for data tables)</li>
                  <li>• Box Drawing Character Reference</li>
                  <li>• Unicode Symbol Picker</li>
                  <li>• ASCII Art Text Generators</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-3'>Keyboard Shortcuts</h4>
                <ul className='space-y-2 text-sm font-mono'>
                  <li>• Alt + 196 = ─ (horizontal line)</li>
                  <li>• Alt + 179 = │ (vertical line)</li>
                  <li>• Alt + 218 = ┌ (top-left corner)</li>
                  <li>• Alt + 191 = ┐ (top-right corner)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='text-center mt-12 p-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
          <h3 className='text-lg font-semibold mb-2'>
            Ready to Create Amazing ASCII Art? 🎨
          </h3>
          <p className='text-gray-600 dark:text-gray-300 mb-4'>
            Start with simple boxes and gradually build more complex diagrams.
            Remember: clarity beats complexity every time!
          </p>
          <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm inline-block'>
            <pre>{`┌─────────────────┐
│  Happy Coding!  │
│       🚀        │
└─────────────────┘`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
