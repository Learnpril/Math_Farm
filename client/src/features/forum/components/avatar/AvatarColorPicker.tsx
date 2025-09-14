/**
 * Avatar Color Picker Component
 * Math Farm Community Forum - Color Customization Interface
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { X, Palette, RotateCcw } from 'lucide-react';

interface AvatarColorPickerProps {
  itemId: string;
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

// Predefined color palette for quick selection
const COLOR_PALETTE = [
  // Hair colors
  '#8B4513',
  '#D2691E',
  '#CD853F',
  '#F4A460',
  '#DEB887',
  '#FFE4B5',
  '#000000',
  '#2F4F4F',
  '#696969',
  '#A0A0A0',
  '#C0C0C0',
  '#FFFFFF',

  // Vibrant colors
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#FF7F50',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8C471',

  // Math-themed colors (purple theme variations)
  '#8B5CF6',
  '#A855F7',
  '#9333EA',
  '#7C3AED',
  '#6D28D9',
  '#5B21B6',
  '#4C1D95',
  '#3730A3',
  '#312E81',
  '#1E1B4B',
  '#0F0A2E',
  '#050315',

  // Pastel colors
  '#FFB3BA',
  '#FFDFBA',
  '#FFFFBA',
  '#BAFFC9',
  '#BAE1FF',
  '#E1BAFF',
  '#FFCCCB',
  '#FFE4E1',
  '#F0FFF0',
  '#E6E6FA',
  '#FFF8DC',
  '#F5F5DC',
];

// HSL to RGB conversion
const hslToRgb = (
  h: number,
  s: number,
  l: number
): [number, number, number] => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// RGB to HSL conversion
const rgbToHsl = (
  r: number,
  g: number,
  b: number
): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }

    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

// Parse hex color to RGB
const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
};

// RGB to hex conversion
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const AvatarColorPicker: React.FC<AvatarColorPickerProps> = ({
  itemId,
  currentColor,
  onColorChange,
  onClose,
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [customHex, setCustomHex] = useState(currentColor);

  // Parse current color to HSL for sliders
  const rgb = hexToRgb(currentColor);
  const [hue, saturation, lightness] = rgb
    ? rgbToHsl(rgb[0], rgb[1], rgb[2])
    : [0, 50, 50];

  const [currentHue, setCurrentHue] = useState(hue);
  const [currentSaturation, setCurrentSaturation] = useState(saturation);
  const [currentLightness, setCurrentLightness] = useState(lightness);

  // Update color from HSL sliders
  const updateColorFromHSL = useCallback((h: number, s: number, l: number) => {
    const [r, g, b] = hslToRgb(h, s, l);
    const hex = rgbToHex(r, g, b);
    setSelectedColor(hex);
    setCustomHex(hex);
  }, []);

  // Handle HSL slider changes
  const handleHueChange = useCallback(
    (value: number) => {
      setCurrentHue(value);
      updateColorFromHSL(value, currentSaturation, currentLightness);
    },
    [currentSaturation, currentLightness, updateColorFromHSL]
  );

  const handleSaturationChange = useCallback(
    (value: number) => {
      setCurrentSaturation(value);
      updateColorFromHSL(currentHue, value, currentLightness);
    },
    [currentHue, currentLightness, updateColorFromHSL]
  );

  const handleLightnessChange = useCallback(
    (value: number) => {
      setCurrentLightness(value);
      updateColorFromHSL(currentHue, currentSaturation, value);
    },
    [currentHue, currentSaturation, updateColorFromHSL]
  );

  // Handle palette color selection
  const handlePaletteColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    setCustomHex(color);

    // Update HSL sliders
    const rgb = hexToRgb(color);
    if (rgb) {
      const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      setCurrentHue(h);
      setCurrentSaturation(s);
      setCurrentLightness(l);
    }
  }, []);

  // Handle custom hex input
  const handleHexChange = useCallback((value: string) => {
    setCustomHex(value);

    // Validate and update if valid hex
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setSelectedColor(value);

      // Update HSL sliders
      const rgb = hexToRgb(value);
      if (rgb) {
        const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
        setCurrentHue(h);
        setCurrentSaturation(s);
        setCurrentLightness(l);
      }
    }
  }, []);

  // Apply color change
  const handleApply = useCallback(() => {
    onColorChange(selectedColor);
    onClose();
  }, [selectedColor, onColorChange, onClose]);

  // Reset to original color
  const handleReset = useCallback(() => {
    setSelectedColor(currentColor);
    setCustomHex(currentColor);

    const rgb = hexToRgb(currentColor);
    if (rgb) {
      const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      setCurrentHue(h);
      setCurrentSaturation(s);
      setCurrentLightness(l);
    }
  }, [currentColor]);

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card className='w-full max-w-md max-h-[90vh] overflow-y-auto'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2'>
            <Palette className='w-5 h-5' />
            Color Picker
          </CardTitle>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Color Preview */}
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <Label>Preview</Label>
              <div className='flex gap-2 mt-1'>
                <div
                  className='w-16 h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700'
                  style={{ backgroundColor: selectedColor }}
                />
                <div className='flex-1 space-y-1'>
                  <div className='text-sm font-medium'>Current</div>
                  <div className='text-xs text-muted-foreground'>
                    {selectedColor}
                  </div>
                  <div className='text-sm font-medium'>Original</div>
                  <div className='text-xs text-muted-foreground'>
                    {currentColor}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HSL Sliders */}
          <div className='space-y-4'>
            <div>
              <Label>Hue: {currentHue}°</Label>
              <input
                type='range'
                min='0'
                max='360'
                value={currentHue}
                onChange={e => handleHueChange(Number(e.target.value))}
                className='w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer'
              />
            </div>

            <div>
              <Label>Saturation: {currentSaturation}%</Label>
              <input
                type='range'
                min='0'
                max='100'
                value={currentSaturation}
                onChange={e => handleSaturationChange(Number(e.target.value))}
                className='w-full h-2 rounded-lg appearance-none cursor-pointer'
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${currentHue}, 0%, ${currentLightness}%), 
                    hsl(${currentHue}, 100%, ${currentLightness}%))`,
                }}
              />
            </div>

            <div>
              <Label>Lightness: {currentLightness}%</Label>
              <input
                type='range'
                min='0'
                max='100'
                value={currentLightness}
                onChange={e => handleLightnessChange(Number(e.target.value))}
                className='w-full h-2 rounded-lg appearance-none cursor-pointer'
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${currentHue}, ${currentSaturation}%, 0%), 
                    hsl(${currentHue}, ${currentSaturation}%, 50%), 
                    hsl(${currentHue}, ${currentSaturation}%, 100%))`,
                }}
              />
            </div>
          </div>

          {/* Custom Hex Input */}
          <div>
            <Label htmlFor='hex-input'>Hex Color</Label>
            <Input
              id='hex-input'
              type='text'
              value={customHex}
              onChange={e => handleHexChange(e.target.value)}
              placeholder='#000000'
              className='font-mono'
            />
          </div>

          {/* Color Palette */}
          <div>
            <Label>Color Palette</Label>
            <div className='grid grid-cols-8 gap-1 mt-2'>
              {COLOR_PALETTE.map((color, index) => (
                <button
                  key={index}
                  className={`
                    w-8 h-8 rounded border-2 transition-all hover:scale-110
                    ${
                      selectedColor === color
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-200 dark:border-gray-700'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePaletteColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2 pt-4'>
            <Button variant='outline' onClick={handleReset} className='flex-1'>
              <RotateCcw className='w-4 h-4 mr-2' />
              Reset
            </Button>
            <Button onClick={handleApply} className='flex-1'>
              Apply Color
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarColorPicker;
