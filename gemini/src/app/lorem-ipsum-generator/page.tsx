// src/app/lorem-ipsum-generator/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// The dictionary of Lorem Ipsum words
const LOREM_IPSUM_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'curabitur',
  'vel',
  'hendrerit',
  'libero',
  'eleifend',
  'blandit',
  'nunc',
  'ornare',
  'odio',
  'ut',
  'orci',
  'gravida',
  'imperdiet',
  'nullam',
  'purus',
  'lacinia',
  'a',
  'pretium',
  'quis',
  'congue',
  'praesent',
  'sagittis',
  'laoreet',
  'auctor',
  'mauris',
  'non',
  'velit',
  'eros',
  'dictum',
  'proin',
  'accumsan',
  'sapien',
  'nec',
  'massa',
  'volutpat',
  'venenatis',
  'sed',
  'eu',
  'molestie',
  'lacus',
  'quisque',
  'porttitor',
  'ligula',
  'dui',
  'mollis',
  'tempus',
  'at',
  'magna',
  'vestibulum',
  'turpis',
  'ac',
  'diam',
  'tincidunt',
  'id',
  'condimentum',
  'enim',
  'sodales',
  'in',
  'hac',
  'habitasse',
  'platea',
  'dictumst',
  'aenean',
  'neque',
  'fusce',
  'augue',
  'leo',
  'eget',
  'semper',
  'mattis',
  'tortor',
  'scelerisque',
  'nulla',
  'interdum',
  'tellus',
  'malesuada',
  'rhoncus',
  'porta',
  'sem',
  'aliquet',
  'et',
  'nam',
  'suspendisse',
  'potenti',
  'vivamus',
  'luctus',
  'fringilla',
  'erat',
  'donec',
  'justo',
  'vehicula',
  'ultricies',
  'varius',
  'ante',
  'primis',
  'in',
  'faucibus',
  'orci',
  'luctus',
  'et',
  'ultrices',
  'posuere',
  'cubilia',
  'curae',
  'etiam',
  'cursus',
  'aliquam',
  'quam',
  'dapibus',
  'nisl',
  'feugiat',
  'egestas',
  'class',
  'aptent',
  'taciti',
  'sociosqu',
  'ad',
  'litora',
  'torquent',
  'per',
  'conubia',
  'nostra',
  'inceptos',
  'himenaeos',
  'phasellus',
  'nibh',
  'pulvinar',
  'vitae',
  'urna',
  'iaculis',
  'lobortis',
  'nisi',
  'viverra',
  'arcu',
  'morbi',
  'pellentesque',
  'metus',
  'commodo',
  'ut',
  'facilisis',
  'felis',
  'tristique',
  'ullamcorper',
  'placerat',
  'aenean',
  'convallis',
  'sollicitudin',
  'integer',
  'rutrum',
  'duis',
  'est',
  'etiam',
  'bibendum',
  'donec',
  'pharetra',
  'vulputate',
  'maecenas',
  'mi',
  'fermentum',
  'consequat',
  'suscipit',
  'aliquam',
  'habitant',
  'senectus',
  'netus',
  'fames',
  'quisque',
  'euismod',
  'curabitur',
  'lectus',
  'elementum',
  'tempor',
  'risus',
  'cras',
];

type GenerationType = 'words' | 'sentences' | 'paragraphs';

