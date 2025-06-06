// src/app/color-converter/page.tsx
'use client';

import React, { useState, useMemo, ChangeEvent } from 'react';
import Link from 'next/link';
import tinycolor from 'tinycolor2';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

// A reusable input component for our color values
interface ColorInputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
  isValid: boolean;
}

const ColorInput = ({ label, value, onChange, prefix, isValid }: ColorInputProps) => (
  <div>
    <label className='block text-sm font-medium text-slate-600'>{label}</label>
    <div className='mt-1 flex rounded-md shadow-sm'>
      {prefix && (
        <span className='inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm'>
          {prefix}
        </span>
      )}
      <input
        type='text'
        value={value}
        onChange={onChange}
        className={`block w-full flex-1 rounded-none p-2 font-mono text-slate-900 border ${
          isValid ? 'border-slate-300' : 'border-red-500'
        } focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out ${
          prefix ? 'rounded-r-md' : 'rounded-md'
        }`}
      />
    </div>
  </div>
);

export default function ColorConverterPage() {
  const [color, setColor] = useState(tinycolor('#3b82f6')); // A nice blue to start

  const [hexValue, setHexValue] = useState(color.toHexString());
  const [rgbValue, setRgbValue] = useState(color.toRgbString());
  const [hslValue, setHslValue] = useState(color.toHslString());

  useMemo(() => {
    setHexValue(color.toHexString());
    setRgbValue(color.toRgbString());
    setHslValue(color.toHslString());
  }, [color]);

  const onHexChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexValue(value);
    const newColor = tinycolor(value);
    if (newColor.isValid()) {
      setColor(newColor);
    }
  };

  const onRgbChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRgbValue(value);
    const newColor = tinycolor(value);
    if (newColor.isValid()) {
      setColor(newColor);
    }
  };

  const onHslChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHslValue(value);
    const newColor = tinycolor(value);
    if (newColor.isValid()) {
      setColor(newColor);
    }
  };

  const handlePickerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newColor = tinycolor(e.target.value);
    if (newColor.isValid()) {
      setColor(newColor);
    }
  };

  const colorIsLight = color.isLight();

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <Breadcrumbs />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Instant Color Converter</h1>
          <p className='text-lg text-slate-600 mt-1'>Convert between HEX, RGB, and HSL color formats.</p>
        </header>

        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-lg mx-auto'>
          {/* Color Preview */}
          <div
            className='relative w-full h-48 rounded-lg mb-6 flex items-center justify-center transition-colors duration-200 ease-in-out border'
            style={{ backgroundColor: color.toRgbString(), borderColor: color.clone().darken(10).toRgbString() }}>
            <div
              className={`text-center p-4 rounded-md ${
                colorIsLight ? 'text-black bg-white/50' : 'text-white bg-black/50'
              }`}>
              <p className='font-bold text-lg'>{color.toHexString().toUpperCase()}</p>
              <p className='text-sm'>{color.toRgbString()}</p>
            </div>
            {/* START: Added Color Picker */}
            <input
              type='color'
              value={color.toHexString()}
              onChange={handlePickerChange}
              className='absolute top-2 right-2 w-10 h-10 p-1 border border-slate-300 rounded-md cursor-pointer bg-white'
              title='Select a color'
            />
            {/* END: Added Color Picker */}
          </div>

          {/* Input fields */}
          <div className='space-y-4'>
            <ColorInput
              label='HEX'
              value={hexValue}
              onChange={onHexChange}
              prefix='#'
              isValid={tinycolor(hexValue).isValid()}
            />
            <ColorInput label='RGB' value={rgbValue} onChange={onRgbChange} isValid={tinycolor(rgbValue).isValid()} />
            <ColorInput label='HSL' value={hslValue} onChange={onHslChange} isValid={tinycolor(hslValue).isValid()} />
          </div>

          {/* Explainer Section */}
          <div className='mt-8 pt-4 border-t'>
            <h3 className='text-lg font-semibold text-slate-700'>Color Model Explanations</h3>
            <div className='mt-2 text-sm text-slate-600 space-y-2'>
              <p>
                <strong>HEX (Hexadecimal):</strong> A 6-digit code representing Red, Green, and Blue values. It's
                compact and widely used in web design.
              </p>
              <p>
                <strong>RGB (Red, Green, Blue):</strong> Defines a color by the intensity of Red, Green, and Blue, each
                from 0 to 255. It's the standard for digital displays.
              </p>
              <p>
                <strong>HSL (Hue, Saturation, Lightness):</strong> An intuitive model where Hue is the color type (e.g.,
                red, green), Saturation is the vibrancy, and Lightness is the brightness.
              </p>
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
