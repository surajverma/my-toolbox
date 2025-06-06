// src/app/markdown-editor/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import showdown from 'showdown';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

const SAMPLE_MARKDOWN = `# Welcome to the Markdown Editor!

This is a **live preview** of your Markdown text.

## Features
- Real-time rendering
- Supports all standard Markdown syntax
- HTML output copying

### Example Code Block
\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`

> This is a blockquote. Feel free to edit this text and see what happens!
`;

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [copySuccess, setCopySuccess] = useState('');

  const converter = useMemo(
    () =>
      new showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true,
      }),
    []
  );

  const html = useMemo(() => converter.makeHtml(markdown), [markdown, converter]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html).then(
      () => {
        setCopySuccess('HTML copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 2000); // Clear message after 2 seconds
      },
      (err) => {
        setCopySuccess('Failed to copy HTML.');
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <Breadcrumbs />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Markdown Editor</h1>
          <p className='text-lg text-slate-600 mt-1'>
            Type Markdown on the left and see the rendered HTML on the right.
          </p>
        </header>

        <section className='grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] max-w-7xl mx-auto'>
          {/* Markdown Input */}
          <div className='flex flex-col'>
            <div className='flex-shrink-0 flex justify-between items-center bg-slate-100 p-2 border border-b-0 rounded-t-lg'>
              <h2 className='font-semibold text-slate-700'>Markdown</h2>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className='w-full h-full p-4 border border-slate-300 rounded-b-lg font-mono focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out resize-none'
              placeholder='Type your Markdown here...'
            />
          </div>

          {/* HTML Preview */}
          <div className='flex flex-col'>
            <div className='flex-shrink-0 flex justify-between items-center bg-slate-100 p-2 border border-b-0 rounded-t-lg'>
              <h2 className='font-semibold text-slate-700'>Preview</h2>
              <button
                onClick={handleCopyHtml}
                className='px-3 py-1 text-xs font-medium text-slate-600 bg-white rounded-md border border-slate-300 hover:bg-slate-50'>
                Copy HTML
              </button>
            </div>
            {copySuccess && (
              <p className='absolute right-10 mt-14 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md shadow-lg'>
                {copySuccess}
              </p>
            )}
            <div
              className='w-full h-full p-4 bg-white border border-slate-300 rounded-b-lg overflow-y-auto prose max-w-none'
              dangerouslySetInnerHTML={{ __html: html }}
            />
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
