// src/app/image-compressor/page.tsx
'use client';

import React, { useState, ChangeEvent, DragEvent, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

// Define the structure for each image being processed
interface ImageFileState {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'compressing' | 'done' | 'error';
  progress: number;
  originalSize: number;
  compressedSize?: number;
  compressedFile?: File;
  width: number;
  height: number;
}

// A component to display each image card with its progress and actions
const ImageCard = ({
  image,
  onRemove,
  onDownload,
}: {
  image: ImageFileState;
  onRemove: (id: string) => void;
  onDownload: (image: ImageFileState) => void;
}) => {
  return (
    <div className='relative bg-white border rounded-lg shadow-sm overflow-hidden text-center'>
      <button
        onClick={() => onRemove(image.id)}
        className='absolute top-1.5 right-1.5 z-10 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-black/75 transition-colors leading-none'
        title='Remove from list'>
        &times;
      </button>
      <div className='w-full h-32 bg-slate-100 flex items-center justify-center'>
        <Image
          src={image.previewUrl}
          alt={`Preview of ${image.file.name}`}
          width={image.width}
          height={image.height}
          className='max-h-full max-w-full object-contain'
        />
      </div>
      <div className='p-3'>
        <p className='text-xs font-semibold text-slate-700 truncate' title={image.file.name}>
          {image.file.name}
        </p>

        {image.status === 'pending' && (
          <p className='text-xs text-slate-500 mt-1'>{(image.originalSize / 1024).toFixed(1)} KB</p>
        )}

        {image.status === 'compressing' && (
          <div className='mt-2'>
            <div className='w-full bg-slate-200 rounded-full h-2.5'>
              <div
                className='bg-sky-600 h-2.5 rounded-full transition-all duration-150'
                style={{ width: `${image.progress}%` }}></div>
            </div>
            <p className='text-xs text-sky-700 mt-1'>{image.progress}%</p>
          </div>
        )}

        {image.status === 'done' && image.compressedSize !== undefined && (
          <div className='mt-2 text-xs'>
            <p className='text-slate-500'>
              <del>{(image.originalSize / 1024).toFixed(1)} KB</del>
            </p>
            <p className='font-bold text-green-600'>{(image.compressedSize / 1024).toFixed(1)} KB</p>
            <p className='text-green-700'>
              Saved {Math.max(0, (1 - image.compressedSize / image.originalSize) * 100).toFixed(1)}%
            </p>
            <button
              onClick={() => onDownload(image)}
              className='mt-2 w-full px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-md hover:bg-green-600'>
              Download
            </button>
          </div>
        )}

        {image.status === 'error' && <div className='mt-2 text-xs text-red-600 font-semibold'>Failed</div>}
      </div>
    </div>
  );
};

export default function ImageCompressorPage() {
  const [images, setImages] = useState<ImageFileState[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newImageFilesPromises: Promise<ImageFileState>[] = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file, index) => {
        return new Promise((resolve) => {
          const previewUrl = URL.createObjectURL(file);
          const img = document.createElement('img');
          img.onload = () => {
            resolve({
              id: `${file.name}-${file.lastModified}-${index}`,
              file,
              previewUrl,
              status: 'pending',
              progress: 0,
              originalSize: file.size,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
            // No need to revoke previewUrl here, as it's used by the <Image> component
          };
          img.src = previewUrl;
        });
      });

    Promise.all(newImageFilesPromises).then((newImageFiles) => {
      setImages((prev) => [...prev, ...newImageFiles]);
    });
  };

  const handleStartCompression = async () => {
    setIsCompressing(true);

    const BATCH_SIZE = 3; // Process 3 images concurrently
    const pendingImages = images.filter((img) => img.status === 'pending');

    for (let i = 0; i < pendingImages.length; i += BATCH_SIZE) {
      const batch = pendingImages.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((imageToCompress) => compressSingleImage(imageToCompress)));
    }

    setIsCompressing(false);
  };

  const compressSingleImage = async (imageState: ImageFileState) => {
    setImages((prev) => prev.map((img) => (img.id === imageState.id ? { ...img, status: 'compressing' } : img)));

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        onProgress: (p: number) => {
          setImages((prev) =>
            prev.map((img) => (img.id === imageState.id ? { ...img, progress: Math.round(p) } : img))
          );
        },
      };
      const compressedBlob = await imageCompression(imageState.file, options);

      // FIX: Check if the compressed file is actually smaller
      if (compressedBlob.size < imageState.originalSize) {
        const compressedFile = new File([compressedBlob], `compressed_${imageState.file.name}`, {
          type: compressedBlob.type,
        });
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageState.id
              ? {
                  ...img,
                  status: 'done',
                  progress: 100,
                  compressedFile: compressedFile,
                  compressedSize: compressedFile.size,
                }
              : img
          )
        );
      } else {
        // If not smaller, use the original file and show 0% savings
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageState.id
              ? {
                  ...img,
                  status: 'done',
                  progress: 100,
                  compressedFile: imageState.file, // Revert to original file
                  compressedSize: imageState.originalSize, // Revert to original size
                }
              : img
          )
        );
      }
    } catch (error) {
      console.error(`Error compressing ${imageState.file.name}:`, error);
      setImages((prev) => prev.map((img) => (img.id === imageState.id ? { ...img, status: 'error' } : img)));
    }
  };

  const handleDownloadSingle = (image: ImageFileState) => {
    if (!image.compressedFile) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(image.compressedFile);
    link.download = image.compressedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadZip = async () => {
    const successfullyCompressed = images.filter((img) => img.status === 'done' && img.compressedFile);
    if (successfullyCompressed.length === 0 || isCompressing) return;

    setIsDownloading(true);

    const zip = new JSZip();
    successfullyCompressed.forEach((image) => {
      zip.file(image.compressedFile!.name, image.compressedFile!);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'compressed_images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    setIsDownloading(false);
    setImages([]); // Reset UI after download
  };

  const removeImage = (idToRemove: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === idToRemove);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter((img) => img.id !== idToRemove);
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    if (event.target) {
      event.target.value = '';
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
    handleFiles(event.dataTransfer.files);
  };

  const pendingCount = images.filter((img) => img.status === 'pending').length;
  const doneCount = images.filter((img) => img.status === 'done').length;

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <Breadcrumbs />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Batch Image Compressor</h1>
          <p className='text-lg text-slate-600 mt-1'>
            Reduce multiple image file sizes and download them individually or as a single zip file.
          </p>
        </header>

        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-6xl mx-auto'>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-4 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ease-in-out mb-6
                      ${
                        isDragging
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50'
                      }
                      cursor-pointer`}>
            <input
              ref={fileInputRef}
              type='file'
              id='imageUpload'
              multiple
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
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
                {isDragging ? 'Release to drop files' : 'Drag & drop images here, or click to select'}
              </p>
              <p className='text-sm'>All processing is done in your browser.</p>
            </div>
          </div>

          {images.length > 0 && (
            <div>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {images.map((image) => (
                  <ImageCard key={image.id} image={image} onRemove={removeImage} onDownload={handleDownloadSingle} />
                ))}
              </div>

              <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mt-8'>
                <button
                  onClick={handleStartCompression}
                  disabled={isCompressing || isDownloading || pendingCount === 0}
                  className='px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-300 disabled:cursor-not-allowed'>
                  {isCompressing ? 'Compressing...' : `Compress ${pendingCount} Remaining`}
                </button>
                <button
                  onClick={handleDownloadZip}
                  disabled={isCompressing || isDownloading || doneCount < 2}
                  className='px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed'>
                  {isDownloading ? 'Downloading...' : `Download All (${doneCount}) as .zip`}
                </button>
                <button
                  onClick={() => setImages([])}
                  disabled={isCompressing || isDownloading}
                  className='px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50'>
                  Clear All
                </button>
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
