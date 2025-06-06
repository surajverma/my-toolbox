// src/components/Breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Breadcrumbs = () => {
  const pathname = usePathname();

  // Don't show breadcrumbs on the home page
  if (pathname === '/') {
    return null;
  }

  // Generate a friendly name from the slug
  const pageName = pathname
    .replace('/', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <nav aria-label='Breadcrumb' className='container mx-auto px-4 pt-6 pb-2'>
      <ol className='flex items-center space-x-2 text-sm text-slate-500'>
        <li>
          <Link href='/' className='hover:text-primary-600 hover:underline'>
            Home
          </Link>
        </li>
        <li>
          <svg
            className='h-5 w-5 flex-shrink-0 text-slate-400'
            fill='currentColor'
            viewBox='0 0 20 20'
            aria-hidden='true'>
            <path d='M5.555 17.776l8-16 .894.448-8 16-.894-.448z' />
          </svg>
        </li>
        <li>
          <span className='font-medium text-slate-700'>{pageName}</span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
