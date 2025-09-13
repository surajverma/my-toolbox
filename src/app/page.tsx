// src/app/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import TagCloud from '@/components/TagCloud';
import ToolList from '@/components/ToolList';
import type { Tag } from '@/components/TagCloud'; // Import Tag type from TagCloud

export interface Tool {
  id: string;
  name: string;
  description: string;
  slug: string;
  tags: string[];
  icon?: string;
}

const TOOL_CATALOG: Tool[] = [
  {
    id: '1',
    name: 'Image Compressor',
    description: 'Reduce image file sizes quickly and easily.',
    slug: '/image-compressor',
    tags: ['image', 'compress', 'optimize', 'media'],
  },
  {
    id: '2',
    name: 'Regex Tester & Explainer',
    description: 'Test your regular expressions and get explanations.',
    slug: '/regex-tester',
    tags: ['text', 'developer', 'regex', 'code'],
  },
  {
    id: '3',
    name: 'Text Diff Checker',
    description: 'Compare two pieces of text and highlight differences.',
    slug: '/text-diff',
    tags: ['text', 'developer', 'compare', 'diff'],
  },
  {
    id: '4',
    name: 'Color Code Converter',
    description: 'Convert HEX, RGB, HSL color codes instantly.',
    slug: '/color-converter',
    tags: ['color', 'design', 'developer', 'converter'],
  },
  {
    id: '5',
    name: 'Placeholder Image Generator',
    description: 'Create custom placeholder images on the fly.',
    slug: '/placeholder-generator',
    tags: ['image', 'design', 'developer', 'placeholder'],
  },
  {
    id: '6',
    name: 'Text Statistics / Analyzer',
    description: 'Get instant stats on your text, like word count, characters, and more.',
    slug: '/text-analyzer',
    tags: ['text', 'stats', 'analyzer', 'counter'],
  },
  {
    id: '7',
    name: 'Image Metadata Remover',
    description: 'View and remove EXIF metadata from your JPEG images to protect your privacy.',
    slug: '/image-metadata',
    tags: ['image', 'privacy', 'exif', 'metadata', 'security'],
  },
  {
    id: '8',
    name: 'Markdown Editor',
    description: 'A simple Markdown editor with a live preview and HTML export.',
    slug: '/markdown-editor',
    tags: ['text', 'markdown', 'editor', 'developer', 'writing'],
  },
  {
    id: '9',
    name: 'CSV to JSON/XML Converter',
    description: 'Convert CSV data into JSON or XML formats.',
    slug: '/csv-converter',
    tags: ['csv', 'json', 'xml', 'converter', 'data', 'developer'],
  },
  {
    id: '10',
    name: 'Text Contrast Checker',
    description: 'Check if the contrast between two colors meets accessibility standards.',
    slug: '/contrast-checker',
    tags: ['accessibility', 'color', 'design', 'developer', 'wcag'],
  },
  {
    id: '11',
    name: 'Image Resizer',
    description: 'Quickly resize images to your specified dimensions, all in your browser.',
    slug: '/image-resizer',
    tags: ['image', 'resize', 'dimensions', 'optimize'],
  },
  {
    id: '12',
    name: 'Image Cropper',
    description: 'Crop images to your desired dimensions with an easy-to-use interface.',
    slug: '/image-cropper',
    tags: ['image', 'crop', 'edit', 'dimensions'],
  },
  {
    id: '13',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text with options for paragraphs, sentences, or words.',
    slug: '/lorem-ipsum-generator',
    tags: ['text', 'generator', 'lorem ipsum', 'placeholder', 'design'],
  },
  {
    id: '14',
    name: 'Easy Regex Generator',
    description: 'Create common regular expressions by building a sentence, no syntax required.',
    slug: '/regex-generator',
    tags: ['regex', 'generator', 'developer', 'text', 'code'],
  },
  {
    id: '15',
    name: 'Find & Replace in Text',
    description: 'Perform a find and replace on a block of text, with optional Regex support.',
    slug: '/find-replace',
    tags: ['text', 'find', 'replace', 'regex', 'developer'],
  },
  {
    id: '16',
    name: 'Data Anonymizer',
    description: 'Automatically find and scrub sensitive data like emails and IP addresses from text.',
    slug: '/data-anonymizer',
    tags: ['text', 'privacy', 'security', 'anonymize', 'redact'],
  },
  {
    id: '17',
    name: 'CSS Specificity Calculator',
    description: 'Calculate and understand the specificity of CSS selectors.',
    slug: '/css-specificity-calculator',
    tags: ['css', 'developer', 'specificity', 'design', 'explainer'],
  },
  {
    id: '18',
    name: 'Unit Converter',
    description: 'A comprehensive tool to convert between various units of measurement.',
    slug: '/unit-converter',
    tags: ['converter', 'units', 'measurement', 'math'],
  },
  {
    id: '19',
    name: 'HTTP Status Code Explainer',
    description: 'Quickly find and understand the meaning of HTTP status codes.',
    slug: '/http-status-codes',
    tags: ['http', 'developer', 'explainer', 'code', 'network'],
  },
  {
    id: '20',
    name: 'List Cleaner & Formatter',
    description: 'Quickly sort, clean, and format lists of text with various options.',
    slug: '/list-cleaner',
    tags: ['text', 'list', 'format', 'cleaner', 'sort', 'organize'],
  },
  {
    id: '21',
    name: 'HTML Tag Explainer',
    description: 'A quick reference guide for all standard HTML tags and their uses.',
    slug: '/html-tag-explainer',
    tags: ['html', 'developer', 'explainer', 'reference', 'code'],
  },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [shuffledTags, setShuffledTags] = useState<Tag[]>([]);

  // Calculate the base tags with weights
  const popularTags = useMemo((): Tag[] => {
    const tagCounts: { [key: string]: number } = {};

    TOOL_CATALOG.forEach((tool) => {
      tool.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // We now sort here to have a consistent order for the initial render
    return Object.entries(tagCounts)
      .map(([text, weight]) => ({
        text,
        weight,
        slug: `/tags/${text}`,
      }))
      .sort((a, b) => b.weight - a.weight);
  }, []);

  // --- START: HYDRATION-SAFE SHUFFLE ---
  // This effect runs only on the client, after the initial render,
  // to prevent a mismatch between server and client HTML.
  useEffect(() => {
    const tagsToShuffle = [...popularTags];
    for (let i = tagsToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tagsToShuffle[i], tagsToShuffle[j]] = [tagsToShuffle[j], tagsToShuffle[i]];
    }
    setShuffledTags(tagsToShuffle);
  }, [popularTags]); // Depend on popularTags to re-shuffle if the base list ever changed
  // --- END: HYDRATION-SAFE SHUFFLE ---

  const filteredTools = useMemo(() => {
    let tools = TOOL_CATALOG;

    if (selectedTag) {
      tools = tools.filter((tool) => tool.tags.includes(selectedTag));
    }

    if (searchTerm) {
      tools = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return tools;
  }, [searchTerm, selectedTag]);

  const handleTagClick = (tagText: string) => {
    if (selectedTag === tagText) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tagText);
    }
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />

      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600 font-heading drop-shadow-lg tracking-tight'>ToolStack</h1>
          <p className='text-xl text-slate-500 mt-2 font-medium'>
            Privacy-first, beautiful, and blazing fast browser tools. Your data never leaves your device.
          </p>
        </header>

        <section className='mb-12'>
          <SearchBar onSearch={handleSearch} />
        </section>

        <section className='mb-12 p-6 bg-white rounded-lg shadow'>
          <h2 className='text-2xl font-semibold text-slate-700 mb-6 text-center'>Tool Categories</h2>
          {/* Pass the shuffled tags to the component */}
          <TagCloud
            tags={shuffledTags.length > 0 ? shuffledTags : popularTags}
            onTagClick={handleTagClick}
            selectedTag={selectedTag}
          />
        </section>

        <section>
          <h2 className='text-2xl font-semibold text-slate-700 mb-6'>
            {selectedTag ? `Tools tagged with "${selectedTag}"` : 'All Tools'}
          </h2>
          <ToolList tools={filteredTools} />
          {filteredTools.length === 0 && (
            <div className='text-center p-8 bg-white rounded-lg shadow'>
              <p className='text-slate-500'>No tools found matching your criteria.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
