import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { SaveShareButtons } from './SaveShareButtons';
import { ToolResult } from '../../../lib/toolUtils';

interface ConversionUnit {
  name: string;
  symbol: string;
  toBase: number; // Multiplier to convert to base unit
  fromBase: number; // Multiplier to convert from base unit
}

interface UnitCategory {
  name: string;
  baseUnit: string;
  units: ConversionUnit[];
}

const unitCategories: UnitCategory[] = [
  {
    name: 'Length',
    baseUnit: 'meter',
    units: [
      { name: 'Millimeter', symbol: 'mm', toBase: 0.001, fromBase: 1000 },
      { name: 'Centimeter', symbol: 'cm', toBase: 0.01, fromBase: 100 },
      { name: 'Meter', symbol: 'm', toBase: 1, fromBase: 1 },
      { name: 'Kilometer', symbol: 'km', toBase: 1000, fromBase: 0.001 },
      { name: 'Inch', symbol: 'in', toBase: 0.0254, fromBase: 39.3701 },
      { name: 'Foot', symbol: 'ft', toBase: 0.3048, fromBase: 3.28084 },
      { name: 'Yard', symbol: 'yd', toBase: 0.9144, fromBase: 1.09361 },
      { name: 'Mile', symbol: 'mi', toBase: 1609.34, fromBase: 0.000621371 },
    ],
  },
  {
    name: 'Area',
    baseUnit: 'square meter',
    units: [
      {
        name: 'Square Millimeter',
        symbol: 'mm²',
        toBase: 0.000001,
        fromBase: 1000000,
      },
      {
        name: 'Square Centimeter',
        symbol: 'cm²',
        toBase: 0.0001,
        fromBase: 10000,
      },
      { name: 'Square Meter', symbol: 'm²', toBase: 1, fromBase: 1 },
      {
        name: 'Square Kilometer',
        symbol: 'km²',
        toBase: 1000000,
        fromBase: 0.000001,
      },
      {
        name: 'Square Inch',
        symbol: 'in²',
        toBase: 0.00064516,
        fromBase: 1550,
      },
      {
        name: 'Square Foot',
        symbol: 'ft²',
        toBase: 0.092903,
        fromBase: 10.7639,
      },
      { name: 'Acre', symbol: 'ac', toBase: 4046.86, fromBase: 0.000247105 },
    ],
  },
  {
    name: 'Volume',
    baseUnit: 'liter',
    units: [
      { name: 'Milliliter', symbol: 'mL', toBase: 0.001, fromBase: 1000 },
      { name: 'Liter', symbol: 'L', toBase: 1, fromBase: 1 },
      { name: 'Cubic Meter', symbol: 'm³', toBase: 1000, fromBase: 0.001 },
      {
        name: 'Fluid Ounce',
        symbol: 'fl oz',
        toBase: 0.0295735,
        fromBase: 33.814,
      },
      { name: 'Cup', symbol: 'cup', toBase: 0.236588, fromBase: 4.22675 },
      { name: 'Pint', symbol: 'pt', toBase: 0.473176, fromBase: 2.11338 },
      { name: 'Quart', symbol: 'qt', toBase: 0.946353, fromBase: 1.05669 },
      { name: 'Gallon', symbol: 'gal', toBase: 3.78541, fromBase: 0.264172 },
    ],
  },
  {
    name: 'Mass',
    baseUnit: 'kilogram',
    units: [
      { name: 'Milligram', symbol: 'mg', toBase: 0.000001, fromBase: 1000000 },
      { name: 'Gram', symbol: 'g', toBase: 0.001, fromBase: 1000 },
      { name: 'Kilogram', symbol: 'kg', toBase: 1, fromBase: 1 },
      { name: 'Ounce', symbol: 'oz', toBase: 0.0283495, fromBase: 35.274 },
      { name: 'Pound', symbol: 'lb', toBase: 0.453592, fromBase: 2.20462 },
      { name: 'Stone', symbol: 'st', toBase: 6.35029, fromBase: 0.157473 },
      { name: 'Ton', symbol: 't', toBase: 1000, fromBase: 0.001 },
    ],
  },
  {
    name: 'Temperature',
    baseUnit: 'celsius',
    units: [
      { name: 'Celsius', symbol: '°C', toBase: 1, fromBase: 1 },
      { name: 'Fahrenheit', symbol: '°F', toBase: 1, fromBase: 1 }, // Special handling
      { name: 'Kelvin', symbol: 'K', toBase: 1, fromBase: 1 }, // Special handling
    ],
  },
  {
    name: 'Angle',
    baseUnit: 'radian',
    units: [
      {
        name: 'Degree',
        symbol: '°',
        toBase: Math.PI / 180,
        fromBase: 180 / Math.PI,
      },
      { name: 'Radian', symbol: 'rad', toBase: 1, fromBase: 1 },
      {
        name: 'Gradian',
        symbol: 'grad',
        toBase: Math.PI / 200,
        fromBase: 200 / Math.PI,
      },
    ],
  },
];

