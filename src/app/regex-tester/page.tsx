// src/app/regex-tester/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

// A simple component to display match results
const MatchResult = ({ match }: { match: RegExpMatchArray }) => {
  return (
    <div className='p-3 my-2 bg-emerald-50 border border-emerald-200 rounded-md'>
      <p className='font-semibold text-emerald-800'>Match found:</p>
      <pre className='text-sm text-emerald-700 bg-emerald-100 p-2 rounded mt-1 overflow-x-auto'>
        {JSON.stringify(match, null, 2)}
      </pre>
      <p className='text-xs text-slate-500 mt-1'>
        (Index: {match.index}, Input: &quot;{match.input}&quot;)
      </p>
    </div>
  );
};

// =================================================================
// START: Regex Explainer Component
// =================================================================
interface ExplanationPart {
  token: string;
  explanation: string;
}

const TOKEN_EXPLANATIONS: Record<string, string> = {
  '\\d': 'Matches any digit (0-9).',
  '\\D': 'Matches any character that is not a digit.',
  '\\w': 'Matches any word character (alphanumeric + underscore).',
  '\\W': 'Matches any character that is not a word character.',
  '\\s': 'Matches any whitespace character (spaces, tabs, newlines).',
  '\\S': 'Matches any character that is not a whitespace character.',
  '.': 'Matches any character except a newline.',
  '^': 'Asserts position at the start of the string.',
  $: 'Asserts position at the end of the string.',
  '+': 'Matches the preceding token 1 or more times.',
  '*': 'Matches the preceding token 0 or more times.',
  '?': 'Matches the preceding token 0 or 1 time. (Makes it optional)',
  '|': 'Acts like a boolean OR. Matches the expression before or after it.',
};

