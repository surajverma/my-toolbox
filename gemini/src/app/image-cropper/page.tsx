// src/app/image-cropper/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactCrop, { type Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Helper to center the crop area on image load
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropperPage() {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const selectedFile = e.target.files[0];
      setOriginalFile(selectedFile);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(selectedFile);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  // This effect will draw the cropped image onto the preview canvas
  useEffect(() => {
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;

    if (!completedCrop || !canvas || !image) {
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(completedCrop.width * scaleX, completedCrop.height * scaleY);
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    // We'll just use this canvas for the download now, not for preview.
  }, [completedCrop]);

  async function handleDownloadCrop() {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      throw new Error('Crop details not available');
    }

    // Create a new canvas to draw the cropped image
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY, // Fixed typo: completed_crop -> completedCrop
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, originalFile?.type || 'image/png'));

    if (!blob) {
      console.error('Canvas is empty');
      return;
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const nameWithoutExtension = originalFile?.name.replace(/\.[^/.]+$/, '') || 'image';
    link.download = `${nameWithoutExtension}_cropped.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <Navbar />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-slate-800'>Image Cropper</h1>
          <p className='text-lg text-slate-600 mt-1'>Upload an image and select an area to crop.</p>
        </header>

        <section className='bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto'>
          <div className='mb-4'>
            <label htmlFor='image-upload' className='block text-sm font-medium text-slate-700'>
              Select Image
            </label>
            <input
              id='image-upload'
              type='file'
              accept='image/*'
              onChange={onSelectFile}
              className='mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100'
            />
          </div>

          {imgSrc && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
              {/* Cropper UI */}
              <div className='md:col-span-2 flex justify-center bg-slate-100 p-2 rounded-lg'>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}>
                  <img ref={imgRef} alt='Crop me' src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }} />
                </ReactCrop>
              </div>
              {/* Controls and Download */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-slate-700'>Options</h3>
                <div>
                  <button
                    onClick={() => setAspect(16 / 9)}
                    className={`w-full p-2 text-sm rounded-md border ${
                      aspect === 16 / 9 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white'
                    }`}>
                    16:9
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setAspect(4 / 3)}
                    className={`w-full p-2 text-sm rounded-md border ${
                      aspect === 4 / 3 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white'
                    }`}>
                    4:3
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setAspect(1)}
                    className={`w-full p-2 text-sm rounded-md border ${
                      aspect === 1 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white'
                    }`}>
                    Square
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setAspect(undefined)}
                    className={`w-full p-2 text-sm rounded-md border ${
                      aspect === undefined ? 'bg-sky-600 text-white border-sky-600' : 'bg-white'
                    }`}>
                    Free
                  </button>
                </div>
                {/* START: Added hidden canvas and preview */}
                {!!completedCrop && (
                  <div className='pt-4 border-t'>
                    <h3 className='text-lg font-semibold text-slate-700 mb-2'>Preview</h3>
                    <div className='flex justify-center'>
                      <canvas
                        ref={previewCanvasRef}
                        style={{
                          display: 'none', // We don't need to show this canvas
                          border: '1px solid black',
                          objectFit: 'contain',
                          width: completedCrop.width,
                          height: completedCrop.height,
                        }}
                      />
                    </div>
                    <button
                      onClick={handleDownloadCrop}
                      disabled={!completedCrop || !completedCrop.width || !completedCrop.height}
                      className='w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:bg-green-300'>
                      Download Cropped Image
                    </button>
                  </div>
                )}
                {/* END: Added hidden canvas and preview */}
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
