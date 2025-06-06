// src/app/text-diff/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import * as Diff from 'diff';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define some sample text to start with
const SAMPLE_TEXT_A = `The quick brown fox jumps over the lazy dog.
It was the best of times, it was the worst of times.
A stitch in time saves nine.`;

const SAMPLE_TEXT_B = `The quick brown cat jumps over the lazy dog.
It was the best of times, it was the blurst of times.
A stitch in time saves nine.
This is a new line.`;

export default function TextDiffPage() {
  const [textA, setTextA] = useState(SAMPLE_TEXT_A);
  const [textB, setTextB] = useState(SAMPLE_TEXT_B);

  const diffResult = useMemo(() => {
    // Using diffLines for better performance with multi-line text
    return Diff.diffLines(textA, textB);
  }, [textA, textB]);

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Text Difference Checker</h1>
          <p className='text-lg text-slate-600 mt-1'>Compare two blocks of text and highlight the differences.</p>
        </header>

        {/* Input Text Areas */}
        <section className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto'>
          <div>
            <label htmlFor='text-a' className='block text-sm font-semibold text-slate-700 mb-1'>
              Original Text
            </label>
            <textarea
              id='text-a'
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className='w-full p-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out shadow-sm'
              rows={12}
              placeholder='Paste the first version of your text here...'
            />
          </div>
          <div>
            <label htmlFor='text-b' className='block text-sm font-semibold text-slate-700 mb-1'>
              Changed Text
            </label>
            <textarea
              id='text-b'
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className='w-full p-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out shadow-sm'
              rows={12}
              placeholder='Paste the second version of your text here...'
            />
          </div>
        </section>

        {/* Diff Results */}
        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-6xl mx-auto mt-8'>
          <h2 className='text-xl font-semibold text-slate-700 border-b pb-2 mb-4'>Differences</h2>
          <pre className='text-sm whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded-md overflow-x-auto'>
            {diffResult.map((part, index) => {
              const color = part.added
                ? 'bg-green-100 text-green-800'
                : part.removed
                ? 'bg-red-100 text-red-800'
                : 'text-slate-500';

              const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';

              return (
                <span key={index} className={`${color} block`}>
                  {/* We split by newline to add the prefix to each line */}
                  {part.value.split('\n').map((line, i, arr) => {
                    // Don't render the final empty line from a split
                    if (i === arr.length - 1 && line === '') return null;
                    return (
                      <span key={i} className='block'>
                        {prefix}
                        {line}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </pre>
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