export default function LoremIpsumGeneratorPage() {
  const [genType, setGenType] = useState<GenerationType>('paragraphs');
  const [amount, setAmount] = useState(5);
  const [outputText, setOutputText] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const generateSentence = useCallback(() => {
    const sentenceLength = Math.floor(Math.random() * 10) + 5; // 5-14 words
    let sentence = '';
    for (let i = 0; i < sentenceLength; i++) {
      sentence += LOREM_IPSUM_WORDS[Math.floor(Math.random() * LOREM_IPSUM_WORDS.length)] + ' ';
    }
    return sentence.trim().charAt(0).toUpperCase() + sentence.trim().slice(1) + '.';
  }, []);

  const generateParagraph = useCallback(() => {
    const paragraphLength = Math.floor(Math.random() * 4) + 3; // 3-6 sentences
    let paragraph = '';
    for (let i = 0; i < paragraphLength; i++) {
      paragraph += generateSentence() + ' ';
    }
    return paragraph.trim();
  }, [generateSentence]);

  const handleGenerate = () => {
    let result = '';
    if (amount <= 0) {
      setOutputText('');
      return;
    }

    switch (genType) {
      case 'words':
        for (let i = 0; i < amount; i++) {
          result += LOREM_IPSUM_WORDS[Math.floor(Math.random() * LOREM_IPSUM_WORDS.length)] + ' ';
        }
        result = result.trim();
        break;
      case 'sentences':
        for (let i = 0; i < amount; i++) {
          result += generateSentence() + ' ';
        }
        result = result.trim();
        break;
      case 'paragraphs':
        for (let i = 0; i < amount; i++) {
          result += generateParagraph() + '\n\n';
        }
        result = result.trim();
        break;
    }
    setOutputText(result);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopySuccess('Text copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  // Generate initial text on first load
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to get the dynamic label for the amount input
  const getAmountLabel = () => {
    switch (genType) {
      case 'paragraphs':
        return 'Number of Paragraphs:';
      case 'sentences':
        return 'Number of Sentences:';
      case 'words':
        return 'Number of Words:';
      default:
        return 'Amount:';
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Lorem Ipsum Generator</h1>
          <p className='text-lg text-slate-600 mt-1'>Create placeholder text for your designs and mockups.</p>
        </header>

        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto'>
          {/* Controls */}
          <div className='flex flex-wrap items-center justify-center gap-4 sm:gap-6 p-4 bg-slate-50 rounded-lg border mb-6'>
            <div className='flex items-center gap-2'>
              {/* START: Using dynamic label */}
              <label htmlFor='amount' className='font-medium text-slate-700 whitespace-nowrap'>
                {getAmountLabel()}
              </label>
              {/* END: Using dynamic label */}
              <input
                type='number'
                id='amount'
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className='w-20 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500'
              />
            </div>

            <div className='flex items-center gap-x-4'>
              <label className='font-medium text-slate-700'>Type:</label>
              <div className='flex items-center gap-x-3'>
                <div className='flex items-center'>
                  <input
                    id='paragraphs'
                    name='gen-type'
                    type='radio'
                    checked={genType === 'paragraphs'}
                    onChange={() => setGenType('paragraphs')}
                    className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                  />
                  <label htmlFor='paragraphs' className='ml-2 block text-sm text-gray-900'>
                    Paragraphs
                  </label>
                </div>
                <div className='flex items-center'>
                  <input
                    id='sentences'
                    name='gen-type'
                    type='radio'
                    checked={genType === 'sentences'}
                    onChange={() => setGenType('sentences')}
                    className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                  />
                  <label htmlFor='sentences' className='ml-2 block text-sm text-gray-900'>
                    Sentences
                  </label>
                </div>
                <div className='flex items-center'>
                  <input
                    id='words'
                    name='gen-type'
                    type='radio'
                    checked={genType === 'words'}
                    onChange={() => setGenType('words')}
                    className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                  />
                  <label htmlFor='words' className='ml-2 block text-sm text-gray-900'>
                    Words
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className='px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700'>
              Generate
            </button>
          </div>

          {/* Output */}
          <div className='relative'>
            <textarea
              readOnly
              value={outputText}
              className='w-full p-4 border border-slate-200 rounded-lg bg-slate-50 h-80 resize-none'
              placeholder='Generated text will appear here...'
            />
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className='absolute top-3 right-3 px-3 py-1 text-xs font-medium text-slate-600 bg-white rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50'>
              Copy
            </button>
            {copySuccess && (
              <p className='absolute bottom-3 right-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md shadow-lg'>
                {copySuccess}
              </p>
            )}
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
