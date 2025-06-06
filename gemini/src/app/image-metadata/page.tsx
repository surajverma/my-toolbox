// src/app/image-metadata/page.tsx
'use client';

import React, { useState, ChangeEvent, DragEvent, useRef } from 'react';
import Link from 'next/link';
import EXIF from 'exif-js';
import piexif from 'piexifjs';
import JSZip from 'jszip';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Metadata {
  [key: string]: any;
}

interface ProcessedImage {
  id: string;
  name: string;
  type: string;
  src: string;
  metadata: Metadata | null;
  hasMetadata: boolean;
}

// Component to display a card for each processed image
const ImageResultCard = ({
  image,
  onRemove,
  onDownloadSingle,
}: {
  image: ProcessedImage;
  onRemove: (id: string) => void;
  onDownloadSingle: (image: ProcessedImage) => void;
}) => {
  return (
    <div className='relative bg-white border rounded-lg shadow-sm overflow-hidden'>
      {/* Remove from list button */}
      <button
        onClick={() => onRemove(image.id)}
        className='absolute top-1.5 right-1.5 z-10 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-black/75 transition-colors leading-none'
        title='Remove from list'>
        &times;
      </button>

      <img src={image.src} alt={`Preview of ${image.name}`} className='w-full h-40 object-cover bg-slate-100' />
      <div className='p-4'>
        <p className='text-sm font-semibold text-slate-800 truncate' title={image.name}>
          {image.name}
        </p>
        <p className={`text-xs mt-1 ${image.hasMetadata ? 'text-orange-600' : 'text-green-600'}`}>
          {image.hasMetadata ? 'Contains Metadata' : 'No Metadata Found'}
        </p>
        <button
          onClick={() => onDownloadSingle(image)}
          disabled={!image.hasMetadata}
          className='mt-4 w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed'>
          Download Scrubbed
        </button>
      </div>
    </div>
  );
};

export default function ImageMetadataPage() {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setProcessedImages([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = (files: FileList) => {
    setError(null);
    const newImages: ProcessedImage[] = [];

    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith('image/jpeg')) {
        // Silently ignore non-jpeg files in a batch upload, or show a collective error later.
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;

        EXIF.getData(file as any, function (this: any) {
          const allTags = EXIF.getAllTags(this);
          const hasMetadata = allTags && Object.keys(allTags).length > 0;

          newImages.push({
            id: `${file.name}-${file.lastModified}-${index}`,
            name: file.name,
            type: file.type,
            src,
            metadata: allTags,
            hasMetadata,
          });

          // When the last file is processed, update the state
          if (newImages.length === Array.from(files).filter((f) => f.type.startsWith('image/jpeg')).length) {
            setProcessedImages((prev) => [...prev, ...newImages]);
          }
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownloadSingle = (image: ProcessedImage) => {
    if (!image.hasMetadata) return;

    const scrubbedDataUrl = piexif.remove(image.src);
    const link = document.createElement('a');
    link.href = scrubbedDataUrl;

    const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, '');
    const extension = image.type.split('/')[1] || 'jpg';
    link.download = `${nameWithoutExtension}_scrubbed.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (processedImages.length === 0) return;

    const zip = new JSZip();
    let scrubbedCount = 0;

    processedImages.forEach((image) => {
      if (image.hasMetadata) {
        const scrubbedDataUrl = piexif.remove(image.src);
        const base64Data = scrubbedDataUrl.split(',')[1];
        const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, '');
        const extension = image.type.split('/')[1] || 'jpg';

        zip.file(`${nameWithoutExtension}_scrubbed.${extension}`, base64Data, { base64: true });
        scrubbedCount++;
      }
    });

    if (scrubbedCount > 0) {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'scrubbed_images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        resetState(); // Reset after download
      });
    } else {
      setError('No images had metadata to remove.');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
    }
  };

  const removeImage = (idToRemove: string) => {
    setProcessedImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const imagesWithMetadataCount = processedImages.filter((img) => img.hasMetadata).length;

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Image Metadata Remover</h1>
          <p className='text-lg text-slate-600 mt-1'>Scrub metadata from multiple images at once.</p>
        </header>

        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-6xl mx-auto'>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mb-6 border-4 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ease-in-out
                ${isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50'}
                 cursor-pointer`}>
            <input
              ref={fileInputRef}
              type='file'
              id='imageUpload'
              accept='image/jpeg'
              onChange={handleFileChange}
              className='hidden'
              multiple // Enable multiple file selection
            />
            <div className='flex flex-col items-center justify-center text-slate-500 pointer-events-none'>
              <svg
                className='w-16 h-16 mb-4 text-slate-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.5'
                  d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'></path>
              </svg>
              <p className='text-lg font-semibold'>
                {isDragging ? 'Release to drop files' : 'Drag & drop JPEG images here, or click to select'}
              </p>
              <p className='text-sm'>All processing is done in your browser.</p>
            </div>
          </div>

          {error && <div className='my-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md'>{error}</div>}

          {processedImages.length > 0 && (
            <div>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {processedImages.map((image) => (
                  <ImageResultCard
                    key={image.id}
                    image={image}
                    onRemove={removeImage}
                    onDownloadSingle={handleDownloadSingle}
                  />
                ))}
              </div>
              <div className='text-center mt-8'>
                <button
                  onClick={handleDownloadAll}
                  disabled={imagesWithMetadataCount === 0}
                  className='px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-150 ease-in-out disabled:bg-red-300 disabled:cursor-not-allowed'>
                  Download All Scrubbed Images ({imagesWithMetadataCount})
                </button>
                {imagesWithMetadataCount === 0 && (
                  <p className='text-sm text-slate-500 mt-2'>No images with removable metadata selected.</p>
                )}
              </div>
            </div>
          )}
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
