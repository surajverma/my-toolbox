import type { Metadata } from 'next';

import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ToolStack - Free Privacy-Focused Online Tools',
  description: 'ToolStack is a collection of simple, free, and privacy-focused online tools that work entirely in your browser.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
  <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
