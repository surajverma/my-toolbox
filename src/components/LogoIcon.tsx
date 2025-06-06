// src/components/LogoIcon.tsx
import React from 'react';

interface LogoIconProps {
  className?: string;
}

const LogoIcon = ({ className = 'w-8 h-8' }: LogoIconProps) => {
  return (
    <svg viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' className={className} aria-hidden='true'>
      <path d='M40 23V14H31' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M8 25V34H17' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
      <rect x='4' y='8' width='40' height='32' rx='2' stroke='currentColor' strokeWidth='4' />
    </svg>
  );
};

export default LogoIcon;
