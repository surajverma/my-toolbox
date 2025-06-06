// src/app/unit-converter/page.tsx
'use client';

import React, { useState, useMemo, ChangeEvent, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

// Define the structure for our conversion data
interface UnitData {
  [unit: string]: number;
}

interface ConversionCategory {
  label: string;
  baseUnit: string;
  units: UnitData;
}

const CONVERSION_FACTORS: Record<string, ConversionCategory> = {
  length: {
    label: 'Length',
    baseUnit: 'meter',
    units: {
      meter: 1,
      kilometer: 1000,
      centimeter: 0.01,
      millimeter: 0.001,
      mile: 1609.34,
      yard: 0.9144,
      foot: 0.3048,
      inch: 0.0254,
    },
  },
  weight: {
    label: 'Weight',
    baseUnit: 'kilogram',
    units: {
      kilogram: 1,
      gram: 0.001,
      milligram: 0.000001,
      tonne: 1000,
      pound: 0.453592,
      ounce: 0.0283495,
    },
  },
  temperature: {
    label: 'Temperature',
    baseUnit: 'celsius',
    units: {
      celsius: 1,
      fahrenheit: 1,
      kelvin: 1,
    },
  },
  data: {
    label: 'Data Storage',
    baseUnit: 'byte',
    units: {
      byte: 1,
      kilobyte: 1024,
      megabyte: 1024 ** 2,
      gigabyte: 1024 ** 3,
      terabyte: 1024 ** 4,
    },
  },
  speed: {
    label: 'Speed',
    baseUnit: 'm/s',
    units: {
      'm/s': 1,
      'km/h': 0.277778,
      mph: 0.44704,
      knot: 0.514444,
    },
  },
};

const formatNumber = (num: number) => {
  if (Math.abs(num) < 1e-6 && num !== 0) {
    return num.toExponential(4);
  }
  return parseFloat(num.toFixed(4)).toString();
};

export default function UnitConverterPage() {
  const [category, setCategory] = useState<string>('length');
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('foot');
  const [inputValue, setInputValue] = useState<string>('1');

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    const units = Object.keys(CONVERSION_FACTORS[newCategory].units);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setInputValue('1');
  };

  const convert = useCallback((value: number, from: string, to: string, cat: string) => {
    const categoryData = CONVERSION_FACTORS[cat];
    if (!categoryData) return 0;

    // Handle temperature separately due to its non-linear conversion
    if (cat === 'temperature') {
      let celsiusValue: number;
      if (from === 'fahrenheit') celsiusValue = ((value - 32) * 5) / 9;
      else if (from === 'kelvin') celsiusValue = value - 273.15;
      else celsiusValue = value;

      if (to === 'fahrenheit') return (celsiusValue * 9) / 5 + 32;
      if (to === 'kelvin') return celsiusValue + 273.15;
      return celsiusValue; // to celsius
    }

    const fromFactor = categoryData.units[from];
    const toFactor = categoryData.units[to];
    const baseValue = value * fromFactor;
    return baseValue / toFactor;
  }, []);

  const outputValue = useMemo(() => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return '';
    const result = convert(numValue, fromUnit, toUnit, category);
    return formatNumber(result);
  }, [inputValue, fromUnit, toUnit, category, convert]);

  const handleSwap = () => {
    const currentInput = inputValue;
    const currentOutput = outputValue;
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(currentOutput);
  };

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <Breadcrumbs />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Unit Converter</h1>
          <p className='text-lg text-slate-600 mt-1'>A comprehensive tool to convert between various units.</p>
        </header>

        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-xl mx-auto'>
          <div className='mb-4'>
            <label htmlFor='category' className='block text-sm font-medium text-slate-700'>
              Category
            </label>
            <select
              id='category'
              value={category}
              onChange={handleCategoryChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500'>
              {Object.entries(CONVERSION_FACTORS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-5 gap-2 items-end'>
            <div className='col-span-2'>
              <label htmlFor='from-unit' className='block text-sm font-medium text-slate-700'>
                From
              </label>
              <select
                id='from-unit'
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className='mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500'>
                {Object.keys(CONVERSION_FACTORS[category].units).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div className='text-center'>
              <button
                onClick={handleSwap}
                className='p-2 bg-slate-100 rounded-full hover:bg-slate-200'
                title='Swap units'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-slate-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
                  />
                </svg>
              </button>
            </div>
            <div className='col-span-2'>
              <label htmlFor='to-unit' className='block text-sm font-medium text-slate-700'>
                To
              </label>
              <select
                id='to-unit'
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className='mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500'>
                {Object.keys(CONVERSION_FACTORS[category].units).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='mt-4 grid grid-cols-5 gap-2 items-center'>
            <div className='col-span-2'>
              <input
                type='number'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className='w-full text-lg p-2 border border-slate-300 rounded-md'
              />
            </div>
            <div className='text-center font-bold text-slate-500'>=</div>
            <div className='col-span-2'>
              <input
                type='text'
                readOnly
                value={outputValue}
                className='w-full text-lg p-2 border border-slate-300 rounded-md bg-slate-50'
              />
            </div>
          </div>
        </section>

        <div className='mt-12 text-center'>
          <Link href='/' className='text-sky-600 hover:text-sky-800 hover:underline'>
            &larr; Back to All Tools
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
