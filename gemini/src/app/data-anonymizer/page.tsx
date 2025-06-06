// src/app/data-anonymizer/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SAMPLE_TEXT = `From: user@example.com
To: another.user@gmail.com
Date: 2025-06-07
Log Entry:
User with IP 192.168.1.1 accessed the server.
Later, 10.0.0.2 made a request.
For support, call +1 (555) 123-4567.
My card number is 4444-5555-6666-7777.
Project ID: PROJ-12345`;

// Define the types of data we can scrub
const SCRUBBER_RULES = {
  email: {
    label: 'Email Addresses',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: '[REDACTED_EMAIL]',
  },
  phone: {
    label: 'Phone Numbers',
    regex: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    replacement: '[REDACTED_PHONE]',
  },
  ipv4: {
    label: 'IPv4 Addresses',
    regex: /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g,
    replacement: '[REDACTED_IP]',
  },
  creditCard: {
    label: 'Credit Card Numbers',
    regex: /\b(?:\d[ -]*?){13,16}\b/g,
    replacement: '[REDACTED_CREDIT_CARD]',
  },
};

type ScrubRuleKey = keyof typeof SCRUBBER_RULES;

export default function DataAnonymizerPage() {
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [copySuccess, setCopySuccess] = useState('');
  const [activeRules, setActiveRules] = useState<Record<ScrubRuleKey, boolean>>({
    email: true,
    phone: true,
    ipv4: true,
    creditCard: true,
  });

  const [useCustomRule, setUseCustomRule] = useState(true);
  const [customFindText, setCustomFindText] = useState('PROJ-\\d+');
  const [customReplaceText, setCustomReplaceText] = useState('[PROJECT_ID]');

  const outputText = useMemo(() => {
    let textToScrub = inputText;

    // 1. Apply standard rules first
    (Object.keys(SCRUBBER_RULES) as ScrubRuleKey[]).forEach((key) => {
      if (activeRules[key]) {
        const rule = SCRUBBER_RULES[key];
        textToScrub = textToScrub.replace(rule.regex, rule.replacement);
      }
    });

    // 2. Apply custom rule if enabled
    if (useCustomRule && customFindText) {
      try {
        let pattern = customFindText;
        let flags = 'g'; // Default to global replace

        if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
          const lastSlash = pattern.lastIndexOf('/');
          const providedFlags = pattern.substring(lastSlash + 1);
          pattern = pattern.substring(1, lastSlash);
          flags = 'g' + providedFlags.replace('g', '');
        }

        // --- START: FIX FOR CUSTOM RULE ---
        // Strip start/end anchors to allow validation patterns to be used for finding.
        if (flags.includes('g')) {
          if (pattern.startsWith('^')) {
            pattern = pattern.substring(1);
          }
          if (pattern.endsWith('$') && !pattern.endsWith('\\$')) {
            pattern = pattern.slice(0, -1);
          }
        }
        // --- END: FIX FOR CUSTOM RULE ---

        const customRegex = new RegExp(pattern, flags);
        textToScrub = textToScrub.replace(customRegex, customReplaceText);
      } catch (e) {
        // Ignore invalid regex in custom rule, or show an error
        console.error('Invalid custom regex:', e);
      }
    }

    return textToScrub;
  }, [inputText, activeRules, useCustomRule, customFindText, customReplaceText]);

  const handleRuleChange = (key: ScrubRuleKey) => {
    setActiveRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopySuccess('Output copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Data Anonymizer</h1>
          <p className='text-lg text-slate-600 mt-1'>
            Find and scrub sensitive information from your text before sharing.
          </p>
        </header>

        <section className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto'>
          {/* Input Area */}
          <div className='flex flex-col'>
            <h2 className='font-semibold text-slate-700 bg-slate-100 p-2 border border-b-0 rounded-t-lg'>
              Original Text
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className='w-full h-80 p-4 border border-slate-300 rounded-b-lg font-mono focus:ring-2 focus:ring-sky-500 resize-none'
              placeholder='Paste your text with sensitive data here...'
            />
          </div>
          {/* Output Area */}
          <div className='flex flex-col'>
            <div className='flex-shrink-0 flex justify-between items-center bg-slate-100 p-2 border border-b-0 rounded-t-lg'>
              <h2 className='font-semibold text-slate-700'>Scrubbed Text</h2>
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className='px-3 py-1 text-xs font-medium text-slate-600 bg-white rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-50'>
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={outputText}
              className='w-full h-80 p-4 border border-slate-300 rounded-b-lg font-mono bg-slate-50 resize-none'
            />
            {copySuccess && <p className='text-right text-xs text-green-600 mt-1'>{copySuccess}</p>}
          </div>
        </section>

        {/* Controls */}
        <section className='bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto mt-6'>
          <h3 className='text-lg font-semibold text-slate-800 mb-3'>Scrubbing Rules</h3>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            {(Object.keys(SCRUBBER_RULES) as ScrubRuleKey[]).map((key) => {
              const rule = SCRUBBER_RULES[key];
              return (
                <div key={key} className='relative flex items-start'>
                  <div className='flex h-6 items-center'>
                    <input
                      id={key}
                      checked={activeRules[key]}
                      onChange={() => handleRuleChange(key)}
                      type='checkbox'
                      className='h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500'
                    />
                  </div>
                  <div className='ml-3 text-sm leading-6'>
                    <label htmlFor={key} className='font-medium text-gray-900'>
                      {rule.label}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- START: Custom Rule Section --- */}
          <div className='mt-6 pt-4 border-t'>
            <div className='relative flex items-start mb-4'>
              <div className='flex h-6 items-center'>
                <input
                  id='custom-rule-checkbox'
                  checked={useCustomRule}
                  onChange={(e) => setUseCustomRule(e.target.checked)}
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500'
                />
              </div>
              <div className='ml-3 text-sm leading-6'>
                <label htmlFor='custom-rule-checkbox' className='font-medium text-gray-900'>
                  Custom Rule
                </label>
              </div>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${!useCustomRule ? 'opacity-50' : ''}`}>
              <div>
                <label htmlFor='custom-find' className='block text-sm font-medium text-slate-700'>
                  Find (Text or /Regex/)
                </label>
                <input
                  type='text'
                  id='custom-find'
                  value={customFindText}
                  onChange={(e) => setCustomFindText(e.target.value)}
                  disabled={!useCustomRule}
                  className='mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 disabled:cursor-not-allowed'
                />
              </div>
              <div>
                <label htmlFor='custom-replace' className='block text-sm font-medium text-slate-700'>
                  Replace with
                </label>
                <input
                  type='text'
                  id='custom-replace'
                  value={customReplaceText}
                  onChange={(e) => setCustomReplaceText(e.target.value)}
                  disabled={!useCustomRule}
                  className='mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 disabled:cursor-not-allowed'
                />
              </div>
            </div>
          </div>
          {/* --- END: Custom Rule Section --- */}
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
