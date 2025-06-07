// src/app/csv-converter/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

const SAMPLE_CSV = `Year,Make,Model,Length
1997,Ford,E350,2.34
2000,Mercury,Cougar,2.38`;

// Helper function to convert JSON to a simple XML string
const jsonToXml = (json: Record<string, unknown>[]): string => {
  if (!json || json.length === 0) return '';
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  json.forEach((item) => {
    xml += '  <item>\n';
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        xml += `    <${key}>${item[key]}</${key}>\n`;
      }
    }
    xml += '  </item>\n';
  });
  xml += '</root>';
  return xml;
};

export default function CsvConverterPage() {
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [activeTab, setActiveTab] = useState<'json' | 'xml'>('json');
  const [copySuccess, setCopySuccess] = useState('');

  const parsedJson = useMemo(() => {
    try {
      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      if (result.errors.length > 0) {
        console.warn('CSV Parsing Errors:', result.errors);
      }
      return result.data;
    } catch (error) {
      console.error('CSV Parsing Failed:', error);
      return [];
    }
  }, [csvText]);

  const jsonOutput = useMemo(() => {
    return JSON.stringify(parsedJson, null, 2);
  }, [parsedJson]);

  const xmlOutput = useMemo(() => {
    return jsonToXml(parsedJson as Record<string, unknown>[]);
  }, [parsedJson]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'json' ? jsonOutput : xmlOutput;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopySuccess(`${activeTab.toUpperCase()} copied!`);
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch((err) => {
        setCopySuccess('Failed to copy.');
        console.error('Copy failed:', err);
      });
  };

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <Breadcrumbs />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>CSV to JSON/XML Converter</h1>
          <p className='text-lg text-slate-600 mt-1'>Paste your CSV data to convert it into structured formats.</p>
        </header>

        <section className='grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] max-w-7xl mx-auto'>
          {/* CSV Input */}
          <div className='flex flex-col'>
            <h2 className='font-semibold text-slate-700 bg-slate-100 p-2 border border-b-0 rounded-t-lg'>CSV Input</h2>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className='w-full h-full p-4 border border-slate-300 rounded-b-lg font-mono focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out resize-none'
              placeholder='Paste your CSV data here...'
            />
          </div>

          {/* Output */}
          <div className='flex flex-col'>
            <div className='flex-shrink-0 flex justify-between items-center bg-slate-100 p-2 border border-b-0 rounded-t-lg'>
              <div className='flex space-x-1'>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    activeTab === 'json' ? 'bg-white font-semibold text-slate-800' : 'text-slate-600'
                  }`}>
                  JSON
                </button>
                <button
                  onClick={() => setActiveTab('xml')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    activeTab === 'xml' ? 'bg-white font-semibold text-slate-800' : 'text-slate-600'
                  }`}>
                  XML
                </button>
              </div>
              <button
                onClick={handleCopy}
                className='px-3 py-1 text-xs font-medium text-slate-600 bg-white rounded-md border border-slate-300 hover:bg-slate-50'>
                Copy
              </button>
            </div>
            {copySuccess && (
              <p className='absolute right-10 mt-14 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md shadow-lg'>
                {copySuccess}
              </p>
            )}
            <div className='w-full h-full border bg-white border-slate-300 rounded-b-lg'>
              <pre className='w-full h-full p-4 text-sm whitespace-pre-wrap overflow-auto font-mono'>
                <code>{activeTab === 'json' ? jsonOutput : xmlOutput}</code>
              </pre>
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