const RegexExplainer = ({ pattern }: { pattern: string }) => {
  const explanation = useMemo((): ExplanationPart[] => {
    if (!pattern) return [];

    const parts: ExplanationPart[] = [];
    let i = 0;
    while (i < pattern.length) {
      let token = pattern[i];
      let explanationText = '';

      if (pattern[i] === '\\' && i + 1 < pattern.length) {
        token = pattern.substring(i, i + 2);
        if (TOKEN_EXPLANATIONS[token]) {
          explanationText = TOKEN_EXPLANATIONS[token];
          i++;
        } else {
          explanationText = `Matches the literal character "${pattern[i + 1]}".`;
          token = pattern[i + 1];
          i++;
        }
      } else if (TOKEN_EXPLANATIONS[token]) {
        explanationText = TOKEN_EXPLANATIONS[token];
      } else {
        switch (token) {
          case '[': {
            const closingBracket = pattern.indexOf(']', i);
            if (closingBracket > -1) {
              const content = pattern.substring(i + 1, closingBracket);
              token = pattern.substring(i, closingBracket + 1);
              explanationText = content.startsWith('^')
                ? `Matches any single character not in the set: "${content.substring(1)}".`
                : `Matches any single character in the set: "${content}".`;
              i = closingBracket;
            }
            break;
          }
          case '(': {
            explanationText = 'Starts a capturing group.';
            break;
          }
          case ')': {
            explanationText = 'Ends a capturing group.';
            break;
          }
          case '{': {
            const closingBrace = pattern.indexOf('}', i);
            if (closingBrace > -1) {
              const quantifier = pattern.substring(i + 1, closingBrace);
              token = pattern.substring(i, closingBrace + 1);
              if (quantifier.includes(',')) {
                const [min, max] = quantifier.split(',');
                explanationText = `Matches the preceding token between ${min} and ${max || 'infinity'} times.`;
              } else {
                explanationText = `Matches the preceding token exactly ${quantifier} times.`;
              }
              i = closingBrace;
            }
            break;
          }
          default:
            explanationText = `Matches the literal character "${token}".`;
            break;
        }
      }

      if (explanationText) {
        parts.push({ token, explanation: explanationText });
      }

      i++;
    }

    return parts;
  }, [pattern]);

  if (!pattern) {
    return (
      <div className='text-slate-500 text-center py-4 italic'>
        Enter a regular expression above to see an explanation.
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {explanation.map((part, index) => (
        <div key={index} className='flex items-start gap-4 p-2 rounded-md bg-slate-50'>
          <code className='px-2 py-1 text-sm bg-slate-200 text-slate-800 rounded font-mono font-semibold'>
            {part.token}
          </code>
          <p className='text-slate-700 text-sm pt-1'>{part.explanation}</p>
        </div>
      ))}
    </div>
  );
};
// =================================================================
// END: Regex Explainer Component
// =================================================================

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState<string>('\\w+');
  const [flags, setFlags] = useState<string>('g');
  const [testString, setTestString] = useState<string>('Hello World 123');
  const [error, setError] = useState<string | null>(null);

  // =================================================================
  // START: LOGIC TO READ FROM URL
  // This effect runs once on page load to check for URL parameters.
  // =================================================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPattern = params.get('pattern');
    const urlFlags = params.get('flags');

    if (urlPattern) {
      setPattern(urlPattern);
    }
    if (urlFlags) {
      setFlags(urlFlags);
    }
  }, []);
  // =================================================================
  // END: LOGIC TO READ FROM URL
  // =================================================================

  const { matches, executionTime } = useMemo(() => {
    if (!pattern) {
      setError(null);
      return { matches: [], executionTime: 0 };
    }

    // --- FIX STARTS HERE ---
    // Moved startTime declaration to the top of the hook's scope.
    const startTime = performance.now();
    // --- FIX ENDS HERE ---

    try {
      const regex = new RegExp(pattern, flags);
      const allMatches = Array.from(testString.matchAll(regex));
      const endTime = performance.now();

      setError(null);
      return {
        matches: allMatches,
        executionTime: endTime - startTime,
      };
    } catch (e: any) {
      setError(e.message);
      return { matches: [], executionTime: 0 };
    }
  }, [pattern, flags, testString]);

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <Breadcrumbs />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Regex Tester & Explainer</h1>
          <p className='text-lg text-slate-600 mt-1'>Test your regular expressions against strings in real-time.</p>
        </header>

        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto'>
          {/* Regex Input Area */}
          <div className='mb-4'>
            <label htmlFor='regex-pattern' className='block text-sm font-semibold text-slate-700 mb-1'>
              Regular Expression
            </label>
            <div className='flex items-center'>
              <span className='text-slate-400 p-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-md'>/</span>
              <input
                type='text'
                id='regex-pattern'
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className='flex-grow p-2 border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out font-mono'
                placeholder='Enter your pattern here'
              />
              <span className='text-slate-400 p-2 bg-slate-100 border border-l-0 border-slate-300'>/</span>
              <input
                type='text'
                id='regex-flags'
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className='w-20 p-2 border border-slate-300 rounded-r-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out font-mono'
                placeholder='flags'
              />
            </div>
          </div>

          {/* Test String Input Area */}
          <div className='mb-6'>
            <label htmlFor='test-string' className='block text-sm font-semibold text-slate-700 mb-1'>
              Test String
            </label>
            <textarea
              id='test-string'
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className='w-full p-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out'
              rows={8}
              placeholder='Enter the string to test against...'
            />
          </div>

          {/* Results Area */}
          <div>
            <h2 className='text-xl font-semibold text-slate-700 border-b pb-2 mb-3'>Results</h2>
            {error ? (
              <div className='p-3 bg-red-100 text-red-700 border border-red-300 rounded-md'>
                <strong>Error:</strong> {error}
              </div>
            ) : matches.length > 0 ? (
              <div>
                <p className='text-sm text-slate-600 mb-2'>
                  Found {matches.length} match{matches.length === 1 ? '' : 'es'} in {executionTime.toFixed(2)}ms.
                </p>
                {matches.map((match, i) => (
                  <MatchResult key={i} match={match} />
                ))}
              </div>
            ) : (
              <p className='text-slate-500 text-center py-4'>No matches found.</p>
            )}
          </div>
        </section>

        {/* Placeholder for the explainer */}
        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto mt-8'>
          <h2 className='text-xl font-semibold text-slate-700 border-b pb-2 mb-3'>Explanation</h2>
          <RegexExplainer pattern={pattern} />
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