export function UnitConverter() {
  const [selectedCategory, setSelectedCategory] = useState(unitCategories[0]);
  const [fromUnit, setFromUnit] = useState(selectedCategory.units[0]);
  const [toUnit, setToUnit] = useState(selectedCategory.units[1]);
  const [inputValue, setInputValue] = useState('1');
  const [result, setResult] = useState('0');
  const [lastConversion, setLastConversion] = useState<ToolResult | null>(null);

  const convertValue = (
    value: number,
    from: ConversionUnit,
    to: ConversionUnit,
    category: UnitCategory
  ) => {
    if (category.name === 'Temperature') {
      // Special handling for temperature conversions
      if (from.symbol === '°C' && to.symbol === '°F') {
        return (value * 9) / 5 + 32;
      } else if (from.symbol === '°F' && to.symbol === '°C') {
        return ((value - 32) * 5) / 9;
      } else if (from.symbol === '°C' && to.symbol === 'K') {
        return value + 273.15;
      } else if (from.symbol === 'K' && to.symbol === '°C') {
        return value - 273.15;
      } else if (from.symbol === '°F' && to.symbol === 'K') {
        return ((value - 32) * 5) / 9 + 273.15;
      } else if (from.symbol === 'K' && to.symbol === '°F') {
        return ((value - 273.15) * 9) / 5 + 32;
      }
      return value; // Same unit
    } else {
      // Standard conversion: convert to base unit, then to target unit
      const baseValue = value * from.toBase;
      return baseValue * to.fromBase;
    }
  };

  const handleConvert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('Invalid input');
      return;
    }

    const convertedValue = convertValue(
      value,
      fromUnit,
      toUnit,
      selectedCategory
    );
    const resultStr = convertedValue.toFixed(6).replace(/\.?0+$/, '');
    setResult(resultStr);

    // Create tool result for saving/sharing
    const toolResult: ToolResult = {
      toolId: 'converter',
      toolName: 'Unit Converter',
      input: {
        value,
        fromUnit: fromUnit.name,
        toUnit: toUnit.name,
        category: selectedCategory.name,
      },
      output: {
        result: resultStr,
        conversion: `${value} ${fromUnit.symbol} = ${resultStr} ${toUnit.symbol}`,
      },
      timestamp: new Date(),
    };

    setLastConversion(toolResult);
  };

  const handleCategoryChange = (category: UnitCategory) => {
    setSelectedCategory(category);
    setFromUnit(category.units[0]);
    setToUnit(category.units[1] || category.units[0]);
    setInputValue('1');
    setResult('0');
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    handleConvert();
  };

  // Auto-convert when values change
  useState(() => {
    handleConvert();
  });

  return (
    <div className='space-y-6'>
      {/* Category Selection */}
      <Card className='p-4'>
        <Label className='text-base font-semibold mb-3 block'>
          Unit Category
        </Label>
        <div className='flex flex-wrap gap-2'>
          {unitCategories.map(category => (
            <Badge
              key={category.name}
              variant={
                selectedCategory.name === category.name ? 'default' : 'outline'
              }
              className='cursor-pointer px-3 py-1'
              onClick={() => handleCategoryChange(category)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Conversion Interface */}
      <Card className='p-6'>
        <div className='space-y-6'>
          {/* From Unit */}
          <div className='space-y-2'>
            <Label htmlFor='from-value'>From</Label>
            <div className='flex gap-2'>
              <Input
                id='from-value'
                type='number'
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value);
                  setTimeout(handleConvert, 100);
                }}
                placeholder='Enter value'
                className='flex-1'
              />
              <select
                value={fromUnit.symbol}
                onChange={e => {
                  const unit = selectedCategory.units.find(
                    u => u.symbol === e.target.value
                  );
                  if (unit) {
                    setFromUnit(unit);
                    setTimeout(handleConvert, 100);
                  }
                }}
                className='px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              >
                {selectedCategory.units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className='flex justify-center'>
            <Button onClick={swapUnits} variant='outline' size='sm'>
              ⇅ Swap
            </Button>
          </div>

          {/* To Unit */}
          <div className='space-y-2'>
            <Label htmlFor='to-value'>To</Label>
            <div className='flex gap-2'>
              <Input
                id='to-value'
                type='text'
                value={result}
                readOnly
                className='flex-1 bg-muted'
              />
              <select
                value={toUnit.symbol}
                onChange={e => {
                  const unit = selectedCategory.units.find(
                    u => u.symbol === e.target.value
                  );
                  if (unit) {
                    setToUnit(unit);
                    setTimeout(handleConvert, 100);
                  }
                }}
                className='px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              >
                {selectedCategory.units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Convert Button */}
          <Button onClick={handleConvert} className='w-full'>
            Convert
          </Button>
        </div>
      </Card>

      {/* Quick Reference */}
      <Card className='p-4'>
        <h3 className='font-semibold mb-3'>
          Quick Reference - {selectedCategory.name}
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm'>
          {selectedCategory.units.map(unit => (
            <div
              key={unit.symbol}
              className='flex justify-between p-2 bg-muted/50 rounded'
            >
              <span>{unit.name}</span>
              <code className='text-muted-foreground'>{unit.symbol}</code>
            </div>
          ))}
        </div>
      </Card>

      {/* Save/Share Section */}
      {lastConversion && result !== '0' && result !== 'Invalid input' && (
        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold'>Last Conversion</h3>
              <p className='text-sm text-muted-foreground'>
                {lastConversion.output.conversion}
              </p>
            </div>
            <SaveShareButtons result={lastConversion} />
          </div>
        </Card>
      )}
    </div>
  );
}
