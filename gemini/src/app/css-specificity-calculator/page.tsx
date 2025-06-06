// src/app/css-specificity-calculator/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define the structure for the specificity breakdown
interface SpecificityBreakdown {
  ids: string[];
  classes: string[];
  attributes: string[];
  pseudoClasses: string[];
  elements: string[];
  pseudoElements: string[];
}

// The main calculation logic
const calculateSpecificity = (selector: string): SpecificityBreakdown => {
  if (!selector) {
    return { ids: [], classes: [], attributes: [], pseudoClasses: [], elements: [], pseudoElements: [] };
  }

  let tempSelector = selector;

  // Order of extraction matters to avoid double counting (e.g., pseudo-elements vs pseudo-classes)
  const pseudoElements = tempSelector.match(/::[\w-]+/g) || [];
  tempSelector = tempSelector.replace(/::[\w-]+/g, '');

  const pseudoClasses = tempSelector.match(/:[\w-]+\(.*\)|:[\w-]+/g) || [];
  tempSelector = tempSelector.replace(/:[\w-]+\(.*\)|:[\w-]+/g, '');

  const ids = tempSelector.match(/#[\w-]+/g) || [];
  tempSelector = tempSelector.replace(/#[\w-]+/g, '');

  const classes = tempSelector.match(/\.[\w-]+/g) || [];
  tempSelector = tempSelector.replace(/\.[\w-]+/g, '');

  const attributes = tempSelector.match(/\[.*?\]/g) || [];
  tempSelector = tempSelector.replace(/\[.*?\]/g, '');

  // Clean up remaining characters to find element tags
  tempSelector = tempSelector
    .replace(/[\s+>~*]+/g, ' ')
    .replace(/,/g, ' ')
    .trim();
  const elements = tempSelector.split(' ').filter((el) => el && el !== '*');

  return { ids, classes, attributes, pseudoClasses, elements, pseudoElements };
};

// =================================================================
// START: NEW Explanation Generator Logic
// =================================================================
const generateExplanation = (selector: string): string => {
  if (!selector.trim()) {
    return 'No selector provided.';
  }

  // Split selector by commas for grouped selectors
  const selectors = selector.split(',').map((s) => s.trim());

  const explanations = selectors.map((s) => {
    // This regex splits the selector by combinators, keeping the combinators
    const parts = s.split(/(\s*[>+~]\s*|\s+)/).filter((p) => p.trim());

    if (parts.length === 0) return '';

    let sentence = 'Selects ';

    const describePart = (part: string) => {
      let description = '';
      const elementMatch = part.match(/^[\w-]+/);
      const idMatch = part.match(/#([\w-]+)/);
      const classMatch = part.match(/\.[\w-]+/g);
      const attrMatch = part.match(/\[.*?\]/g);
      const pseudoClassMatch = part.match(/:[\w-]+\(.*\)|:[\w-]+/g);
      const pseudoElementMatch = part.match(/::[\w-]+/g);

      description += elementMatch ? `any <${elementMatch[0]}> element` : 'any element';
      if (idMatch) description += ` with the ID "${idMatch[0]}"`;
      if (classMatch) description += ` with the class(es) ${classMatch.join(', ')}`;
      if (attrMatch) description += ` with the attribute(s) ${attrMatch.join(', ')}`;
      if (pseudoClassMatch) description += ` that is ${pseudoClassMatch.join(' and ')}`;
      if (pseudoElementMatch) sentence += ` and targets its ${pseudoElementMatch.join(', ')} pseudo-element`;

      return description;
    };

    sentence += describePart(parts[0]);

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      if (['>', '+', '~'].includes(part) || part === '') {
        switch (part) {
          case '>':
            sentence += ', that is a direct child of';
            break;
          case '+':
            sentence += ', that is the next sibling of';
            break;
          case '~':
            sentence += ', that is a sibling of';
            break;
          default:
            sentence += ', within';
            break; // Space combinator
        }
        // The next part is the parent/sibling element
        if (parts[i + 1]) {
          sentence += ` ${describePart(parts[i + 1])}`;
          i++; // Skip the next part as it's been described
        }
      }
    }

    return sentence.trim() + '.';
  });

  return explanations.join('\n');
};
// =================================================================
// END: NEW Explanation Generator Logic
// =================================================================

const BreakdownCategory = ({ title, items }: { title: string; items: string[] }) => {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className='font-semibold text-slate-700'>
        {title} ({items.length})
      </h4>
      <div className='flex flex-wrap gap-1 mt-1'>
        {items.map((item, index) => (
          <code key={index} className='px-2 py-1 text-xs bg-slate-200 text-slate-800 rounded'>
            {item}
          </code>
        ))}
      </div>
    </div>
  );
};

export default function CssSpecificityCalculatorPage() {
  const [selector, setSelector] = useState('nav#main-nav > ul.menu > li.menu-item a:hover::before');

  const breakdown = useMemo(() => calculateSpecificity(selector), [selector]);
  const explanation = useMemo(() => generateExplanation(selector), [selector]);

  const idScore = breakdown.ids.length;
  const classScore = breakdown.classes.length + breakdown.attributes.length + breakdown.pseudoClasses.length;
  const elementScore = breakdown.elements.length + breakdown.pseudoElements.length;

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>CSS Specificity Calculator</h1>
          <p className='text-lg text-slate-600 mt-1'>
            Enter a CSS selector to calculate and understand its specificity.
          </p>
        </header>

        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto'>
          {/* Input */}
          <div>
            <label htmlFor='selector-input' className='block text-sm font-medium text-slate-700'>
              CSS Selector
            </label>
            <input
              id='selector-input'
              type='text'
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className='mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm font-mono text-lg focus:ring-2 focus:ring-sky-500'
              placeholder='e.g., #id .class[attr]:hover'
            />
          </div>

          {/* Score Display */}
          <div className='mt-6 grid grid-cols-3 gap-4 text-center'>
            <div className='bg-red-50 p-4 rounded-lg'>
              <p className='text-sm font-bold text-red-700'>IDs</p>
              <p className='text-4xl font-mono font-bold text-red-600'>{idScore}</p>
            </div>
            <div className='bg-blue-50 p-4 rounded-lg'>
              <p className='text-sm font-bold text-blue-700'>Classes, Attributes, Pseudo-classes</p>
              <p className='text-4xl font-mono font-bold text-blue-600'>{classScore}</p>
            </div>
            <div className='bg-green-50 p-4 rounded-lg'>
              <p className='text-sm font-bold text-green-700'>Elements, Pseudo-elements</p>
              <p className='text-4xl font-mono font-bold text-green-600'>{elementScore}</p>
            </div>
          </div>

          {/* START: New Explanation Display */}
          <div className='mt-6 pt-6 border-t'>
            <h3 className='text-xl font-semibold text-slate-800 mb-2'>Explanation</h3>
            <p className='p-4 bg-slate-50 text-slate-800 rounded-lg italic whitespace-pre-wrap'>{explanation}</p>
          </div>
          {/* END: New Explanation Display */}

          {/* Breakdown Display */}
          <div className='mt-6 pt-6 border-t'>
            <h3 className='text-xl font-semibold text-slate-800 mb-4'>Breakdown</h3>
            <div className='space-y-4'>
              <BreakdownCategory title='IDs' items={breakdown.ids} />
              <BreakdownCategory title='Classes' items={breakdown.classes} />
              <BreakdownCategory title='Attributes' items={breakdown.attributes} />
              <BreakdownCategory title='Pseudo-classes' items={breakdown.pseudoClasses} />
              <BreakdownCategory title='Elements' items={breakdown.elements} />
              <BreakdownCategory title='Pseudo-elements' items={breakdown.pseudoElements} />
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
