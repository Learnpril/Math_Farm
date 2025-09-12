import React, { useState, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ToolDemo } from './ToolDemo';
import { ArrowLeftRight, Calculator } from 'lucide-react';

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

export interface UnitConverterDemoProps {
  className?: string;
}

export const UnitConverterDemo: React.FC<UnitConverterDemoProps> = ({
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [inputValue, setInputValue] = useState('1');
  const [result, setResult] = useState('');

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
      name: 'Weight',
      baseUnit: 'kilogram',
      units: [
        { name: 'Gram', symbol: 'g', toBase: 0.001, fromBase: 1000 },
        { name: 'Kilogram', symbol: 'kg', toBase: 1, fromBase: 1 },
        { name: 'Pound', symbol: 'lb', toBase: 0.453592, fromBase: 2.20462 },
        { name: 'Ounce', symbol: 'oz', toBase: 0.0283495, fromBase: 35.274 },
        { name: 'Ton', symbol: 't', toBase: 1000, fromBase: 0.001 },
      ],
    },
    {
      name: 'Temperature',
      baseUnit: 'celsius',
      units: [
        { name: 'Celsius', symbol: '°C', toBase: 1, fromBase: 1 },
        { name: 'Fahrenheit', symbol: '°F', toBase: 1, fromBase: 1 },
        { name: 'Kelvin', symbol: 'K', toBase: 1, fromBase: 1 },
      ],
    },
  ];

  const getCurrentCategory = () => {
    return (
      unitCategories.find(cat => cat.name === selectedCategory) ||
      unitCategories[0]
    );
  };

  const convertUnits = useCallback(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('Invalid input');
      return;
    }

    const category = getCurrentCategory();
    const fromUnitData = category.units.find(u => u.symbol === fromUnit);
    const toUnitData = category.units.find(u => u.symbol === toUnit);

    if (!fromUnitData || !toUnitData) {
      setResult('Unit not found');
      return;
    }

    let convertedValue: number;

    // Special handling for temperature
    if (selectedCategory === 'Temperature') {
      convertedValue = convertTemperature(value, fromUnit, toUnit);
    } else {
      // Convert to base unit, then to target unit
      const baseValue = value * fromUnitData.toBase;
      convertedValue = baseValue * toUnitData.fromBase;
    }

    setResult(convertedValue.toFixed(6).replace(/\.?0+$/, ''));
  }, [inputValue, fromUnit, toUnit, selectedCategory]);

  const convertTemperature = (
    value: number,
    from: string,
    to: string
  ): number => {
    // Convert to Celsius first
    let celsius: number;
    switch (from) {
      case '°C':
        celsius = value;
        break;
      case '°F':
        celsius = ((value - 32) * 5) / 9;
        break;
      case 'K':
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    // Convert from Celsius to target
    switch (to) {
      case '°C':
        return celsius;
      case '°F':
        return (celsius * 9) / 5 + 32;
      case 'K':
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  // Auto-convert when inputs change
  React.useEffect(() => {
    if (inputValue && fromUnit && toUnit) {
      convertUnits();
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory, convertUnits]);

  // Update units when category changes
  React.useEffect(() => {
    const category = getCurrentCategory();
    if (category.units.length >= 2) {
      setFromUnit(category.units[0].symbol);
      setToUnit(category.units[1].symbol);
    }
  }, [selectedCategory]);

  const currentCategory = getCurrentCategory();

  return (
    <ToolDemo
      title='Unit Converter'
      description='Convert between different units of measurement including length, weight, temperature, and more.'
      demoType='solver'
      interactive={true}
      className={className}
    >
      <div className='space-y-6'>
        {/* Category Selection */}
        <div className='space-y-3'>
          <Label className='text-base font-semibold'>Unit Category</Label>
          <div className='flex flex-wrap gap-2'>
            {unitCategories.map(category => (
              <Button
                key={category.name}
                variant={
                  selectedCategory === category.name ? 'default' : 'outline'
                }
                size='sm'
                onClick={() => setSelectedCategory(category.name)}
                className='font-medium'
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Conversion Interface */}
        <div className='bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border shadow-inner'>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4 items-end'>
            {/* Input Value */}
            <div className='md:col-span-2'>
              <Label htmlFor='input-value'>Value</Label>
              <Input
                id='input-value'
                type='number'
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder='Enter value'
                className='text-lg font-mono'
              />
            </div>

            {/* From Unit */}
            <div>
              <Label htmlFor='from-unit'>From</Label>
              <select
                id='from-unit'
                value={fromUnit}
                onChange={e => setFromUnit(e.target.value)}
                className='w-full p-2 border border-input bg-background rounded-md text-sm'
              >
                {currentCategory.units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Conversion Arrow */}
            <div className='flex justify-center'>
              <ArrowLeftRight className='h-6 w-6 text-muted-foreground' />
            </div>

            {/* To Unit */}
            <div>
              <Label htmlFor='to-unit'>To</Label>
              <select
                id='to-unit'
                value={toUnit}
                onChange={e => setToUnit(e.target.value)}
                className='w-full p-2 border border-input bg-background rounded-md text-sm'
              >
                {currentCategory.units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className='mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg'>
              <div className='text-center'>
                <div className='text-sm text-muted-foreground mb-1'>Result</div>
                <div className='text-2xl font-bold font-mono text-primary'>
                  {inputValue} {fromUnit} = {result} {toUnit}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Examples */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Calculator className='h-4 w-4 text-primary' />
            <span className='text-sm font-semibold text-primary'>
              Try these examples:
            </span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {[
              { value: '100', from: 'cm', to: 'in', category: 'Length' },
              { value: '5', from: 'kg', to: 'lb', category: 'Weight' },
              { value: '32', from: '°F', to: '°C', category: 'Temperature' },
              { value: '1', from: 'mi', to: 'km', category: 'Length' },
            ].map((example, index) => (
              <Button
                key={index}
                variant='outline'
                size='sm'
                onClick={() => {
                  setSelectedCategory(example.category);
                  setInputValue(example.value);
                  setFromUnit(example.from);
                  setToUnit(example.to);
                }}
                className='text-xs font-mono'
              >
                {example.value} {example.from} → {example.to}
              </Button>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className='p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg border border-slate-200 dark:border-slate-700'>
          <h4 className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
            Supported Categories
          </h4>
          <div className='text-xs text-slate-600 dark:text-slate-400 space-y-1'>
            <p>
              • <strong>Length:</strong> mm, cm, m, km, in, ft, yd, mi
            </p>
            <p>
              • <strong>Weight:</strong> g, kg, lb, oz, t
            </p>
            <p>
              • <strong>Temperature:</strong> °C, °F, K
            </p>
          </div>
        </div>
      </div>
    </ToolDemo>
  );
};

export default UnitConverterDemo;
